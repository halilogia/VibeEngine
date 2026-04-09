import React from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useSceneStore, useEditorStore, type ComponentData } from '@infrastructure/store';
import { SovereignHeader } from '@ui/atomic/molecules/SovereignHeader';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeInput } from '@ui/atomic/atoms/VibeInput';
import { VibeTheme } from '@themes/VibeStyles';
import { inspectorStyles as styles } from './InspectorPanel.styles';
import {
    Vector3Field,
    ComponentSection,
    ErthBehaviorPanel,
    type ComponentUpdatePayload,
} from './InspectorPanel.parts';

// ---- ADDABLE COMPONENT TYPES ----

const ADDABLE_COMPONENTS: { label: string; type: string; defaultData: Record<string, unknown> }[] = [
    { label: 'Mesh Renderer', type: 'Mesh', defaultData: {} },
    { label: 'Box Collider', type: 'Collider', defaultData: { shape: 'box' } },
    { label: 'Rigidbody', type: 'Rigidbody', defaultData: { bodyType: 'dynamic', mass: 1 } },
    { label: 'Waypoint', type: 'Waypoint', defaultData: { radius: 2.0, nextWaypointId: null } },
    { label: 'Traffic Follower (AI)', type: 'TrafficFollower', defaultData: { speed: 5.0, currentWaypointId: null, rotationSpeed: 3.0 } },
    { label: 'Light', type: 'Light', defaultData: { type: 'point', color: '#ffffff', intensity: 1 } },
    { label: 'Audio Source', type: 'Audio', defaultData: {} },
];

// ---- ADD COMPONENT DROPDOWN ----

interface AddComponentDropdownProps {
    components: ComponentData[];
    onAdd: (type: string, data: Record<string, unknown>) => void;
    onClose: () => void;
}

