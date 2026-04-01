/**
 * CommandPalette (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useState, useEffect, useRef } from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useEditorStore, useSceneStore } from '@editor/stores';
import { VibeTheme, createVibeStyles } from '@themes/VibeStyles';

const styles = createVibeStyles({
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '100px',
    },
    container: {
        width: '600px',
        maxHeight: '500px',
        background: 'rgba(15, 15, 25, 0.9)',
        backdropFilter: 'blur(40px)',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        borderRadius: '16px',
        boxShadow: '0 32px 128px rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'palette-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    inputWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px 24px',
        borderBottom: `1px solid ${VibeTheme.colors.glassBorder}`,
    },
    input: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '18px',
        fontWeight: 600,
        outline: 'none',
    },
    results: {
        flex: 1,
        overflowY: 'auto',
        padding: '8px',
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '12px 16px',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
    },
    itemHover: {
        background: 'rgba(255, 255, 255, 0.08)',
        transform: 'translateX(4px)',
    },
    footer: {
        padding: '12px 24px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: `1px solid ${VibeTheme.colors.glassBorder}`,
        display: 'flex',
        gap: '24px',
        fontSize: '11px',
        color: VibeTheme.colors.textSecondary,
        fontWeight: 700,
    }
});

const animations = `
    @keyframes palette-in {
        from { opacity: 0; transform: translateY(-20px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }
`;

export const CommandPalette: React.FC = () => {
    const { showCommandPalette, toggleCommandPalette, play, selectEntity } = useEditorStore() as any;
    const { entities, addEntity, addComponent } = useSceneStore();
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const getItems = () => {
        const items = [
            { id: 'cube', label: 'Add Cube', desc: 'Create a primitive cube mesh', icon: 'Box', cat: 'Action', onSelect: () => {
                const id = addEntity('Cube', null);
                addComponent(id, { type: 'Render', data: { meshType: 'cube' }, enabled: true });
            }},
            { id: 'play', label: 'Play / Stop', desc: 'Toggle scene simulation', icon: 'Play', cat: 'Action', onSelect: play },
        ];
        if (!search) return items;
        return items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()));
    };

    const filteredItems = getItems();

    useEffect(() => {
        if (showCommandPalette) setTimeout(() => inputRef.current?.focus(), 50);
    }, [showCommandPalette]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') toggleCommandPalette(false);
        if (e.key === 'ArrowDown') setSelectedIndex(p => (p + 1) % filteredItems.length);
        if (e.key === 'ArrowUp') setSelectedIndex(p => (p - 1 + filteredItems.length) % filteredItems.length);
        if (e.key === 'Enter') { filteredItems[selectedIndex].onSelect(); toggleCommandPalette(false); }
    };

    if (!showCommandPalette) return null;

    return (
        <div style={styles.overlay} onClick={() => toggleCommandPalette(false)}>
            <style dangerouslySetInnerHTML={{ __html: animations }} />
            <div style={styles.container} onClick={e => e.stopPropagation()}>
                <div style={styles.inputWrapper}>
                    <VibeIcons name="Search" size={24} style={{ opacity: 0.5 }} />
                    <input 
                        ref={inputRef} 
                        style={styles.input} 
                        placeholder="Search commands..." 
                        value={search} 
                        onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div style={styles.results}>
                    {filteredItems.map((item, idx) => (
                        <div 
                            key={item.id}
                            style={{ 
                                ...styles.item, 
                                ...(idx === selectedIndex || hoveredIdx === idx ? styles.itemHover : {})
                            }}
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => setHoveredIdx(null)}
                            onClick={() => { item.onSelect(); toggleCommandPalette(false); }}
                        >
                            <VibeIcons name={item.icon as any} size={20} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '15px', fontWeight: 600 }}>{item.label}</div>
                                <div style={{ fontSize: '12px', color: VibeTheme.colors.textSecondary }}>{item.desc}</div>
                            </div>
                            <div style={{ fontSize: '10px', color: VibeTheme.colors.accent }}>{item.cat}</div>
                        </div>
                    ))}
                </div>
                <div style={styles.footer}>
                    <span>↑↓ NAVIGATE</span>
                    <span>↵ SELECT</span>
                    <span>ESC CLOSE</span>
                </div>
            </div>
        </div>
    );
};
