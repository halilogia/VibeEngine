/**
 * InspectorPanel.parts.tsx
 * Alt bileşenler: Vector3Field, ComponentSection, ErthBehaviorPanel
 * Bunlar InspectorPanel.tsx tarafından kullanılır.
 */
import React, { useState } from 'react';
import { VibeIcons, type VibeIconName } from '@ui/common/VibeIcons';
import { type ComponentData } from '@infrastructure/store';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeInput } from '@ui/atomic/atoms/VibeInput';
import { VibeSwitch } from '@ui/atomic/atoms/VibeSwitch';
import { VibeTheme } from '@themes/VibeStyles';
import { inspectorStyles as styles } from './InspectorPanel.styles';

// ---- TYPES ----

export interface ComponentUpdatePayload {
    radius?: number;
    nextWaypointId?: string | number | null;
    speed?: number;
    currentWaypointId?: string | number | null;
    [key: string]: unknown;
}

// ---- VECTOR3 FIELD ----

interface Vector3FieldProps {
    label: string;
    value: number[] | Record<string, number>;
    onChange: (value: number[] | Record<string, number>) => void;
}

export const Vector3Field: React.FC<Vector3FieldProps> = ({ label, value, onChange }) => {
    const axes = ['x', 'y', 'z'];

    const getAxisValue = (axis: string, idx: number): number => {
        if (Array.isArray(value)) return value[idx] ?? 0;
        if (typeof value === 'object' && value !== null) return value[axis] ?? 0;
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
                        <span style={{ fontSize: '9px', fontWeight: 900, color: VibeTheme.colors.accent, width: '16px', textAlign: 'center' }}>
                            {axis.toUpperCase()}
                        </span>
                        <VibeInput
                            type="number"
                            value={String(getAxisValue(axis, idx))}
                            onChange={(e) => handleAxisChange(axis, idx, parseFloat(e.target.value) || 0)}
                            style={{ background: 'transparent', border: 'none', height: '24px', padding: '0 6px', fontSize: '11px', width: '100%', color: VibeTheme.colors.textMain }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

// ---- COMPONENT SECTION ----

interface ComponentSectionProps {
    title?: string;
    icon?: string;
    component?: ComponentData;
    onRemove?: () => void;
    children?: React.ReactNode;
}

export const ComponentSection: React.FC<ComponentSectionProps> = ({ component, onRemove, title, icon, children }) => {
    const [isHovered, setIsHovered] = useState(false);
    const displayTitle = title ?? component?.type?.toUpperCase() ?? 'COMPONENT';
    const displayIcon = icon ?? (component?.type === 'Light' ? 'Sun' : component?.type === 'Physics' ? 'Shield' : 'Box');

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
            {children && <div style={styles.sectionBody}>{children}</div>}
        </div>
    );
};

// ---- ERTH AI BEHAVIOR PANEL ----

interface ErthBehaviorPanelProps {
    component: ComponentData;
    onRemove: () => void;
    onUpdate: (data: ComponentUpdatePayload) => void;
    onCustomAction?: () => void;
}

export const ErthBehaviorPanel: React.FC<ErthBehaviorPanelProps> = ({ component, onRemove, onUpdate, onCustomAction }) => {
    const [toggles, setToggles] = useState({ ui: true, lines: false, nodes: true, offScreen: false, distance: false, forceConsistent: true });
    const data = component.data as ComponentUpdatePayload;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <VibeIcons name="ChevronRight" size={16} style={{ color: VibeTheme.colors.textSecondary }} />
                    <span style={{ fontWeight: 600, fontSize: '14px', color: VibeTheme.colors.textMain }}>
                        {component.type.replace('Component', '')} System
                    </span>
                </div>
                <VibeButton variant="ghost" size="sm" onClick={onRemove} style={{ padding: 0, color: VibeTheme.colors.textSecondary }}>
                    <VibeIcons name="Trash" size={14} />
                </VibeButton>
            </div>

            {/* Component-specific settings */}
            {component.type === 'Waypoint' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: `1px solid ${VibeTheme.colors.border}` }}>
                    <div style={{ fontSize: '11px', color: VibeTheme.colors.textSecondary, fontWeight: 700 }}>WAYPOINT DATA</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px' }}>Radius</span>
                        <VibeInput type="number" value={String(data?.radius ?? 2)} onChange={(e) => onUpdate({ ...data, radius: parseFloat(e.target.value) })} style={{ width: '60px', height: '24px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px' }}>Next Waypoint ID</span>
                        <VibeInput type="text" value={String(data?.nextWaypointId ?? '')} onChange={(e) => onUpdate({ ...data, nextWaypointId: e.target.value || null })} style={{ width: '80px', height: '24px' }} />
                    </div>
                    {onCustomAction && (
                        <VibeButton variant="primary" style={{ marginTop: '8px', fontSize: '11px', width: '100%' }} onClick={onCustomAction}>
                            <VibeIcons name="Plus" size={12} /> ADD LINKED WAYPOINT
                        </VibeButton>
                    )}
                </div>
            )}

            {component.type === 'TrafficFollower' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: `1px solid ${VibeTheme.colors.border}` }}>
                    <div style={{ fontSize: '11px', color: VibeTheme.colors.textSecondary, fontWeight: 700 }}>VEHICLE AI</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px' }}>Speed</span>
                        <VibeInput type="number" value={String(data?.speed ?? 5)} onChange={(e) => onUpdate({ ...data, speed: parseFloat(e.target.value) })} style={{ width: '60px', height: '24px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px' }}>Start Waypoint ID</span>
                        <VibeInput type="text" value={String(data?.currentWaypointId ?? '')} onChange={(e) => onUpdate({ ...data, currentWaypointId: e.target.value || null })} style={{ width: '80px', height: '24px' }} />
                    </div>
                </div>
            )}

            {component.type !== 'Waypoint' && component.type !== 'TrafficFollower' && (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <VibeSwitch label="Show UI" checked={toggles.ui} onChange={x => setToggles({ ...toggles, ui: x })} />
                        <VibeSwitch label="Show Lines" checked={toggles.lines} onChange={x => setToggles({ ...toggles, lines: x })} />
                        <VibeSwitch label="Show Nodes" checked={toggles.nodes} onChange={x => setToggles({ ...toggles, nodes: x })} />
                    </div>

                    <div style={{ height: '1px', background: VibeTheme.colors.border }} />

                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: VibeTheme.colors.textMain, marginBottom: '12px' }}>Performance Optimization</div>
                        <div style={{ background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '10px', marginBottom: '16px' }}>
                            <VibeIcons name="Activity" size={14} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ fontSize: '11px', color: '#a5b4fc', lineHeight: 1.5 }}>
                                Controls how often this behavior updates. Higher priority = more frequent updates.
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <VibeSwitch label="Off-Screen Optimization" checked={toggles.offScreen} onChange={x => setToggles({ ...toggles, offScreen: x })} />
                            <VibeSwitch label="Distance-Based Optimization" checked={toggles.distance} onChange={x => setToggles({ ...toggles, distance: x })} />
                            <VibeSwitch label="Force Consistent Updates" checked={toggles.forceConsistent} onChange={x => setToggles({ ...toggles, forceConsistent: x })} />
                        </div>
                    </div>

                    <button style={{ width: '100%', padding: '12px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(249,115,22,0.3)' }}>
                        Edit Behavior
                    </button>
                </>
            )}
        </div>
    );
};
