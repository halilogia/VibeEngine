/**
 * InspectorPanel - Property editor (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useState } from 'react';
import { VibeIcons } from '../../presentation/components/VibeIcons';
import { useSceneStore, useEditorStore, type ComponentData } from '../stores';
import { SovereignHeader } from '../../presentation/atomic/molecules/SovereignHeader';
import { VibeButton } from '../../presentation/atomic/atoms/VibeButton';
import { VibeInput } from '../../presentation/atomic/atoms/VibeInput';
import { VibeTheme } from '@themes/VibeStyles';
import { inspectorStyles as styles } from './InspectorPanel.styles';

// #region Components
interface Vector3FieldProps {
    label: string;
    value: { x: number; y: number; z: number };
    onChange: (val: { x: number; y: number; z: number }) => void;
}

const Vector3Field: React.FC<Vector3FieldProps> = ({ label, value, onChange }) => {
    return (
        <div style={styles.field}>
            <span style={styles.fieldLabel}>{label}</span>
            <div style={styles.vectorGroup}>
                {['x', 'y', 'z'].map((axis) => (
                    <div key={axis} style={styles.vectorField}>
                        <div style={{
                            ...styles.vectorLabel,
                            background: axis === 'x' ? 'rgba(239, 68, 68, 0.2)' : 
                                       axis === 'y' ? 'rgba(34, 197, 94, 0.2)' : 
                                       'rgba(59, 130, 246, 0.2)',
                            color: axis === 'x' ? '#f87171' : axis === 'y' ? '#4ade80' : '#60a5fa'
                        }}>
                            {axis.toUpperCase()}
                        </div>
                        <VibeInput
                            type="number"
                            value={String(value[axis as 'x'|'y'|'z'])}
                            onChange={(e) => onChange({ ...value, [axis]: parseFloat(e.target.value) || 0 })}
                            style={{ background: 'transparent', border: 'none', height: '24px', padding: '0 6px', fontSize: '11px' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

interface ComponentSectionProps {
    component: ComponentData;
    onRemove: () => void;
    children: React.ReactNode;
}

const ComponentSection: React.FC<ComponentSectionProps> = ({ component, onRemove, children }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            style={styles.section}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={styles.sectionHeader}>
                <VibeIcons name={component.type === 'Light' ? 'Sun' : component.type === 'Physics' ? 'Shield' : 'Box'} size={14} style={{ opacity: 0.7 }} />
                <span style={{ flex: 1 }}>{component.type.toUpperCase()}</span>
                {isHovered && component.type !== 'Transform' && (
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
// #endregion

interface InspectorPanelProps {
    dragHandleProps?: any;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ dragHandleProps }) => {
    const { entities, updateEntity } = useSceneStore();
    const { selectedEntityId, activePanelId, setActivePanel } = useEditorStore();

    const selectedEntity = selectedEntityId ? entities.get(selectedEntityId) : null;

    if (!selectedEntity) {
        return (
            <div 
                className={`editor-panel inspector-panel ${activePanelId === 'inspector' ? 'active-panel' : ''}`}
                onClick={() => setActivePanel('inspector')}
                style={styles.panel}
            >
                <SovereignHeader title="INSPECTOR" icon="Activity" dragHandleProps={dragHandleProps} />
                <div style={styles.emptyState}>
                    <VibeIcons name="Box" size={48} style={{ opacity: 0.1, color: VibeTheme.colors.accent }} />
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>NO ENTITY SELECTED</h3>
                    <p style={{ margin: 0, color: VibeTheme.colors.textSecondary, fontSize: '12px', maxWidth: '200px', lineHeight: 1.5 }}>
                        Select an object in the Hierarchy or Viewport to view and edit its properties.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`editor-panel inspector-panel ${activePanelId === 'inspector' ? 'active-panel' : ''}`}
            onClick={() => setActivePanel('inspector')}
            style={styles.panel}
        >
            <SovereignHeader title="INSPECTOR" icon="Activity" dragHandleProps={dragHandleProps} />
            
            <div style={styles.content}>
                {/* Entity Info */}
                <div style={styles.field}>
                    <span style={styles.fieldLabel}>NAME</span>
                    <VibeInput 
                        value={selectedEntity.name} 
                        onChange={(e) => updateEntity(selectedEntity.id, { name: e.target.value })} 
                    />
                </div>

                {/* Transform Component */}
                {selectedEntity.components.map((comp, idx) => {
                    if (comp.type === 'Transform') {
                        const props = comp.props as any;
                        return (
                            <ComponentSection key={idx} component={comp} onRemove={() => {}}>
                                <Vector3Field 
                                    label="POSITION" 
                                    value={props.position} 
                                    onChange={(val) => {
                                        const newComps = [...selectedEntity.components];
                                        newComps[idx] = { ...comp, props: { ...props, position: val } };
                                        updateEntity(selectedEntity.id, { components: newComps });
                                    }} 
                                />
                                <Vector3Field 
                                    label="ROTATION" 
                                    value={props.rotation} 
                                    onChange={(val) => {
                                        const newComps = [...selectedEntity.components];
                                        newComps[idx] = { ...comp, props: { ...props, rotation: val } };
                                        updateEntity(selectedEntity.id, { components: newComps });
                                    }} 
                                />
                                <Vector3Field 
                                    label="SCALE" 
                                    value={props.scale} 
                                    onChange={(val) => {
                                        const newComps = [...selectedEntity.components];
                                        newComps[idx] = { ...comp, props: { ...props, scale: val } };
                                        updateEntity(selectedEntity.id, { components: newComps });
                                    }} 
                                />
                            </ComponentSection>
                        );
                    }
                    return null;
                })}

                <VibeButton variant="secondary" style={{ marginTop: '12px' }}>
                    <VibeIcons name="Plus" size={14} /> ADD COMPONENT
                </VibeButton>
            </div>
        </div>
    );
};
