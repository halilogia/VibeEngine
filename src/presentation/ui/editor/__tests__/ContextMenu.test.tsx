import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { ContextMenu, type ContextMenuItem } from '../ContextMenu';

describe('ContextMenu', () => {
    const items: ContextMenuItem[] = [
        { label: 'Action 1', onClick: vi.fn() },
        { label: 'Action 2', onClick: vi.fn(), danger: true },
        { divider: true, label: '' },
        { label: 'Disabled Action', onClick: vi.fn(), disabled: true }
    ];

    it('should render all menu items and handle clicks', () => {
        const onClose = vi.fn();
        render(<ContextMenu x={100} y={200} items={items} onClose={onClose} />);

        // Check if items are rendered
        expect(screen.getByText('Action 1')).toBeDefined();
        expect(screen.getByText('Action 2')).toBeDefined();

        // Click an item
        fireEvent.click(screen.getByText('Action 1'));
        expect(items[0].onClick).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it('should not trigger click on disabled items', () => {
        const onClose = vi.fn();
        render(<ContextMenu x={100} y={200} items={items} onClose={onClose} />);

        fireEvent.click(screen.getByText('Disabled Action'));
        expect(items[3].onClick).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('should call onClose when clicking outside menu', () => {
        const onClose = vi.fn();
        render(<ContextMenu x={100} y={200} items={items} onClose={onClose} />);
        
        // Target document.body to simulate a real click outside the menu ref
        fireEvent.mouseDown(document.body);
        expect(onClose).toHaveBeenCalled();
    });
});
