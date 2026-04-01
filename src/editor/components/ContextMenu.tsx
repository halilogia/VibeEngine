import React, { useEffect, useRef } from 'react';
import './ContextMenu.css';

export interface ContextMenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
    divider?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    // Adjust position if menu goes off screen
    const adjustedX = Math.min(x, window.innerWidth - 160);
    const adjustedY = Math.min(y, window.innerHeight - (items.length * 32 + 20));

    return (
        <div 
            className="context-menu glass-panel"
            ref={menuRef}
            style={{ top: adjustedY, left: adjustedX }}
        >
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {item.divider && <div className="context-menu-divider" />}
                    <div 
                        className={`context-menu-item ${item.danger ? 'danger' : ''}`}
                        onClick={() => {
                            item.onClick?.();
                            onClose();
                        }}
                    >
                        <span className="context-menu-icon">{item.icon}</span>
                        <span className="context-menu-label">{item.label}</span>
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};