const AddComponentDropdown: React.FC<AddComponentDropdownProps> = ({ onAdd, onClose }) => (
    <div style={{
        position: 'absolute', top: '100%', left: 0, right: 0,
        background: VibeTheme.colors.bgSecondary,
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        borderRadius: '8px', zIndex: 200, marginTop: '4px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        overflow: 'hidden',
    }}>
        {ADDABLE_COMPONENTS.map(item => (
            <div
                key={item.type}
                onClick={() => { onAdd(item.type, item.defaultData); onClose(); }}
                style={{ padding: '10px 14px', fontSize: '12px', cursor: 'pointer', color: VibeTheme.colors.textMain, borderBottom: `1px solid ${VibeTheme.colors.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = VibeTheme.colors.bgSubtle; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
                <VibeIcons name="Plus" size={11} style={{ opacity: 0.5 }} />
                {item.label}
            </div>
        ))}
    </div>
);

// ---- INSPECTOR PANEL ----

const CORE_COMPONENT_TYPES = new Set(['Transform', 'Collider', 'Rigidbody', 'Mesh', 'Light', 'Audio', 'Camera']);

export const InspectorPanel: React.FC<{ dragHandleProps?: React.HTMLAttributes<HTMLDivElement> }> = ({ dragHandleProps }) => {
    const { entities, updateEntity, addEntity } = useSceneStore();
    const { selectedEntityId, activePanelId, setActivePanel, selectEntity } = useEditorStore();
    const [activeTab, setActiveTab] = React.useState<'Properties' | 'Behaviors' | 'Lambdas'>('Properties');
    const [showAddComponent, setShowAddComponent] = React.useState(false);

    const selectedEntity = selectedEntityId ? entities.get(selectedEntityId) : null;

    // ---- EMPTY STATE ----
    if (!selectedEntity) {
        return (
            <div className={`editor-panel inspector-panel ${activePanelId === 'inspector' ? 'active-panel' : ''}`} onClick={() => setActivePanel('inspector')} style={styles.panel}>
                <SovereignHeader title="INSPECTOR" icon="Activity" dragHandleProps={dragHandleProps} />
                <div style={styles.emptyState}>
                    <VibeIcons name="Box" size={48} style={{ opacity: 0.4, color: VibeTheme.colors.textSecondary }} />
                    <h3 style={{ margin: 0, color: VibeTheme.colors.textMain, fontSize: '14px' }}>NO ENTITY SELECTED</h3>
                    <p style={{ margin: 0, color: VibeTheme.colors.textSecondary, fontSize: '12px', maxWidth: '200px', lineHeight: 1.5 }}>
                        Select an object in the Hierarchy or Viewport to view and edit its properties.
                    </p>
                </div>
            </div>
        );
    }

    const coreComps = selectedEntity.components.filter(c => CORE_COMPONENT_TYPES.has(c.type));
    const behaviorComps = selectedEntity.components.filter(c => !CORE_COMPONENT_TYPES.has(c.type));

    const handleAddComponent = (type: string, data: Record<string, unknown>) => {
        const newComp: ComponentData = { type, data, enabled: true };
        updateEntity(selectedEntity.id, { components: [...selectedEntity.components, newComp] });
    };

    const handleRemoveComponent = (comp: ComponentData) => {
        updateEntity(selectedEntity.id, { components: selectedEntity.components.filter(c => c !== comp) });
    };

    const handleUpdateBehavior = (comp: ComponentData, idx: number, data: ComponentUpdatePayload) => {
        const newComps = [...selectedEntity.components];
        newComps[idx] = { ...comp, data };
        updateEntity(selectedEntity.id, { components: newComps });
    };

    const handleAddLinkedWaypoint = (comp: ComponentData, idx: number) => {
        const newId = addEntity('Waypoint', selectedEntity.parentId);
        const transform: ComponentData = { type: 'Transform', data: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }, enabled: true };
        const waypoint: ComponentData = { type: 'Waypoint', data: { radius: 2.0, nextWaypointId: null }, enabled: true };
        updateEntity(newId, { components: [transform, waypoint] });

        // Link current waypoint to the new one
        const newComps = [...selectedEntity.components];
        newComps[idx] = { ...comp, data: { ...(comp.data as ComponentUpdatePayload), nextWaypointId: newId } };
        updateEntity(selectedEntity.id, { components: newComps });

        selectEntity(newId);
    };

    // ---- TABS ----
    const TABS = ['Properties', 'Behaviors', 'Lambdas'] as const;

    return (
        <div className={`editor-panel inspector-panel ${activePanelId === 'inspector' ? 'active-panel' : ''}`} onClick={() => setActivePanel('inspector')} style={styles.panel}>
            <SovereignHeader title="INSPECTOR" icon="Activity" dragHandleProps={dragHandleProps} />

            {/* Tab bar */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${VibeTheme.colors.border}`, padding: '0 16px', background: VibeTheme.colors.bgPrimary }}>
                {TABS.map(tab => (
                    <div
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '12px 16px', cursor: 'pointer', fontSize: '12px',
                            fontWeight: activeTab === tab ? 700 : 500,
                            color: activeTab === tab ? VibeTheme.colors.textMain : VibeTheme.colors.textSecondary,
                            borderBottom: activeTab === tab ? `2px solid ${VibeTheme.colors.accent}` : '2px solid transparent',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {tab}
                    </div>
                ))}
            </div>

            <div style={{ ...styles.content, paddingTop: '16px' }}>
                {/* PROPERTIES TAB */}
                {activeTab === 'Properties' && (
                    <>
                        <div style={styles.sectionBody}>
                            <span style={styles.fieldLabel}>NAME</span>
                            <VibeInput value={selectedEntity.name} onChange={(e) => updateEntity(selectedEntity.id, { name: e.target.value })} />
                        </div>

                        {coreComps.map((comp, idx) => {
                            if (comp.type === 'Transform') {
                                const data = comp.data as { position?: number[]; rotation?: number[]; scale?: number[] };
                                return (
                                    <ComponentSection key={`prop-${idx}`} title="TRANSFORM" icon="Move">
                                        <Vector3Field label="POSITION" value={data.position ?? [0, 0, 0]} onChange={(val) => {
                                            const newComps = [...selectedEntity.components];
                                            newComps[idx] = { ...comp, data: { ...data, position: val } };
                                            updateEntity(selectedEntity.id, { components: newComps });
                                        }} />
                                        <Vector3Field label="ROTATION" value={data.rotation ?? [0, 0, 0]} onChange={(val) => {
                                            const newComps = [...selectedEntity.components];
                                            newComps[idx] = { ...comp, data: { ...data, rotation: val } };
                                            updateEntity(selectedEntity.id, { components: newComps });
                                        }} />
                                        <Vector3Field label="SCALE" value={data.scale ?? [1, 1, 1]} onChange={(val) => {
                                            const newComps = [...selectedEntity.components];
                                            newComps[idx] = { ...comp, data: { ...data, scale: val } };
                                            updateEntity(selectedEntity.id, { components: newComps });
                                        }} />
                                    </ComponentSection>
                                );
                            }
                            return <ComponentSection key={`prop-${idx}`} component={comp} onRemove={() => handleRemoveComponent(comp)} />;
                        })}

                        <div style={{ marginTop: '12px', position: 'relative' }}>
                            <VibeButton variant="secondary" style={{ width: '100%' }} onClick={() => setShowAddComponent(v => !v)}>
                                <VibeIcons name="Plus" size={14} /> ADD COMPONENT
                            </VibeButton>
                            {showAddComponent && (
                                <AddComponentDropdown
                                    components={selectedEntity.components}
                                    onAdd={handleAddComponent}
                                    onClose={() => setShowAddComponent(false)}
                                />
                            )}
                        </div>
                    </>
                )}

                {/* BEHAVIORS TAB */}
                {activeTab === 'Behaviors' && (
                    <>
                        {behaviorComps.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: VibeTheme.colors.textSecondary }}>
                                <VibeIcons name="Cpu" size={32} style={{ opacity: 0.3, marginBottom: '16px' }} />
                                <div style={{ fontSize: '13px', fontWeight: 600, color: VibeTheme.colors.textMain, marginBottom: '8px' }}>No Behaviors Attached</div>
                                <div style={{ fontSize: '11px', lineHeight: 1.5 }}>Add a Waypoint, TrafficFollower, or custom script from "Add Component" in the Properties tab.</div>
                            </div>
                        ) : (
                            behaviorComps.map((comp, idx) => {
                                const globalIdx = selectedEntity.components.indexOf(comp);
                                return (
                                    <ErthBehaviorPanel
                                        key={`beh-${idx}`}
                                        component={comp}
                                        onRemove={() => handleRemoveComponent(comp)}
                                        onUpdate={(data) => handleUpdateBehavior(comp, globalIdx, data)}
                                        onCustomAction={comp.type === 'Waypoint' ? () => handleAddLinkedWaypoint(comp, globalIdx) : undefined}
                                    />
                                );
                            })
                        )}
                    </>
                )}

                {/* LAMBDAS TAB */}
                {activeTab === 'Lambdas' && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: VibeTheme.colors.textSecondary }}>
                        <VibeIcons name="Box" size={32} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <div style={{ fontSize: '13px', fontWeight: 600, color: VibeTheme.colors.textMain, marginBottom: '8px' }}>Serverless Lambdas</div>
                        <div style={{ fontSize: '11px', lineHeight: 1.5 }}>Connect server-side functions and cloud endpoints directly to this entity. Coming soon.</div>
                    </div>
                )}
            </div>
        </div>
    );
};
