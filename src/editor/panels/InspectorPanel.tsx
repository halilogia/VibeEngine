/**
 * InspectorPanel - Property editor (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useState } from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useSceneStore, useEditorStore, type ComponentData } from '../stores';
import { SovereignHeader } from '@ui/atomic/molecules/SovereignHeader';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeInput } from '@ui/atomic/atoms/VibeInput';
import { VibeTheme } from '@themes/VibeStyles';
import { inspectorStyles as styles } from './InspectorPanel.styles';

// #region Components

/**
 * Props for the Vector3Field component
 */
interface Vector3FieldProps {
    /** Label to display for the vector field */
    label: string;
    /** Vector value as either an array [x,y,z] or object {x,y,z} */
    value: number[] | Record<string, number>;
    /** Callback triggered when any axis changes */
    onChange: (value: number[] | Record<string, number>) => void;
}

/**
 * Vector3Field - Atomic UI component for editing 3D vector data.
 */
const Vector3Field: React.FC<Vector3FieldProps> = ({ label, value, onChange }) => {
    const axes = ['x', 'y', 'z'];
    
    // Safely resolve axis value whether it's an array [0,0,0] or object {x,y,z}
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
                    <div key={axis} style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: VibeTheme.colors.accent, width: '16px', textAlign: 'center' }}>{axis.toUpperCase()}</span>
                        <VibeInput 
                            type="number"
                            value={String(getAxisValue(axis, idx) || 0)}
                            onChange={(e) => handleAxisChange(axis, idx, parseFloat(e.target.value) || 0)}
                            style={{ background: 'transparent', border: 'none', height: '24px', padding: '0 6px', fontSize: '11px', width: '100%' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Props for the ComponentSection component
 */
interface ComponentSectionProps {
    /** Override title to display in the header */
    title?: string;
    /** Override icon name to display in the header */
    icon?: string;
    /** Optional component data context */
    component?: ComponentData;
    /** Callback for removing this component from the entity */
    onRemove?: () => void;
    /** The fields or children to render inside the section */
    children: React.ReactNode;
}

/**
 * ComponentSection - Collapsible container for grouping component properties.
 */
const ComponentSection: React.FC<ComponentSectionProps> = ({ 
    component, onRemove, title, icon, children 
}) => {
    const [isHovered, setIsHovered] = useState(false);
    
    // Resolve display properties
    const displayTitle = title || component?.type?.toUpperCase() || 'COMPONENT';
    const displayIcon = icon || (component?.type === 'Light' ? 'Sun' : component?.type === 'Physics' ? 'Shield' : 'Box');

    return (
        <div 
            style={styles.section}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={styles.sectionHeader}>
                <VibeIcons name={displayIcon as any} size={14} style={{ opacity: 0.7 }} />
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
// #endregion

/**
 * Props for the InspectorPanel component
 */
interface InspectorPanelProps {
    /** Drag handle props from the docking system */
    dragHandleProps?: any;
}

/**
 * InspectorPanel - Property editor and entity configuration system.
 * 🏛️⚛️💎🚀
 * 
 * Provides a high-fidelity interface for modifying entity properties, components,
 * and materials. Supports recursive property binding and transactional updates.
 */
export const InspectorPanel: React.FC<InspectorPanelProps> = ({ dragHandleProps }) => {
    const { entities, updateEntity } = useSceneStore();
    const { selectedEntityId, activePanelId, setActivePanel } = useEditorStore();
    const [showAddComponent, setShowAddComponent] = React.useState(false);

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
                {/* Entity Header */}
                <div style={styles.sectionBody}>
                    <span style={styles.fieldLabel}>NAME</span>
                    <VibeInput 
                        value={selectedEntity.name} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEntity(selectedEntity.id, { name: e.target.value })} 
                    />
                </div>

                {/* Components Wrapper */}
                {selectedEntity.components.map((comp: any, idx: number) => {
                    const data = comp.data || {};
                    if (comp.type === 'Transform') {
                        return (
                            <ComponentSection key={`comp-${idx}`} title="TRANSFORM" icon="Move">
                                <Vector3Field 
                                    label="POSITION" 
                                    value={data.position} 
                                    onChange={(val) => {
                                        const newComps = [...selectedEntity.components];
                                        newComps[idx] = { ...comp, data: { ...data, position: val } };
                                        updateEntity(selectedEntity.id, { components: newComps });
                                    }} 
                                />
                                <Vector3Field 
                                    label="ROTATION" 
                                    value={data.rotation} 
                                    onChange={(val) => {
                                        const newComps = [...selectedEntity.components];
                                        newComps[idx] = { ...comp, data: { ...data, rotation: val } };
                                        updateEntity(selectedEntity.id, { components: newComps });
                                    }} 
                                />
                                <Vector3Field 
                                    label="SCALE" 
                                    value={data.scale} 
                                    onChange={(val) => {
                                        const newComps = [...selectedEntity.components];
                                        newComps[idx] = { ...comp, data: { ...data, scale: val } };
                                        updateEntity(selectedEntity.id, { components: newComps });
                                    }} 
                                />
                            </ComponentSection>
                        );
                    }
                    return null;
                })}

                <div style={{ marginTop: '12px', position: 'relative' }}>
                    <VibeButton 
                        variant="secondary" 
                        style={{ width: '100%' }}
                        onClick={() => setShowAddComponent(!showAddComponent)}
                    >
                        <VibeIcons name="Plus" size={14} /> ADD COMPONENT
                    </VibeButton>

                    {showAddComponent && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: VibeTheme.colors.bgSecondary,
                            border: `1px solid ${VibeTheme.colors.glassBorder}`,
                            borderRadius: '4px',
                            zIndex: 100,
                            marginTop: '4px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                        }}>
                            {['Mesh Renderer', 'Box Collider', 'Rigidbody'].map(item => (
                                <div 
                                    key={item}
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
