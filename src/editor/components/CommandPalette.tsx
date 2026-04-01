/**
 * CommandPalette - Elite global search and action hub
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, Box, Boxes, Sun, Video, Trash2, 
    Save, Play, Terminal, Layers, Info, Command,
    ChevronRight, Zap
} from 'lucide-react';
import { useEditorStore, useSceneStore } from '../stores';
import './CommandPalette.css';

interface CommandItem {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    category: 'Action' | 'Entity' | 'Panel';
    onSelect: () => void;
}

export const CommandPalette: React.FC = () => {
    const { showCommandPalette, toggleCommandPalette, play, stop, saveScene, togglePanel, selectEntity } = useEditorStore() as any;
    const { entities, addEntity, addComponent } = useSceneStore();
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Filter items based on search
    const getItems = (): CommandItem[] => {
        const items: CommandItem[] = [
            // Core Actions
            { id: 'add-cube', label: 'Add Cube', description: 'Create a primitive cube mesh', icon: <Box size={16} />, category: 'Action', onSelect: () => {
                const id = addEntity('Cube', null);
                addComponent(id, { type: 'Render', data: { meshType: 'cube', color: '#6366f1' }, enabled: true });
            }},
            { id: 'add-sphere', label: 'Add Sphere', description: 'Create a primitive sphere mesh', icon: <Boxes size={16} />, category: 'Action', onSelect: () => {
                const id = addEntity('Sphere', null);
                addComponent(id, { type: 'Render', data: { meshType: 'sphere', color: '#6366f1' }, enabled: true });
            }},
            { id: 'add-light', label: 'Add Point Light', description: 'Create a new point light source', icon: <Sun size={16} />, category: 'Action', onSelect: () => {
                const id = addEntity('Point Light', null);
                addComponent(id, { type: 'Light', data: { intensity: 1, distance: 10 }, enabled: true });
            }},
            { id: 'save-scene', label: 'Save Scene', description: 'Save current changes to disk', icon: <Save size={16} />, category: 'Action', onSelect: () => saveScene?.() },
            { id: 'play-simulation', label: 'Play / Stop', description: 'Toggle scene simulation', icon: <Play size={16} />, category: 'Action', onSelect: () => play() },

            // Panels
            { id: 'toggle-console', label: 'Toggle Console', description: 'Show or hide the console panel', icon: <Terminal size={16} />, category: 'Panel', onSelect: () => togglePanel('console') },
            { id: 'toggle-hierarchy', label: 'Toggle Hierarchy', description: 'Show or hide the hierarchy tree', icon: <Layers size={16} />, category: 'Panel', onSelect: () => togglePanel('hierarchy') },
            { id: 'toggle-ai', label: 'Toggle AI Copilot', description: 'Show or hide the AI assistant', icon: <Zap size={16} />, category: 'Panel', onSelect: () => togglePanel('aiCopilot') },
        ];

        // Add entities to searchable items
        entities.forEach((entity, id) => {
            items.push({
                id: `entity-${id}`,
                label: entity.name,
                description: `Navigate to Entity #${id}`,
                icon: <Info size={16} />,
                category: 'Entity',
                onSelect: () => selectEntity(id)
            });
        });

        if (!search) return items;

        return items.filter(item => 
            item.label.toLowerCase().includes(search.toLowerCase()) || 
            item.description.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase())
        );
    };

    const filteredItems = getItems();

    useEffect(() => {
        if (showCommandPalette) {
            setSearch('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [showCommandPalette]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') toggleCommandPalette(false);
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredItems.length);
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredItems[selectedIndex]) {
                filteredItems[selectedIndex].onSelect();
                toggleCommandPalette(false);
            }
        }
    };

    if (!showCommandPalette) return null;

    return (
        <div className="command-palette-overlay" onClick={() => toggleCommandPalette(false)}>
            <div className="command-palette-container glass-panel" onClick={e => e.stopPropagation()}>
                <div className="command-input-wrapper">
                    <Command size={18} className="command-prefix-icon" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder="Search commands, entities, or assets..." 
                        value={search}
                        onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="command-shortcuts">
                        <span className="kbd">ESC</span> to Close
                    </div>
                </div>

                <div className="command-results" ref={listRef}>
                    {filteredItems.length === 0 ? (
                        <div className="command-empty">No results found for "{search}"</div>
                    ) : (
                        filteredItems.map((item, index) => (
                            <div 
                                key={item.id} 
                                className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                                onMouseEnter={() => setSelectedIndex(index)}
                                onClick={() => { item.onSelect(); toggleCommandPalette(false); }}
                            >
                                <div className="command-item-icon">{item.icon}</div>
                                <div className="command-item-content">
                                    <div className="command-item-label">{item.label}</div>
                                    <div className="command-item-description">{item.description}</div>
                                </div>
                                <div className="command-item-category">{item.category}</div>
                                <ChevronRight size={14} className="command-item-chevron" />
                            </div>
                        ))
                    )}
                </div>

                <div className="command-footer">
                    <div className="footer-hint">↑↓ Navigate</div>
                    <div className="footer-hint">↵ Select</div>
                </div>
            </div>
        </div>
    );
};
