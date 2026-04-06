import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { VibeIcons, VibeIconName } from '../VibeIcons';

describe('VibeIcons', () => {
    const iconNames = [
        'Activity', 'Layers', 'Box', 'Plus', 'Trash', 'Move', 
        'RotateCcw', 'Maximize', 'Play', 'Pause', 'Save', 
        'Download', 'Upload', 'Search', 'Settings', 'Maximize2', 
        'Minimize2', 'ChevronRight', 'ChevronDown', 'Info', 
        'AlertCircle', 'AlertTriangle', 'CheckCircle', 'Terminal', 
        'Eye', 'X', 'Undo', 'Redo', 'Clipboard', 'Package', 
        'Send', 'Bot', 'User', 'Wand', 'WifiOff', 'Cpu', 'Grip'
    ];

    it('should render all registered icons without crashing', () => {
        iconNames.forEach(name => {
            const { container } = render(<VibeIcons name={name as VibeIconName} />);
            const svg = container.querySelector('svg');
            expect(svg).toBeDefined();
            expect(svg?.getAttribute('width')).toBe('18'); 
        });
    });

    it('should apply custom size and color', () => {
        const { container } = render(<VibeIcons name="Box" size={32} color="#ff0000" />);
        const svg = container.querySelector('svg');
        expect(svg?.getAttribute('width')).toBe('32');
        expect(svg?.getAttribute('height')).toBe('32');
        
        expect(svg?.getAttribute('stroke')?.toLowerCase()).toBe('#ff0000');
    });

    it('should apply custom styles', () => {
        const { container } = render(<VibeIcons name="Activity" style={{ opacity: '0.5' }} />);
        const svg = container.querySelector('svg') as SVGSVGElement;
        expect(svg?.style.opacity).toBe('0.5');
    });
});