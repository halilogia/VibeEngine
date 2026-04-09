import React, { useState, useMemo } from 'react';
import { 
    VibeIcon, 
    VibeButton, 
    VibeInput, 
    VibeBadge, 
    VibeTooltip 
} from '@ui/atomic';
import { useSceneStore, useEditorStore } from '@infrastructure/store';
import { VibeTheme } from '@themes/VibeStyles';
import { hierarchyStyles as styles } from './HierarchyPanel.styles';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextMenu } from './ContextMenu';
import { EngineBridge } from '@engine';

/**
 * 🌳 HIERARCHY PANEL - The World Tree
 */
export const HierarchyPanel: React.FC = () => {
    const { entities, rootEntityIds, selectedEntityId, setSelectedEntityId, toggleEntityVisibility, removeEntity } = useSceneStore();
    const { activePanelId, setActivePanel } = useEditorStore();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, id: number } | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    const handleSelect = (id: number) => {
        setSelectedEntityId(id);
        setActivePanel('hierarchy');
        // Engine bridge sync if needed
        // EngineBridge.selectEntity(id); 
    };

    const toggleExpand = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleContextMenu = (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, id });
    };

    // Recursive Tree Node component
    const TreeNode = ({ id, depth }: { id: number, depth: number }) => {
        const entity = entities.get(id);
        if (!entity) return null;

        const hasChildren = entity.children && entity.children.length > 0;
        const isExpanded = expandedIds.has(id);
        const isSelected = selectedEntityId === id;

        // Search Filter Logic
        const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase());
        const hasMatchingChild = (entityId: number): boolean => {
            const ent = entities.get(entityId);
            if (!ent) return false;
            if (ent.name.toLowerCase().includes(searchQuery.toLowerCase())) return true;
            return ent.children.some(cid => hasMatchingChild(cid));
        };

        if (searchQuery && !matchesSearch && !hasMatchingChild(id)) return null;

        return (
            <div key={id}>
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => handleSelect(id)}
                    onContextMenu={(e) => handleContextMenu(e, id)}
                    style={{
                        ...styles.item,
                        paddingLeft: `${depth * 12 + 12}px`,
                        background: isSelected ? VibeTheme.colors.accentPrimary + '22' : 'transparent',
                        borderLeft: isSelected ? `2px solid ${VibeTheme.colors.accentPrimary}` : '2px solid transparent'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                        {hasChildren ? (
                            <div onClick={(e) => toggleExpand(id, e)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <VibeIcon 
                                    name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                                    size={10} 
                                    color={VibeTheme.colors.textSubtle} 
                                />
                            </div>
                        ) : (
                            <div style={{ width: 10 }} />
                        )}
                        
                        <VibeIcon 
                            name={entity.components.some(c => c.type === 'Camera') ? 'Camera' : 'Cube'} 
                            size={14} 
                            color={isSelected ? VibeTheme.colors.accentPrimary : VibeTheme.colors.textSubtle} 
                        />
                        
                        <span style={{ 
                            ...styles.itemName,
                            color: isSelected ? VibeTheme.colors.textMain : VibeTheme.colors.textSubtle,
                            fontWeight: isSelected ? 600 : 400
                        }}>
                            {entity.name}
                        </span>
                    </div>

                    <div className="entity-actions" style={{ display: 'flex', gap: '4px', opacity: isSelected ? 1 : 0 }}>
                        <VibeButton 
                            variant="ghost" 
                            size="xs" 
                            icon={entity.enabled ? 'Eye' : 'EyeOff'} 
                            onClick={(e) => { e.stopPropagation(); /* toggle functionality */ }} 
                        />
                    </div>
                </motion.div>

                {hasChildren && isExpanded && (
                    <div style={styles.childrenContainer}>
                        {entity.children.map(childId => (
                            <TreeNode key={childId} id={childId} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div 
            style={{ 
                ...styles.container, 
                border: activePanelId === 'hierarchy' ? `1px solid ${VibeTheme.colors.accentPrimary}44` : styles.container.border 
            }}
        >
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <VibeIcon name="Hierarchy" size={16} color={VibeTheme.colors.accentPrimary} />
                    <span style={styles.title}>Hierarchy</span>
                    <VibeBadge content={entities.size.toString()} variant="subtle" />
                </div>
            </div>

            <div style={{ padding: '8px 12px' }}>
                <VibeInput 
                    placeholder="Search entities..." 
                    value={searchQuery} 
                    onChange={setSearchQuery}
                    leftIcon="Search"
                    size="sm"
                    variant="filled"
                />
            </div>

            <div style={styles.treeContainer}>
                {rootEntityIds.length === 0 ? (
                    <div style={styles.emptyState}>
                        <VibeIcon name="Ghost" size={32} color={VibeTheme.colors.textSubtle} />
                        <span>No entities found</span>
                    </div>
                ) : (
                    rootEntityIds.map(id => <TreeNode key={id} id={id} depth={0} />)
                )}
            </div>

            {/* Context Menu Logic would go here, simplified for this fix */}
        </div>
    );
};