import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SettingsGroup, SettingsGrid, SettingsField, SettingsInput, SettingsToggle } from '../SettingsComponents';
import { VibeTheme } from '@themes/VibeStyles';
import { useEditorStore, DEFAULT_SHORTCUTS, ShortcutBinding } from '@infrastructure/store';

const SHORTCUT_CATEGORIES = [
    {
        title: 'Viewport Controls',
        shortcuts: [
            { id: 'translate', label: 'Move Mode' },
            { id: 'rotate', label: 'Rotate Mode' },
            { id: 'scale', label: 'Scale Mode' },
        ]
    },
    {
        title: 'Edit',
        shortcuts: [
            { id: 'undo', label: 'Undo' },
            { id: 'redo', label: 'Redo' },
            { id: 'delete', label: 'Delete Selected' },
        ]
    },
    {
        title: 'File',
        shortcuts: [
            { id: 'save', label: 'Save Scene' },
            { id: 'newScene', label: 'New Scene' },
        ]
    },
    {
        title: 'General',
        shortcuts: [
            { id: 'commandPalette', label: 'Command Palette' },
            { id: 'escape', label: 'Deselect / Close' },
        ]
    },
];

const formatBinding = (binding: ShortcutBinding): string => {
    const parts: string[] = [];
    if (binding.ctrl) parts.push('Ctrl');
    if (binding.shift) parts.push('Shift');
    if (binding.alt) parts.push('Alt');
    if (binding.key) {
        const keyLabel = binding.key.charAt(0).toUpperCase() + binding.key.slice(1);
        parts.push(keyLabel);
    }
    return parts.join(' + ');
};

interface ShortcutKeyInputProps {
    binding: ShortcutBinding;
    onChange: (binding: ShortcutBinding) => void;
}

const ShortcutKeyInput: React.FC<ShortcutKeyInputProps> = ({ binding, onChange }) => {
    const [isRecording, setIsRecording] = useState(false);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const key = e.key.toLowerCase();
        
        // Ignore modifier keys alone
        if (['control', 'shift', 'alt', 'meta'].includes(key)) {
            return;
        }

        const newBinding: ShortcutBinding = {
            key: key === ' ' ? 'space' : key,
            ctrl: e.ctrlKey || e.metaKey,
            shift: e.shiftKey,
            alt: e.altKey,
        };

        onChange(newBinding);
        setIsRecording(false);
    }, [onChange]);

    const handleBlur = useCallback(() => {
        setIsRecording(false);
    }, []);

    return (
        <div
            onClick={() => setIsRecording(true)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            tabIndex={0}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '120px',
                padding: '6px 12px',
                background: isRecording ? VibeTheme.colors.accent + '20' : VibeTheme.colors.bgSubtle,
                border: `1px solid ${isRecording ? VibeTheme.colors.accent : VibeTheme.colors.glassBorder}`,
                borderRadius: '6px',
                color: isRecording ? VibeTheme.colors.accent : VibeTheme.colors.textMain,
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'monospace',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none',
            }}
        >
            {isRecording ? 'Press keys...' : formatBinding(binding)}
        </div>
    );
};

export const InputSettingsTab: React.FC = () => {
    const { engineConfig, updateEngineConfig, shortcuts, updateShortcut, resetShortcuts } = useEditorStore();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
            <SettingsGroup title="Mouse & Viewport">
                <SettingsGrid>
                    <SettingsField label="Camera Sensitivity">
                        <SettingsInput 
                            type="number" 
                            step="0.01" 
                            value={engineConfig.cameraSensitivity}
                            onChange={(e) => updateEngineConfig({ cameraSensitivity: parseFloat(e.target.value) || 0 })}
                        />
                    </SettingsField>
                    <SettingsField label="Interaction Margin">
                        <SettingsInput 
                            type="number" 
                            value={engineConfig.interactionMargin}
                            onChange={(e) => updateEngineConfig({ interactionMargin: parseInt(e.target.value) || 0 })}
                        />
                    </SettingsField>
                </SettingsGrid>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '3rem' }}>
                    <SettingsToggle 
                        label="Invert Zoom Direction" 
                        checked={engineConfig.invertY} 
                        onChange={(v) => updateEngineConfig({ invertY: v })} 
                    />
                    <SettingsToggle 
                        label="Enable Smart Snapping" 
                        checked={engineConfig.smartSnap} 
                        onChange={(v) => updateEngineConfig({ smartSnap: v })} 
                    />
                </div>
            </SettingsGroup>

            <SettingsGroup title="Keyboard Shortcuts">
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '16px',
                    padding: '0 4px'
                }}>
                    <span style={{ 
                        fontSize: '11px', 
                        color: VibeTheme.colors.textSecondary,
                        fontWeight: 500
                    }}>
                        Click a shortcut to change it
                    </span>
                    <button
                        onClick={resetShortcuts}
                        style={{
                            background: 'transparent',
                            border: `1px solid ${VibeTheme.colors.glassBorder}`,
                            color: VibeTheme.colors.textSecondary,
                            fontSize: '11px',
                            fontWeight: 500,
                            padding: '4px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = VibeTheme.colors.accent;
                            e.currentTarget.style.color = VibeTheme.colors.accent;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = VibeTheme.colors.glassBorder;
                            e.currentTarget.style.color = VibeTheme.colors.textSecondary;
                        }}
                    >
                        Reset All
                    </button>
                </div>

                {SHORTCUT_CATEGORIES.map((category) => (
                    <div key={category.title} style={{ marginBottom: '20px' }}>
                        <h4 style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: VibeTheme.colors.textSecondary,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '12px',
                            paddingLeft: '4px',
                        }}>
                            {category.title}
                        </h4>
                        {category.shortcuts.map((shortcut) => {
                            const binding = shortcuts[shortcut.id] || DEFAULT_SHORTCUTS[shortcut.id];
                            return (
                                <div 
                                    key={shortcut.id} 
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        marginBottom: '4px',
                                        transition: 'background 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = VibeTheme.colors.bgSubtle;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <span style={{ 
                                        fontSize: '13px', 
                                        color: VibeTheme.colors.textMain,
                                        fontWeight: 500,
                                    }}>
                                        {shortcut.label}
                                    </span>
                                    <ShortcutKeyInput
                                        binding={binding}
                                        onChange={(newBinding) => updateShortcut(shortcut.id, newBinding)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ))}
            </SettingsGroup>
        </motion.div>
    );
};