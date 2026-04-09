import { VibeTheme } from '@themes/VibeStyles';

export const viewportAnimations = `
    @keyframes live-pulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
        70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    @keyframes focus-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
    @keyframes slide-in-top { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes slide-in-bottom { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
`;

export const extendedViewportStyles = {
    cameraInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
    viewModeBadge: {
        display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
        background: 'rgba(16, 185, 129, 0.1)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px',
        fontSize: '10px', fontWeight: 600, color: '#10b981', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase',
    },
    performanceHud: {
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', padding: '8px 14px',
        background: VibeTheme.colors.glassBg, backdropFilter: 'blur(30px) saturate(180%)',
        border: `1px solid ${VibeTheme.colors.glassBorder}`, borderRadius: '14px', minWidth: '120px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    },
    performanceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
    performanceLabel: { fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.5px' },
    performanceValue: { fontSize: '10px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textAlign: 'right' },
    performanceValueGood: { color: '#10b981' },
    performanceValueWarn: { color: '#f59e0b' },
    performanceValueBad: { color: '#ef4444' },
    gridInfo: {
        display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
        background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px',
        fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace",
    }
};
