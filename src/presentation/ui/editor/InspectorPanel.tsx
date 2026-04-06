

import React, { useState } from 'react';
import { VibeIcons, type VibeIconName } from '@ui/common/VibeIcons';
import { useSceneStore, useEditorStore, type ComponentData } from '@infrastructure/store';
import { SovereignHeader } from '@ui/atomic/molecules/SovereignHeader';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeInput } from '@ui/atomic/atoms/VibeInput';
import { VibeTheme } from '@themes/VibeStyles';
import { inspectorStyles as styles } from './InspectorPanel.styles';

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
    
    children: React.ReactNode;
}

const ComponentSection: React.FC<ComponentSectionProps> = ({ 
    component, onRemove, title, icon, children 
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const displayTitle = title || component?.type?.toUpperCase() || 'COMPONENT';
    const displayIcon = icon || (component?.type === 'Light' ? 'Sun' : component?.type === 'Physics' ? 'Shield' : 'Box');

    return (
        <div 
            style={styles.section}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
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

interface InspectorPanelProps {
    
    dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

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
                    <VibeIcons name="Box" size={48} style={{ opacity: 0.4, color: VibeTheme.colors.textSecondary }} />
                    <h3 style={{ margin: 0, color: VibeTheme.colors.textMain, fontSize: '14px' }}>NO ENTITY SELECTED</h3>
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
                {}
                <div style={styles.sectionBody}>
                    <span style={styles.fieldLabel}>NAME</span>
                    <VibeInput 
                        value={selectedEntity.name} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEntity(selectedEntity.id, { name: e.target.value })} 
                    />
                </div>

                {}
                {selectedEntity.components.map((comp: ComponentData, idx: number) => {
                    const data = comp.data || {};
                    if (comp.type === 'Transform') {
                        return (
                            <ComponentSection key={`comp-${idx}`} title="TRANSFORM" icon="Move">
                                <Vector3Field 
                                    label="POSITION" 
                                    value={data.position as number[] | Record<string, number>} 
                                    onChange={(val) => {
                                        const newComps = [...selectedEntity.components];
                                        newComps[idx] = { ...comp, data: { ...data, position: val } };
                                        updateEntity(selectedEntity.id, { components: newComps });
                                    }} 
                                />
                                <Vector3Field 
                                    label="ROTATION" 
                                    value={data.rotation as number[] | Record<string, number>} 
                                    onChange={(val) => {
                                        const newComps = [...selectedEntity.components];
                                        newComps[idx] = { ...comp, data: { ...data, rotation: val } };
                                        updateEntity(selectedEntity.id, { components: newComps });
                                    }} 
                                />
                                <Vector3Field 
                                    label="SCALE" 
                                    value={data.scale as number[] | Record<string, number>} 
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
                                        color: VibeTheme.colors.textMain,
                                        borderBottom: `1px solid ${VibeTheme.colors.border}`
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = VibeTheme.colors.bgSubtle)}
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
