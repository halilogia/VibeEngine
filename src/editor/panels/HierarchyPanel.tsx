/**
 * HierarchyPanel - Entity tree view
 */

import React, { useState } from 'react';
import { VibeIcons } from '../../presentation/components/VibeIcons';
import { useSceneStore, useEditorStore, type EntityData } from '../stores';
import { ContextMenu, type ContextMenuItem } from '../components/ContextMenu';
import './HierarchyPanel.css';

interface SearchHighlightProps {
    text: string;
    search: string;
}

const SearchHighlight: React.FC<SearchHighlightProps> = ({ text, search }) => {
    if (!search || !text.toLowerCase().includes(search.toLowerCase())) {
        return <span>{text}</span>;
    }

    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) => 
                part.toLowerCase() === search.toLowerCase() ? (
                    <mark key={i} className="search-highlight">{part}</mark>
                ) : (
                    part
                )
            )}
        </span>
    );
};

// Helper to get icon based on component types
const getEntityIcon = (entity: EntityData) => {
    const componentTypes = entity.components.map(c => c.type);
    
    if (componentTypes.includes('Light')) return <VibeIcons name="Sun" size={14} className="icon-light" />;
    if (componentTypes.includes('Camera')) return <VibeIcons name="Video" size={14} className="icon-camera" />;
    if (componentTypes.includes('Physics')) return <VibeIcons name="Shield" size={14} className="icon-physics" />;
    if (componentTypes.includes('Script')) return <VibeIcons name="Sparkles" size={14} className="icon-script" />;
    if (componentTypes.includes('Render')) return <VibeIcons name="Box" size={14} className="icon-render" />;
    
    return <VibeIcons name="Layers" size={14} className="icon-default" />;
};

interface TreeNodeProps {
    entity: EntityData;
    depth: number;
    searchQuery: string;
    onContextMenu: (e: React.MouseEvent, entityId: number) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ entity, depth, searchQuery, onContextMenu }) => {
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
                onContextMenu={(e) => onContextMenu(e, entity.id)}
            >
                {hasChildren ? (
                    <span
                        className="tree-expand"
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                    >
                        {expanded ? <VibeIcons name="ChevronDown" size={14} /> : <VibeIcons name="ChevronRight" size={14} />}
                    </span>
                ) : (
                    <span className="tree-expand-placeholder" />
                )}

                <VibeIcons name="Box" size={14} className="tree-item-icon" />
                <span className="tree-item-label">
                    <SearchHighlight text={entity.name} search={searchQuery} />
                </span>
            </div>

            {expanded && hasChildren && (
                <div className="tree-children">
                    {entity.children.map(childId => {
                        const child = entities.get(childId);
                        return child ? (
                            <TreeNode 
                                key={childId} 
                                entity={child} 
                                depth={depth + 1} 
                                searchQuery={searchQuery}
                                onContextMenu={onContextMenu}
                            />
                        ) : null;
                    })}
                </div>
            )}
        </div>
    );
};

export const HierarchyPanel: React.FC = () => {
    const { entities, rootEntityIds, addEntity, removeEntity } = useSceneStore();
    const { 
        selectedEntityId, selectEntity, clearSelection,
        activePanelId, setActivePanel 
    } = useEditorStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; entityId: number } | null>(null);

    const handleAddEntity = () => {
        const id = addEntity('New Entity', null);
        selectEntity(id);
    };

    const handleDelete = (id: number) => {
        removeEntity(id);
        if (selectedEntityId === id) {
            clearSelection();
        }
    };

    const handleDuplicate = (id: number) => {
        const original = entities.get(id);
        if (original) {
            const newId = addEntity(`${original.name} (Copy)`, original.parentId);
            // Copy components (shallow for now)
            original.components.forEach(comp => {
                // TODO: deep copy and addComponent
                console.log('Duplication details in development...');
            });
            selectEntity(newId);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, entityId: number) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, entityId });
    };

    const contextMenuItems: ContextMenuItem[] = contextMenu ? [
        { 
            label: 'Duplicate', 
            icon: <VibeIcons name="Copy" size={12} />, 
            onClick: () => handleDuplicate(contextMenu.entityId) 
        },
        { 
            label: 'Rename', 
            icon: <VibeIcons name="Plus" size={12} />, 
            onClick: () => { /* Select first then prompt? */ } 
        },
        { divider: true, label: '' },
        { 
            label: 'Delete', 
            icon: <VibeIcons name="Trash" size={12} />, 
            danger: true, 
            onClick: () => handleDelete(contextMenu.entityId) 
        },
    ] : [];

    const filteredRootIds = rootEntityIds.filter(id => {
        const entity = entities.get(id);
        if (!searchQuery) return true;
        return entity?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div 
            className={`editor-panel hierarchy-panel glass-panel ${activePanelId === 'hierarchy' ? 'active-panel' : ''}`}
            onClick={() => setActivePanel('hierarchy')}
        >
            <div className="panel-header">
                <div className="panel-header-left">
                    <VibeIcons name="Layers" size={16} />
                    <h2>HIERARCHY</h2>
                </div>
                <div className="panel-header-actions">
                    <button className="panel-action-btn" onClick={handleAddEntity} title="Add Entity">
                        <VibeIcons name="Plus" size={14} />
                    </button>
                    <button
                        className="panel-action-btn"
                        onClick={() => selectedEntityId && handleDelete(selectedEntityId)}
                        disabled={selectedEntityId === null}
                        title="Delete Entity"
                    >
                        <VibeIcons name="Trash" size={14} />
                    </button>
                </div>
            </div>

            <div className="hierarchy-toolbar">
                <div className="hierarchy-search">
                    <VibeIcons name="Search" size={14} />
                    <input
                        type="text"
                        placeholder="Filter entities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="editor-panel-content">
                {filteredRootIds.length === 0 ? (
                    <div className="hierarchy-empty-state">
                        <div className="empty-state-icon">
                            <VibeIcons name="Box" size={40} />
                        </div>
                        <h3>{searchQuery ? 'No matches' : 'No entities in scene'}</h3>
                        <p>{searchQuery ? 'Try a different search term or clear filters.' : 'Create your first object to start building.'}</p>
                        {!searchQuery && (
                            <button className="editor-btn primary" onClick={handleAddEntity}>
                                <VibeIcons name="Plus" size={14} /> Add Entity
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="tree-view">
                        {filteredRootIds.map(id => {
                            const entity = entities.get(id);
                            return entity ? (
                                <TreeNode 
                                    key={id} 
                                    entity={entity} 
                                    depth={0} 
                                    searchQuery={searchQuery}
                                    onContextMenu={handleContextMenu}
                                />
                            ) : null;
                        })}
                    </div>
                )}
            </div>

            {contextMenu && (
                <ContextMenu 
                    x={contextMenu.x} 
                    y={contextMenu.y} 
                    items={contextMenuItems} 
                    onClose={() => setContextMenu(null)} 
                />
            )}
        </div>
    );
};
