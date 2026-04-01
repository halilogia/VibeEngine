/**
 * InspectorPanel v2 - Enhanced with ComponentRegistry
 */

import React, { useState } from 'react';
import {
    Box, Plus, Trash2, ChevronDown, ChevronRight,
    Move, Camera, Shield, Magnet, Code, Sun, MousePointer2
} from 'lucide-react';
import { useSceneStore, useEditorStore, type ComponentData } from '../stores';
import { getComponentInfo, getAvailableComponents, type PropertyInfo } from '../bridge';
import './InspectorPanel.css';

// Icon mapping
const ICONS: Record<string, React.ReactNode> = {
    Move: <Move size={14} />,
    Box: <Box size={14} />,
    Camera: <Camera size={14} />,
    Shield: <Shield size={14} />,
    Magnet: <Magnet size={14} />,
    Code: <Code size={14} />,
    Sun: <Sun size={14} />,
};

// Property Editors
const Vector3Input: React.FC<{
    value: [number, number, number];
    onChange: (value: [number, number, number]) => void;
}> = ({ value, onChange }) => {
    const handleChange = (index: number, val: string) => {
        const newValue: [number, number, number] = [...value];
        newValue[index] = parseFloat(val) || 0;
        onChange(newValue);
    };

    return (
        <div className="vector3-group">
            <span className="vector3-label x">X</span>
            <input
                type="number"
                className="editor-input editor-input-number"
                value={value[0]}
                onChange={(e) => handleChange(0, e.target.value)}
                step={0.1}
            />
            <span className="vector3-label y">Y</span>
            <input
                type="number"
                className="editor-input editor-input-number"
                value={value[1]}
                onChange={(e) => handleChange(1, e.target.value)}
                step={0.1}
            />
            <span className="vector3-label z">Z</span>
            <input
                type="number"
                className="editor-input editor-input-number"
                value={value[2]}
                onChange={(e) => handleChange(2, e.target.value)}
                step={0.1}
            />
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
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {ICONS[info?.icon || 'Box'] || <Box size={14} />}
                <span className="component-name">{info?.label || component.type}</span>
                {component.type !== 'Transform' && (
                    <button
                        className="component-remove"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeComponent(entityId, component.type);
                        }}
                    >
                        <Trash2 size={12} />
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
                    {ICONS[comp.icon] || <Box size={14} />}
                    <span>{comp.label}</span>
                </div>
            ))}
        </div>
    );
};

export const InspectorPanel: React.FC = () => {
    const [showAddMenu, setShowAddMenu] = useState(false);
    const { selectedEntityId } = useEditorStore();
    const { getEntity, renameEntity } = useSceneStore();

    const entity = selectedEntityId !== null ? getEntity(selectedEntityId) : undefined;

    return (
        <div className="editor-panel inspector-panel glass-panel">
            <div className="editor-panel-header">
                <span>Inspector</span>
            </div>

            <div className="editor-panel-content">
                {!entity ? (
                    <div className="inspector-empty-state">
                        <MousePointer2 size={40} className="empty-icon" />
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

                        {/* Components */}
                        <div className="components-list">
                            {entity.components.map((comp, idx) => (
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
                                <Plus size={14} /> Add Component
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
