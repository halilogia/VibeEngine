/**
 * HierarchyPanel - Entity tree view
 */

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Box, Plus, Trash2 } from 'lucide-react';
import { useSceneStore, useEditorStore, type EntityData } from '../stores';
import './HierarchyPanel.css';

interface TreeNodeProps {
    entity: EntityData;
    depth: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ entity, depth }) => {
    const [expanded, setExpanded] = useState(true);
    const { entities } = useSceneStore();
    const { selectedEntityId, selectEntity } = useEditorStore();

    const hasChildren = entity.children.length > 0;
    const isSelected = selectedEntityId === entity.id;

    return (
        <div className="tree-node">
            <div
                className={`tree-item ${isSelected ? 'selected' : ''}`}
                style={{ paddingLeft: depth * 16 + 8 }}
                onClick={() => selectEntity(entity.id)}
            >
                {hasChildren ? (
                    <span
                        className="tree-expand"
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                    >
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                ) : (
                    <span className="tree-expand-placeholder" />
                )}

                <Box size={14} className="tree-item-icon" />
                <span className="tree-item-label">{entity.name}</span>
            </div>

            {expanded && hasChildren && (
                <div className="tree-children">
                    {entity.children.map(childId => {
                        const child = entities.get(childId);
                        return child ? (
                            <TreeNode key={childId} entity={child} depth={depth + 1} />
                        ) : null;
                    })}
                </div>
            )}
        </div>
    );
};

export const HierarchyPanel: React.FC = () => {
    const { entities, rootEntityIds, addEntity, removeEntity } = useSceneStore();
    const { selectedEntityId, selectEntity, clearSelection } = useEditorStore();

    const handleAddEntity = () => {
        const id = addEntity('New Entity', null);
        selectEntity(id);
    };

    const handleDelete = () => {
        if (selectedEntityId !== null) {
            removeEntity(selectedEntityId);
            clearSelection();
        }
    };

    return (
        <div className="editor-panel hierarchy-panel">
            <div className="editor-panel-header">
                <span>Hierarchy</span>
                <div className="panel-actions">
                    <button className="panel-action-btn" onClick={handleAddEntity} title="Add Entity">
                        <Plus size={14} />
                    </button>
                    <button
                        className="panel-action-btn"
                        onClick={handleDelete}
                        disabled={selectedEntityId === null}
                        title="Delete Entity"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="editor-panel-content">
                {rootEntityIds.length === 0 ? (
                    <div className="empty-state">
                        <p>No entities</p>
                        <button className="editor-btn primary" onClick={handleAddEntity}>
                            <Plus size={14} /> Add Entity
                        </button>
                    </div>
                ) : (
                    <div className="tree-view">
                        {rootEntityIds.map(id => {
                            const entity = entities.get(id);
                            return entity ? (
                                <TreeNode key={id} entity={entity} depth={0} />
                            ) : null;
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
