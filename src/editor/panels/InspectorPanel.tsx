/**
 * InspectorPanel v2 - Enhanced with ComponentRegistry
 */

import React, { useState } from 'react';
import { VibeIcons } from '../../presentation/components/VibeIcons';
import { useSceneStore, useEditorStore, type ComponentData } from '../stores';
import { useToastStore } from '../stores/toastStore';
import { getComponentInfo, getAvailableComponents, type PropertyInfo } from '../bridge';
import { ToastContainer } from '../components/ToastContainer';
import './InspectorPanel.css';

// Icon mapping
const ICONS: Record<string, React.ReactNode> = {
    Move: <VibeIcons name="Move" size={14} />,
    Box: <VibeIcons name="Box" size={14} />,
    Camera: <VibeIcons name="Video" size={14} />,
    Shield: <VibeIcons name="Shield" size={14} />,
    Magnet: <VibeIcons name="Magnet" size={14} />,
    Code: <VibeIcons name="Code" size={14} />,
    Sun: <VibeIcons name="Sun" size={14} />,
};


// Precision Draggable Label
const DraggableLabel: React.FC<{
    label: string;
    value: number;
    className?: string;
    onChange: (newValue: number) => void;
}> = ({ label, value, className, onChange }) => {
    const isDragging = React.useRef(false);
    const startX = React.useRef(0);
    const startValue = React.useRef(0);

    const onMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        startX.current = e.clientX;
        startValue.current = value;
        document.body.style.cursor = 'ew-resize';
        
        const onMouseMove = (moveEvent: MouseEvent) => {
            if (!isDragging.current) return;
            const delta = moveEvent.clientX - startX.current;
            const step = moveEvent.shiftKey ? 0.1 : 0.01;
            const newValue = startValue.current + delta * step;
            onChange(Number(newValue.toFixed(3)));
        };

        const onMouseUp = () => {
            isDragging.current = false;
            document.body.style.cursor = 'default';
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    return (
        <span 
            className={`draggable-label ${className}`} 
            onMouseDown={onMouseDown}
            title="Drag to change value"
        >
            {label}
        </span>
    );
};

const Vector3Input: React.FC<{
    value: [number, number, number];
    onChange: (value: [number, number, number]) => void;
}> = ({ value, onChange }) => {
    const updateValue = (index: number, val: number) => {
        const newValue: [number, number, number] = [...value];
        newValue[index] = val;
        onChange(newValue);
    };

    return (
        <div className="vector3-group">
            <div className="vector-field">
                <DraggableLabel 
                    label="X" 
                    value={value[0]} 
                    className="x" 
                    onChange={(v) => updateValue(0, v)} 
                />
                <input
                    type="number"
                    className="editor-input editor-input-number"
                    value={value[0]}
                    onChange={(e) => updateValue(0, parseFloat(e.target.value) || 0)}
                    step={0.1}
                />
            </div>
            <div className="vector-field">
                <DraggableLabel 
                    label="Y" 
                    value={value[1]} 
                    className="y" 
                    onChange={(v) => updateValue(1, v)} 
                />
                <input
                    type="number"
                    className="editor-input editor-input-number"
                    value={value[1]}
                    onChange={(e) => updateValue(1, parseFloat(e.target.value) || 0)}
                    step={0.1}
                />
            </div>
            <div className="vector-field">
                <DraggableLabel 
                    label="Z" 
                    value={value[2]} 
                    className="z" 
                    onChange={(v) => updateValue(2, v)} 
                />
                <input
                    type="number"
                    className="editor-input editor-input-number"
                    value={value[2]}
                    onChange={(e) => updateValue(2, parseFloat(e.target.value) || 0)}
                    step={0.1}
                />
            </div>
        </div>
    );
};

const PropertyEditor: React.FC<{
    prop: PropertyInfo;
    value: any;
    onChange: (value: any) => void;
}> = ({ prop, value, onChange }) => {
    switch (prop.type) {
        case 'vector3':
            return (
                <Vector3Input
                    value={value || prop.default}
                    onChange={onChange}
                />
            );

        case 'number':
            return (
                <input
                    type="number"
                    className="editor-input editor-input-number"
                    value={value ?? prop.default}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    min={prop.min}
                    max={prop.max}
                    step={prop.step || 0.1}
                />
            );

        case 'boolean':
            return (
                <label className="checkbox-wrapper">
                    <input
                        type="checkbox"
                        checked={value ?? prop.default}
                        onChange={(e) => onChange(e.target.checked)}
                    />
                    <span className="checkbox-custom" />
                </label>
            );

        case 'color':
            return (
                <input
                    type="color"
                    className="editor-input editor-input-color"
                    value={value || prop.default}
                    onChange={(e) => onChange(e.target.value)}
                />
            );

        case 'select':
            return (
                <select
                    className="editor-input editor-select"
                    value={value ?? prop.default}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {prop.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            );

        case 'string':
        default:
            return (
                <input
                    type="text"
                    className="editor-input"
                    value={value ?? prop.default ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
    }
};

const ComponentEditor: React.FC<{
    component: ComponentData;
    entityId: number;
}> = ({ component, entityId }) => {
    const [expanded, setExpanded] = useState(true);
    const { updateComponent, removeComponent } = useSceneStore();

    const info = getComponentInfo(component.type);

    const handleUpdate = (key: string, value: any) => {
        updateComponent(entityId, component.type, { [key]: value });
    };

    return (
        <div className="component-section">
            <div className="component-header" onClick={() => setExpanded(!expanded)}>
                {expanded ? <VibeIcons name="ChevronDown" size={14} /> : <VibeIcons name="ChevronRight" size={14} />}
                {ICONS[info?.icon || 'Box'] || <VibeIcons name="Box" size={14} />}
                <span className="component-name">{info?.label || component.type}</span>
                {component.type !== 'Transform' && (
                    <button
                        className="component-remove"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeComponent(entityId, component.type);
                        }}
                    >
                        <VibeIcons name="Trash" size={12} />
                    </button>
                )}
            </div>

            {expanded && (
                <div className="component-body">
                    {info?.properties.map(prop => (
                        <div key={prop.name} className="prop-row">
                            <span className="prop-label">{prop.label}</span>
                            <div className="prop-value">
                                <PropertyEditor
                                    prop={prop}
                                    value={component.data[prop.name]}
                                    onChange={(v) => handleUpdate(prop.name, v)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AddComponentMenu: React.FC<{
    entityId: number;
    existingTypes: string[];
    onClose: () => void;
}> = ({ entityId, existingTypes, onClose }) => {
    const { addComponent } = useSceneStore();
    const availableComponents = getAvailableComponents().filter(
        c => !existingTypes.includes(c.type)
    );

    const handleAdd = (type: string) => {
        const info = getComponentInfo(type);
        if (info) {
            addComponent(entityId, {
                type: info.type,
                data: { ...info.defaultData },
                enabled: true
            });
        }
        onClose();
    };

    return (
        <div className="add-component-menu">
            {availableComponents.map(comp => (
                <div
                    key={comp.type}
                    className="add-component-item"
                    onClick={() => handleAdd(comp.type)}
                >
                    {ICONS[comp.icon] || <VibeIcons name="Box" size={14} />}
                    <span>{comp.label}</span>
                </div>
            ))}
        </div>
    );
};

interface InspectorPanelProps {
    dragHandleProps?: any;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ dragHandleProps }) => {
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [compSearch, setCompSearch] = useState('');
    const { 
        selectedEntityId, 
        activePanelId, setActivePanel 
    } = useEditorStore();
    const { getEntity, renameEntity } = useSceneStore();

    const entity = selectedEntityId !== null ? getEntity(selectedEntityId) : undefined;

    return (
        <div 
            className={`editor-panel inspector-panel ${activePanelId === 'inspector' ? 'active-panel' : ''}`}
            onClick={() => setActivePanel('inspector')}
        >
            <div className="panel-header" {...dragHandleProps}>
                <div className="drag-handle-pill">
                    <VibeIcons name="Grip" size={14} />
                </div>
                <div className="panel-header-left">
                    <VibeIcons name="Activity" size={14} style={{ color: 'var(--editor-accent)' }} />
                    <h2>INSPECTOR</h2>
                </div>

                <div className="panel-header-actions" onClick={e => e.stopPropagation()}>
                    <button className="panel-action-btn" title="Settings">
                        <VibeIcons name="Settings" size={14} />
                    </button>
                </div>
            </div>



            <div className="editor-panel-content">
                {!entity ? (
                    <div className="inspector-empty-state">
                        <div className="empty-state-icon">
                            <VibeIcons name="Cursor" size={40} />
                        </div>
                        <h3>No entity selected</h3>
                        <p>Select an object in the Hierarchy or Viewport to view and edit its properties.</p>
                    </div>
                ) : (
                    <>
                        {/* Entity name */}
                        <div className="entity-header">
                            <input
                                type="text"
                                className="editor-input entity-name-input"
                                value={entity.name}
                                onChange={(e) => renameEntity(entity.id, e.target.value)}
                            />
                            <label className="checkbox-wrapper entity-enabled">
                                <input
                                    type="checkbox"
                                    checked={entity.enabled}
                                    onChange={() => { }}
                                />
                                <span className="checkbox-custom" />
                                <span>Enabled</span>
                            </label>
                        </div>

                        {/* Component Search */}
                        <div className="inspector-search-wrapper">
                            <VibeIcons name="Search" size={12} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Filter components..." 
                                className="editor-input comp-search-input"
                                value={compSearch}
                                onChange={(e) => setCompSearch(e.target.value)}
                            />
                        </div>


                        {/* Components */}
                        <div className="components-list">
                            {entity.components
                                .filter(comp => comp.type.toLowerCase().includes(compSearch.toLowerCase()) || 
                                               getComponentInfo(comp.type)?.label.toLowerCase().includes(compSearch.toLowerCase()))
                                .map((comp, idx) => (
                                    <ComponentEditor
                                        key={`${comp.type}-${idx}`}
                                        component={comp}
                                        entityId={entity.id}
                                    />
                                ))}
                        </div>

                        {/* Add component button */}
                        <div className="add-component-wrapper">
                            <button
                                className="editor-btn add-component-btn"
                                onClick={() => setShowAddMenu(!showAddMenu)}
                            >
                                <VibeIcons name="Plus" size={14} /> Add Component
                            </button>


                            {showAddMenu && (
                                <AddComponentMenu
                                    entityId={entity.id}
                                    existingTypes={entity.components.map(c => c.type)}
                                    onClose={() => setShowAddMenu(false)}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
