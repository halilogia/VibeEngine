import React, { useState } from 'react';
import { VibeIcons, type VibeIconName } from '@ui/common/VibeIcons';
import { useSceneStore, useEditorStore, type ComponentData } from '@infrastructure/store';
import { SovereignHeader } from '@ui/atomic/molecules/SovereignHeader';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeInput } from '@ui/atomic/atoms/VibeInput';
import { VibeSwitch } from '@ui/atomic/atoms/VibeSwitch';
import { VibeTheme } from '@themes/VibeStyles';
import { inspectorStyles as styles } from './InspectorPanel.styles';

// --- HELPER COMPONENTS ---

interface Vector3FieldProps {
    label: string;
    value: number[] | Record<string, number>;
    onChange: (value: number[] | Record<string, number>) => void;
}

const Vector3Field: React.FC<Vector3FieldProps> = ({ label, value, onChange }) => {
    const axes = ['x', 'y', 'z'];
    const getAxisValue = (axis: string, idx: number) => {
        if (Array.isArray(value)) return value[idx];
        if (typeof value === 'object' && value !== null) return value[axis];
        return 0;
    };
    const handleAxisChange = (axis: string, idx: number, newVal: number) => {
        if (Array.isArray(value)) {
            const next = [...value];
            next[idx] = newVal;
            onChange(next);
        } else {
            onChange({ ...value, [axis]: newVal });
        }
    };
    return (
        <div style={styles.field}>
            <span style={styles.fieldLabel}>{label}</span>
            <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                {axes.map((axis, idx) => (
                    <div key={axis} style={{ flex: 1, display: 'flex', alignItems: 'center', background: VibeTheme.colors.bgSubtle, borderRadius: '4px', border: `1px solid ${VibeTheme.colors.border}` }}>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: VibeTheme.colors.accent, width: '16px', textAlign: 'center' }}>{axis.toUpperCase()}</span>
                        <VibeInput 
                            type="number"
                            value={String(getAxisValue(axis, idx) || 0)}
                            onChange={(e) => handleAxisChange(axis, idx, parseFloat(e.target.value) || 0)}
                            style={{ background: 'transparent', border: 'none', height: '24px', padding: '0 6px', fontSize: '11px', width: '100%', color: VibeTheme.colors.textMain }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

interface ComponentSectionProps {
    title?: string;
    icon?: string;
    component?: ComponentData;
    onRemove?: () => void;
    children?: React.ReactNode;
}

const ComponentSection: React.FC<ComponentSectionProps> = ({ component, onRemove, title, icon, children }) => {
    const [isHovered, setIsHovered] = useState(false);
    const displayTitle = title || component?.type?.toUpperCase() || 'COMPONENT';
    const displayIcon = icon || (component?.type === 'Light' ? 'Sun' : component?.type === 'Physics' ? 'Shield' : 'Box');
    
    return (
        <div style={styles.section} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div style={styles.sectionHeader}>
                <VibeIcons name={displayIcon as VibeIconName} size={14} style={{ opacity: 0.7 }} />
                <span style={{ flex: 1 }}>{displayTitle}</span>
                {isHovered && component?.type !== 'Transform' && onRemove && (
                    <VibeButton variant="ghost" size="sm" onClick={onRemove} style={{ padding: 0, width: '20px', height: '20px' }}>
                        <VibeIcons name="Trash" size={12} />
                    </VibeButton>
                )}
            </div>
            <div style={styles.sectionBody}>
                {children}
            </div>
        </div>
    );
};

// --- BEHAVIOR PANEL (ERTH AI STYLE CLONE) ---

const ErthBehaviorPanel: React.FC<{ component: ComponentData, onRemove: () => void, onUpdate: (data: any) => void, onCustomAction?: () => void }> = ({ component, onRemove, onUpdate, onCustomAction }) => {
    const [toggles, setToggles] = useState({ ui: true, lines: false, nodes: true, offScreen: false, distance: false, forceConsistent: true });
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <VibeIcons name="ChevronRight" size={16} style={{ color: VibeTheme.colors.textSecondary }} />
                    <span style={{ fontWeight: 600, fontSize: '14px', color: VibeTheme.colors.textMain }}>{component.type.replace('Component', '')} System</span>
                </div>
                <VibeButton variant="ghost" size="sm" onClick={onRemove} style={{ padding: 0, color: VibeTheme.colors.textSecondary }}>
                    <VibeIcons name="Trash" size={14} />
                </VibeButton>
            </div>

            {/* Component Specific Settings */}
            {component.type === 'Waypoint' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: `1px solid ${VibeTheme.colors.border}` }}>
                    <div style={{ fontSize: '11px', color: VibeTheme.colors.textSecondary, fontWeight: 700 }}>WAYPOINT DATA</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px' }}>Radius</span>
                        <VibeInput type="number" value={String(component.data?.radius || 2)} onChange={(e) => onUpdate({ ...component.data, radius: parseFloat(e.target.value) })} style={{ width: '60px', height: '24px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px' }}>Next ID</span>
                        <VibeInput type="text" value={String(component.data?.nextWaypointId || '')} onChange={(e) => onUpdate({ ...component.data, nextWaypointId: e.target.value })} style={{ width: '60px', height: '24px' }} />
                    </div>
                    {onCustomAction && (
                        <VibeButton variant="primary" style={{ marginTop: '8px', fontSize: '11px', width: '100%' }} onClick={onCustomAction}>
                            <VibeIcons name="Plus" size={12} /> ADD LINKED WAYPOINT
                        </VibeButton>
                    )}
                </div>
            ) : component.type === 'TrafficFollower' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: `1px solid ${VibeTheme.colors.border}` }}>
                    <div style={{ fontSize: '11px', color: VibeTheme.colors.textSecondary, fontWeight: 700 }}>VEHICLE AI</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px' }}>Speed</span>
                        <VibeInput type="number" value={String(component.data?.speed || 5)} onChange={(e) => onUpdate({ ...component.data, speed: parseFloat(e.target.value) })} style={{ width: '60px', height: '24px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px' }}>Target Waypoint</span>
                        <VibeInput type="text" value={String(component.data?.currentWaypointId || '')} onChange={(e) => onUpdate({ ...component.data, currentWaypointId: e.target.value })} style={{ width: '60px', height: '24px' }} />
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <VibeSwitch label="Show UI" checked={toggles.ui} onChange={x => setToggles({...toggles, ui: x})} />
                    <VibeSwitch label="Show Lines" checked={toggles.lines} onChange={x => setToggles({...toggles, lines: x})} />
                    <VibeSwitch label="Show Nodes" checked={toggles.nodes} onChange={x => setToggles({...toggles, nodes: x})} />
                </div>
            )}

            <div style={{ height: '1px', background: VibeTheme.colors.border, margin: '8px 0' }} />

            {/* Behavior Settings */}
            <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: VibeTheme.colors.textMain, marginBottom: '12px' }}>Behavior Settings</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: VibeTheme.colors.textSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Execution Priority
                        <VibeIcons name="Search" size={12} style={{ opacity: 0.5 }} />
                    </span>
                    <VibeInput value="-900" style={{ width: '80px', textAlign: 'right', background: 'rgba(255,255,255,0.05)', border: 'none' }} />
                </div>
                <div style={{ fontSize: '10px', color: VibeTheme.colors.textSecondary, opacity: 0.7 }}>Lower values execute first (default: 0)</div>
            </div>

            <div style={{ height: '1px', background: VibeTheme.colors.border, margin: '8px 0' }} />

            {/* Performance Optimization */}
            <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: VibeTheme.colors.textMain, marginBottom: '12px' }}>Performance Optimization</div>
                
                {/* Info Card */}
                <div style={{ background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <VibeIcons name="Activity" size={14} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '11px', color: '#a5b4fc', lineHeight: 1.5 }}>
                        These settings control how often this behavior updates to optimize game performance. Higher priority behaviors update more frequently.
                    </span>
                </div>

                <div style={{ fontSize: '11px', color: VibeTheme.colors.textSecondary, marginBottom: '8px' }}>Update Priority</div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '8px' }}>
                    Critical - Always
                    <VibeIcons name="ChevronDown" size={12} />
                </div>
                <div style={{ fontSize: '10px', color: VibeTheme.colors.textSecondary, opacity: 0.7, marginBottom: '16px' }}>
                    Updates every frame for essential behaviors like player controls
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <VibeSwitch label="? Off-Screen Optimization" checked={toggles.offScreen} onChange={x => setToggles({...toggles, offScreen: x})} />
                    <VibeSwitch label="? Distance-Based Optimization" checked={toggles.distance} onChange={x => setToggles({...toggles, distance: x})} />
                    <VibeSwitch label="? Force Consistent Updates" checked={toggles.forceConsistent} onChange={x => setToggles({...toggles, forceConsistent: x})} />
                </div>
            </div>

            {/* Edit Behavior Button */}
            <button style={{
                marginTop: '8px',
                width: '100%',
                padding: '12px',
                background: '#f97316', // Orange
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)'
            }}>
                Edit Behavior
            </button>
        </div>
    );
};

