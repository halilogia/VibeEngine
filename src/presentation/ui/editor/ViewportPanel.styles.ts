import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';
import { extendedViewportStyles } from './ViewportPanel.shared';

export { viewportAnimations } from './ViewportPanel.shared';

export const viewportStyles = createVibeStyles({
    panel: {
        position: 'relative', width: '100%', height: '100%',
        background: VibeTheme.colors.bgPrimary, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', cursor: 'crosshair',
    },
    canvas: { width: '100%', height: '100%', display: 'block', outline: 'none' },
    overlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 16px', pointerEvents: 'auto' },
    bottomBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '12px 16px', pointerEvents: 'auto' },
    watermark: {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        fontSize: '14px', fontWeight: 300, letterSpacing: '16px', color: 'rgba(255,255,255,0.04)',
        textTransform: 'uppercase', pointerEvents: 'none', fontFamily: "'Inter', sans-serif",
    },
    liveIndicator: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
        background: 'rgba(239, 68, 68, 0.15)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '20px',
    },
    liveDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)' },
    liveText: { fontSize: '10px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" },
    pausedIndicator: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
        background: 'rgba(245, 158, 11, 0.15)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '20px',
    },
    pausedText: { fontSize: '10px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" },
    cameraBadge: {
        display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
        background: 'rgba(59, 130, 246, 0.1)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px',
        fontSize: '10px', fontWeight: 600, color: '#60a5fa', fontFamily: "'JetBrains Mono', monospace",
    },
    ...extendedViewportStyles,
    sceneInfo: {
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: '6px', padding: '8px 14px', background: VibeTheme.colors.glassBg,
        backdropFilter: 'blur(30px) saturate(180%)', border: `1px solid ${VibeTheme.colors.glassBorder}`,
        borderRadius: '14px', minWidth: '140px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    },
    selectionInfo: {
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: '4px', padding: '8px 12px', background: 'rgba(59, 130, 246, 0.1)',
        backdropFilter: 'blur(10px)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '10px',
    },
    selectionName: { fontSize: '11px', fontWeight: 600, color: '#60a5fa', fontFamily: "'JetBrains Mono', monospace" },
    selectionType: { fontSize: '9px', color: 'rgba(96, 165, 250, 0.6)', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" },
    raceHUD: {
        position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: '40px', padding: '24px 48px',
        background: 'rgba(10, 10, 20, 0.4)', backdropFilter: 'blur(30px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '30px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)', zIndex: 100,
    },
    raceHUDValue: { fontSize: '32px', fontWeight: 800, color: '#ffffff', fontFamily: "'Inter', sans-serif" },
    raceHUDLabel: { fontSize: '10px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '2px' },
    focusIndicator: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '20px', height: '20px' },
    focusCrosshairH: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '20px', height: '1px', background: 'rgba(255, 255, 255, 0.3)' },
    focusCrosshairV: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '1px', height: '20px', background: 'rgba(255, 255, 255, 0.3)' },
    orientationGizmo: { position: 'absolute', bottom: '40px', right: '25px', width: '100px', height: '100px', zIndex: 10 },
});