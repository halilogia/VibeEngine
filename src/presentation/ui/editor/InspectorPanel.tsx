import React, { useState } from 'react';
import { 
    VibeIcon, 
    VibeButton, 
    VibeInput, 
    VibeDivider, 
    VibeTooltip,
    VibeSelect
} from '@ui/atomic';
import { useSceneStore, useEditorStore } from '@infrastructure/store';
import { VibeTheme } from '@themes/VibeStyles';
import { inspectorStyles as styles } from './InspectorPanel.styles';
import { TransformSection, ComponentSection } from './InspectorPanel.parts';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPONENT_REGISTRY } from '@engine/core/ComponentRegistry';

/**
 * 🔍 INSPECTOR PANEL - The Detail Lens
 * Provides deep introspection and real-time editing of entity properties,
 * components, and engine-level parameters.
 */
export const InspectorPanel: React.FC = () => {
    const { entities, selectedEntityId, updateComponent, addComponent, removeComponent } = useSceneStore();
    const { activePanelId, setActivePanel } = useEditorStore();
    
    const [isAddComponentOpen, setIsAddComponentOpen] = useState(false);

    const selectedEntity = selectedEntityId ? entities.get(selectedEntityId) : null;

    if (!selectedEntity) {
        return (
            <div style={styles.emptyContainer}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.emptyState}>
                    <VibeIcon name="MousePointer" size={48} color={VibeTheme.colors.textSubtle + '44'} />
                    <h3 style={{ margin: '16px 0 8px', color: VibeTheme.colors.textSubtle }}>No Entity Selected</h3>
                    <p style={{ margin: 0, color: VibeTheme.colors.textSubtle + '88', fontSize: '13px' }}>Select an entity in the hierarchy to inspect its properties.</p>
                </motion.div>
            </div>
        );
    }

    const availableComponents = COMPONENT_REGISTRY.filter(
        c => !selectedEntity.components.some(ec => ec.type === c.type)
    );

    return (
        <div 
            style={{ 
                ...styles.container, 
                border: activePanelId === 'inspector' ? `1px solid ${VibeTheme.colors.accentPrimary}44` : styles.container.border 
            }}
            onClick={() => setActivePanel('inspector')}
        >
            {/* 🏷️ PANEL HEADER */}
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <VibeIcon name="Settings" size={16} color={VibeTheme.colors.accentPrimary} />
                    <span style={styles.title}>Inspector</span>
                </div>
                <VibeButton variant="ghost" size="xs" icon="MoreVertical" />
            </div>

            {/* 🆔 ENTITY BASIC INFO */}
            <div style={styles.entitySummary}>
                <div style={styles.iconBox}>
                    <VibeIcon name="Cube" size={24} color={VibeTheme.colors.accentPrimary} />
                </div>
                <div style={{ flex: 1 }}>
                    <VibeInput 
                        value={selectedEntity.name} 
                        onChange={(val) => console.log('Rename to:', val)}
                        variant="transparent"
                        style={{ fontSize: '15px', fontWeight: 700, padding: 0 }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <VibeTooltip content="Entity ID"><span style={styles.entityId}>#{selectedEntity.id}</span></VibeTooltip>
                        <span style={styles.entityTag}>Active</span>
                    </div>
                </div>
                <VibeButton variant="ghost" size="sm" icon={selectedEntity.visible ? 'Eye' : 'EyeOff'} />
            </div>

            <VibeDivider />

            {/* 🧩 COMPONENTS LIST */}
            <div style={styles.scrollArea}>
                <AnimatePresence mode="popLayout">
                    {selectedEntity.components.map((component, index) => {
                        const isTransform = component.type === 'Transform';
                        return (
                            <motion.div
                                key={component.type}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={styles.section}
                            >
                                {isTransform ? (
                                    <TransformSection 
                                        data={component.data} 
                                        onChange={(updates) => updateComponent(selectedEntity.id, 'Transform', updates)} 
                                    />
                                ) : (
                                    <ComponentSection 
                                        type={component.type}
                                        data={component.data}
                                        onRemove={() => removeComponent(selectedEntity.id, component.type)}
                                        onChange={(updates) => updateComponent(selectedEntity.id, component.type, updates)}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* ➕ ADD COMPONENT BUTTON */}
                <div style={{ padding: '20px 16px', position: 'relative' }}>
                    <VibeButton 
                        label="Add Component" 
                        icon="Plus" 
                        variant="soft" 
                        fullWidth 
                        onClick={() => setIsAddComponentOpen(!isAddComponentOpen)}
                    />

                    <AnimatePresence>
                        {isAddComponentOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                style={styles.addComponentMenu}
                            >
                                <div style={styles.menuHeader}>Available Components</div>
                                <div style={styles.menuList}>
                                    {availableComponents.map(comp => (
                                        <div 
                                            key={comp.type} 
                                            style={styles.menuItem} 
                                            onClick={() => {
                                                addComponent(selectedEntity.id, { type: comp.type as any, data: {} });
                                                setIsAddComponentOpen(false);
                                            }}
                                        >
                                            <VibeIcon name="Plus" size={12} color={VibeTheme.colors.accentPrimary} />
                                            <span>{comp.type}</span>
                                        </div>
                                    ))}
                                    {availableComponents.length === 0 && (
                                        <div style={{ padding: '12px', fontSize: '11px', color: VibeTheme.colors.textSubtle, textAlign: 'center' }}>
                                            All components added
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
