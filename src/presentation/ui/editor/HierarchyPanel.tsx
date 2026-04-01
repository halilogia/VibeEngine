/**
 * HierarchyPanel - Entity tree view (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useState } from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useSceneStore, useEditorStore, type EntityData } from '@infrastructure/store';
import { ContextMenu, type ContextMenuItem } from '@ui/editor/ContextMenu';
import { SovereignHeader } from '@ui/atomic/molecules/SovereignHeader';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeInput } from '@ui/atomic/atoms/VibeInput';
import { VibeTheme } from '@themes/VibeStyles';
import { hierarchyStyles as styles } from './HierarchyPanel.styles';

/**
 * Props for the SearchHighlight component
 */
interface SearchHighlightProps {
    /** The full text to search within */
    text: string;
    /** The search query string for highlighting */
    search: string;
}

/**
 * SearchHighlight - UI component for visual search matching.
 */
const SearchHighlight: React.FC<SearchHighlightProps> = ({ text, search }) => {
    if (!search || !text.toLowerCase().includes(search.toLowerCase())) {
        return <span>{text}</span>;
    }

    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) => 
                part.toLowerCase() === search.toLowerCase() ? (
                    <mark key={i} style={{ background: VibeTheme.colors.accent, color: '#fff', borderRadius: '2px', padding: '0 2px' }}>{part}</mark>
                ) : (
                    part
                )
            )}
        </span>
    );
};

/**
 * Props for the TreeNode component
 */
interface TreeNodeProps {
    /** Entity data to display in this tree node */
    entity: EntityData;
    /** Current indentation level in the tree hiearchy */
    depth: number;
    /** Current global search query for highlighting names */
    searchQuery: string;
    /** Callback for triggering the context menu on this node */
    onContextMenu: (e: React.MouseEvent, entityId: number) => void;
}

/**
 * TreeNode - Individual recursive element in the entity hierarchy.
 * Handles selection, expansion, and context menu triggers.
 */
const TreeNode: React.FC<TreeNodeProps> = ({ entity, depth, searchQuery, onContextMenu }) => {
    const [expanded, setExpanded] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const { entities } = useSceneStore();
    const { selectedEntityId, selectEntity } = useEditorStore();

    const hasChildren = entity.children.length > 0;
    const isSelected = selectedEntityId === entity.id;

    const getNodeStyle = (): React.CSSProperties => {
        let s: React.CSSProperties = { 
            ...styles.treeItem, 
            paddingLeft: depth * 16 + 12 
        };
        if (isSelected) s = { ...s, ...styles.treeItemSelected };
        else if (isHovered) s = { ...s, ...styles.treeItemHover };
        return s;
    };

    return (
        <div className="tree-node">
            <div
                className={`tree-item ${isSelected ? 'selected' : ''}`}
                style={getNodeStyle()}
                onClick={() => selectEntity(entity.id)}
                onContextMenu={(e) => onContextMenu(e, entity.id)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {hasChildren ? (
                    <span
                        className="tree-expand"
                        style={{ display: 'flex', alignItems: 'center', opacity: 0.6 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                    >
                        {expanded ? <VibeIcons name="ChevronDown" size={14} /> : <VibeIcons name="ChevronRight" size={14} />}
                    </span>
                ) : (
                    <span style={{ width: '14px' }} />
                )}

                <VibeIcons name="Box" size={14} style={{ opacity: 0.7 }} />
                <span className="tree-item-label" style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

/**
 * Props for the HierarchyPanel component
 */
interface HierarchyPanelProps {
    /** Drag handle props from the docking system */
    dragHandleProps?: any;
}

/**
 * HierarchyPanel - Entity tree view and scene structure manager.
 * 🏛️⚛️💎🚀
 * 
 * Provides a high-fidelity visual representation of the scene graph, supporting
 * recursive entity traversal, selection, and context-driven operations.
 */
export const HierarchyPanel: React.FC<HierarchyPanelProps> = ({ dragHandleProps }) => {
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

    const headerActions = (
        <>
            <VibeButton variant="ghost" size="sm" onClick={handleAddEntity} title="Add Entity">
                <VibeIcons name="Plus" size={14} />
            </VibeButton>
            <VibeButton 
                variant="ghost" 
                size="sm" 
                onClick={() => selectedEntityId && handleDelete(selectedEntityId)}
                disabled={selectedEntityId === null}
                title="Delete Entity"
            >
                <VibeIcons name="Trash" size={14} />
            </VibeButton>
        </>
    );

    return (
        <div 
            className={`editor-panel hierarchy-panel ${activePanelId === 'hierarchy' ? 'active-panel' : ''}`}
            onClick={() => setActivePanel('hierarchy')}
            style={styles.panel}
        >
            <SovereignHeader 
                title="HIERARCHY" 
                icon="Layers" 
                dragHandleProps={dragHandleProps}
                actions={headerActions}
            />

            <div className="hierarchy-toolbar" style={styles.toolbar}>
                <div className="hierarchy-search" style={styles.searchWrapper}>
                    <VibeIcons name="Search" size={14} style={{ opacity: 0.5 }} />
                    <VibeInput
                        placeholder="Filter entities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none' }}
                    />
                </div>
            </div>

            <div className="editor-panel-content" style={styles.content}>
                {filteredRootIds.length === 0 ? (
                    <div className="hierarchy-empty-state" style={styles.emptyState}>
                        <VibeIcons name="Box" size={40} style={{ opacity: 0.3 }} />
                        <h3 style={styles.emptyTitle}>{searchQuery ? 'No matches' : 'No entities in scene'}</h3>
                        <p style={styles.emptyDesc}>{searchQuery ? 'Try a different search term.' : 'Create your first object to start building.'}</p>
                        {!searchQuery && (
                            <VibeButton variant="primary" onClick={handleAddEntity}>
                                <VibeIcons name="Plus" size={14} /> Add Entity
                            </VibeButton>
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

