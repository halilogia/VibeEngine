import React, { useCallback, useRef, useState } from 'react';
import { useEditorStore } from '@infrastructure/store';

export const usePanelResize = () => {
    const { 
        leftWidth, rightWidth, bottomHeight, inspectorWidth, assetsWidth, consoleWidth, setPanelSize 
    } = useEditorStore();

    const [isResizing, setIsResizing] = useState<string | null>(null);
    const currentSizes = useRef({
        L: leftWidth, R: rightWidth, B: bottomHeight, I: inspectorWidth, A: assetsWidth, C: consoleWidth
    });

    // Sync ref
    React.useEffect(() => {
        currentSizes.current = {
            L: leftWidth, R: rightWidth, B: bottomHeight, I: inspectorWidth, A: assetsWidth, C: consoleWidth
        };
    }, [leftWidth, rightWidth, bottomHeight, inspectorWidth, assetsWidth, consoleWidth]);

    const handleResize = useCallback((dir: 'L' | 'R' | 'B' | 'I' | 'A' | 'C') => (e: React.MouseEvent) => {
        const startX = e.clientX;
        const startY = e.clientY;
        const initial = { ...currentSizes.current };
        
        document.body.style.cursor = dir === 'B' ? 'row-resize' : 'col-resize';
        document.body.style.userSelect = 'none';
        setIsResizing(dir);

        const onMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            if (dir === 'L') {
                const val = Math.max(180, Math.min(600, initial.L + deltaX));
                document.documentElement.style.setProperty('--v-left-width', `${val}px`);
                currentSizes.current.L = val;
                setPanelSize('left', val);
            }
            if (dir === 'R') {
                const val = Math.max(280, Math.min(800, initial.R - deltaX));
                document.documentElement.style.setProperty('--v-right-width', `${val}px`);
                currentSizes.current.R = val;
                setPanelSize('right', val);
            }
            if (dir === 'B') {
                const val = Math.max(120, Math.min(window.innerHeight - 100, initial.B - deltaY));
                document.documentElement.style.setProperty('--v-bottom-height', `${val}px`);
                currentSizes.current.B = val;
                setPanelSize('bottom', val);
            }
            if (dir === 'A') {
                const val = Math.max(200, Math.min(1200, initial.A + deltaX));
                document.documentElement.style.setProperty('--v-assets-width', `${val}px`);
                currentSizes.current.A = val;
                setPanelSize('assets', val);
            }
            if (dir === 'C') {
                const val = Math.max(200, Math.min(1200, initial.C + deltaX));
                document.documentElement.style.setProperty('--v-console-width', `${val}px`);
                currentSizes.current.C = val;
                setPanelSize('console', val);
            }
            if (dir === 'I') {
                const potI = Math.max(220, initial.I + deltaX);
                const potR = Math.max(220, initial.R - deltaX);
                document.documentElement.style.setProperty('--v-inspector-width', `${potI}px`);
                document.documentElement.style.setProperty('--v-right-width', `${potR}px`);
                currentSizes.current.I = potI;
                currentSizes.current.R = potR;
                setPanelSize('inspector', potI);
                setPanelSize('right', potR);
            }
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            setIsResizing(null);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }, [setPanelSize]);

    return { handleResize, isResizing };
};
