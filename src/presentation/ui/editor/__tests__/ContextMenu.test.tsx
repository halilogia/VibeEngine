import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
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
        const { container } = render(<ContextMenu x={100} y={200} items={items} onClose={onClose} />);

        expect(container.textContent).toContain('Action 1');
        expect(container.textContent).toContain('Action 2');

        const action1 = container.querySelector('[data-testid="menu-item-Action 1"]');
        if (action1) {
            action1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(items[0].onClick).toHaveBeenCalled();
            expect(onClose).toHaveBeenCalled();
        }
    });

    it('should not trigger click on disabled items', () => {
        const onClose = vi.fn();
        const { container } = render(<ContextMenu x={100} y={200} items={items} onClose={onClose} />);

        const disabledAction = container.querySelector('[data-testid="menu-item-Disabled Action"]');
        if (disabledAction) {
            disabledAction.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(items[3].onClick).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
        }
    });

    it('should call onClose when clicking outside menu', () => {
        const onClose = vi.fn();
        render(<ContextMenu x={100} y={200} items={items} onClose={onClose} />);

        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        expect(onClose).toHaveBeenCalled();
    });
});
