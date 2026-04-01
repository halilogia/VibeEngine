/**
 * SplashScreen Styles - Sovereign TypeScript Styling
 * 🏛️⚛️💎🚀
 */

import { createVibeStyles, VibeTheme } from '@themes/VibeStyles';

export const splashStyles = createVibeStyles({
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'opacity 0.8s ease-out',
    },
    logo: {
        width: '200px',
        height: '200px',
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        filter: 'drop-shadow(0 0 40px rgba(138, 43, 226, 0.6)) drop-shadow(0 0 80px rgba(0, 191, 255, 0.4))',
    },
    loadingContainer: {
        position: 'absolute',
        bottom: '12%',
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
    },
    barBg: {
        width: '100%',
        height: '6px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
    },
    barFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
        boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)',
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    percentage: {
        color: '#fff',
        fontSize: '14px',
        fontWeight: 700,
        marginTop: '-4px',
        letterSpacing: '1px',
    },
    status: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '11px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        fontWeight: 500,
    },
    startOverlay: {
        position: 'absolute',
        bottom: '15%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
    },
    startHint: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: '9px',
        letterSpacing: '3px',
        fontWeight: 600,
    }
});

// Animation Keyframes to be injected
export const splashAnimations = `
    @keyframes logo-breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
    }
    @keyframes logo-glow {
        0% { filter: drop-shadow(0 0 40px rgba(138, 43, 226, 0.6)) drop-shadow(0 0 60px rgba(0, 191, 255, 0.4)); }
        100% { filter: drop-shadow(0 0 60px rgba(138, 43, 226, 1)) drop-shadow(0 0 100px rgba(0, 191, 255, 0.8)); }
    }
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