// --- INSPECTOR PANEL ---

export const InspectorPanel: React.FC<{ dragHandleProps?: React.HTMLAttributes<HTMLDivElement> }> = ({ dragHandleProps }) => {
    const { entities, updateEntity, addEntity } = useSceneStore();
    const { selectedEntityId, activePanelId, setActivePanel, selectEntity } = useEditorStore();
    const [activeTab, setActiveTab] = useState<'Properties' | 'Behaviors' | 'Lambdas'>('Properties');
    const [showAddComponent, setShowAddComponent] = React.useState(false);

    const selectedEntity = selectedEntityId ? entities.get(selectedEntityId) : null;

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

    const CORE_COMPONENTS = ['Transform', 'Collider', 'Rigidbody', 'Mesh', 'Light', 'Audio', 'Camera'];
    const properties = selectedEntity.components.filter(c => CORE_COMPONENTS.includes(c.type));
    const behaviors = selectedEntity.components.filter(c => !CORE_COMPONENTS.includes(c.type));

    const renderTabs = () => (
        <div style={{ display: 'flex', borderBottom: `1px solid ${VibeTheme.colors.border}`, padding: '0 16px', background: VibeTheme.colors.bgPrimary }}>
            {(['Properties', 'Behaviors', 'Lambdas'] as const).map(tab => {
                const isActive = activeTab === tab;
                return (
                    <div 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? VibeTheme.colors.textMain : VibeTheme.colors.textSecondary,
                            borderBottom: isActive ? `2px solid ${VibeTheme.colors.accent}` : '2px solid transparent',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {tab}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className={`editor-panel inspector-panel ${activePanelId === 'inspector' ? 'active-panel' : ''}`} onClick={() => setActivePanel('inspector')} style={styles.panel}>
            <SovereignHeader title="INSPECTOR" icon="Activity" dragHandleProps={dragHandleProps} />
            
            {renderTabs()}

            <div style={{ ...styles.content, paddingTop: '16px' }}>
                {activeTab === 'Properties' && (
                    <>
                        <div style={styles.sectionBody}>
                            <span style={styles.fieldLabel}>NAME</span>
                            <VibeInput value={selectedEntity.name} onChange={(e) => updateEntity(selectedEntity.id, { name: e.target.value })} />
                        </div>
                        
                        {properties.map((comp, idx) => {
                            const data = comp.data || {};
                            if (comp.type === 'Transform') {
                                return (
                                    <ComponentSection key={`comp-${idx}`} title="TRANSFORM" icon="Move">
                                        <Vector3Field label="POSITION" value={data.position as number[]} onChange={(val) => {
                                            const newComps = [...selectedEntity.components];
                                            newComps[idx] = { ...comp, data: { ...data, position: val } };
                                            updateEntity(selectedEntity.id, { components: newComps });
                                        }} />
                                        <Vector3Field label="ROTATION" value={data.rotation as number[]} onChange={(val) => {
                                            const newComps = [...selectedEntity.components];
                                            newComps[idx] = { ...comp, data: { ...data, rotation: val } };
                                            updateEntity(selectedEntity.id, { components: newComps });
                                        }} />
                                        <Vector3Field label="SCALE" value={data.scale as number[]} onChange={(val) => {
                                            const newComps = [...selectedEntity.components];
                                            newComps[idx] = { ...comp, data: { ...data, scale: val } };
                                            updateEntity(selectedEntity.id, { components: newComps });
                                        }} />
                                    </ComponentSection>
                                );
                            }
                            return (
                                <ComponentSection key={`comp-${idx}`} title={comp.type.toUpperCase()} />
                            );
                        })}

                        <div style={{ marginTop: '12px', position: 'relative' }}>
                            <VibeButton variant="secondary" style={{ width: '100%' }} onClick={() => setShowAddComponent(!showAddComponent)}>
                                <VibeIcons name="Plus" size={14} /> ADD COMPONENT
                            </VibeButton>
                        </div>
                    </>
                )}

                {activeTab === 'Behaviors' && (
                    <>
                        {behaviors.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: VibeTheme.colors.textSecondary }}>
                                <VibeIcons name="Cpu" size={32} style={{ opacity: 0.3, marginBottom: '16px' }} />
                                <div style={{ fontSize: '13px', fontWeight: 600, color: VibeTheme.colors.textMain, marginBottom: '8px' }}>No Behaviors Attached</div>
                                <div style={{ fontSize: '11px', lineHeight: 1.5 }}>Add a custom script or system logic from the Project Library to view it here.</div>
                            </div>
                        ) : (
                            behaviors.map((comp, idx) => (
                                <ErthBehaviorPanel 
                                    key={`beh-${idx}`} 
                                    component={comp} 
                                    onRemove={() => {
                                        const newComps = selectedEntity.components.filter(c => c !== comp);
                                        updateEntity(selectedEntity.id, { components: newComps });
                                    }} 
                                    onUpdate={(data) => {
                                        const newComps = [...selectedEntity.components];
                                        newComps[idx] = { ...comp, data };
                                        updateEntity(selectedEntity.id, { components: newComps });
                                    }}
                                    onCustomAction={comp.type === 'Waypoint' ? () => {
                                        // "City Builder" Linked Waypoint feature
                                        const newId = addEntity("Linked Waypoint", selectedEntity.parentId);
                                        const defaultTransform = { type: 'Transform', data: { position: [0,0,0], rotation: [0,0,0], scale: [1,1,1] }, enabled: true };
                                        const waypointComp = { type: 'Waypoint', data: { radius: 2.0, nextWaypointId: null }, enabled: true };
                                        updateEntity(newId, { components: [defaultTransform, waypointComp] });
                                        
                                        const newComps = [...selectedEntity.components];
                                        newComps[idx] = { ...comp, data: { ...comp.data, nextWaypointId: newId } };
                                        updateEntity(selectedEntity.id, { components: newComps });
                                        
                                        // Select the new waypoint so they can keep chain-clicking!
                                        selectEntity(newId);
                                    } : undefined}
                                />
                            ))
                        )}
                        <VibeButton variant="primary" style={{ width: '100%', marginTop: '12px', background: 'rgba(255,255,255,0.1)' }} onClick={() => {}}>
                            <VibeIcons name="Plus" size={14} /> Attach New Behavior
                        </VibeButton>
                    </>
                )}

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
