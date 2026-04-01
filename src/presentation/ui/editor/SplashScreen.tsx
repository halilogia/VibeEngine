/**
 * SplashScreen (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useState, useEffect } from 'react';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { splashStyles as styles, splashAnimations } from './SplashScreen.styles';

interface SplashScreenProps {
    onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [fadeOut, setFadeOut] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Initializing Engine...');
    const [userReady, setUserReady] = useState(false);

    useEffect(() => {
        try {
            const audio = new Audio('./assets/start.mp3');
            audio.volume = 0.5;
            audio.play().catch(err => {
                if (err.name !== 'AbortError') console.warn('Audio play failed:', err);
            });
        } catch (e) {}
    }, []);

    const handleStart = () => {
        setUserReady(true);
    };

    useEffect(() => {
        if (!userReady) return;

        const pollInterval = setInterval(() => {
            const loading = (window as any).VibeLoading;
            if (loading) {
                setProgress(loading.progress);
                setStatus(loading.details || 'Loading Modules...');

                if (loading.status === 'ready' && loading.progress >= 100) {
                    clearInterval(pollInterval);
                    setTimeout(() => {
                        setFadeOut(true);
                        setTimeout(onComplete, 800);
                    }, 800);
                }
            }
        }, 100);

        return () => clearInterval(pollInterval);
    }, [onComplete, userReady]);

    return (
        <div style={{ ...styles.container, opacity: fadeOut ? 0 : 1 }}>
            <style dangerouslySetInnerHTML={{ __html: splashAnimations }} />
            
            <div style={{ 
                ...styles.logo, 
                animation: 'logo-breathe 3s ease-in-out infinite' 
            }}>
                <img 
                    src="./assets/icon1.png" 
                    alt="VibeEngine" 
                    style={{ 
                        ...styles.logoImage, 
                        animation: 'logo-glow 2s ease-in-out infinite alternate' 
                    }} 
                />
            </div>

            {!userReady ? (
                <div style={{ ...styles.startOverlay, animation: 'fade-in 1s ease-out' }}>
                    <VibeButton 
                        variant="primary" 
                        size="lg" 
                        onClick={handleStart} 
                        style={{ 
                            padding: '16px 48px', 
                            borderRadius: '12px', 
                            letterSpacing: '4px',
                            position: 'relative',
                            overflow: 'hidden',
                            animation: 'button-pulse 3s ease-in-out infinite'
                        }}
                    >
                        <div style={{ ...styles.shimmerOverlay, animation: 'shimmer 2.5s infinite linear' }} />
                        START ENGINE
                    </VibeButton>
                    <p style={styles.startHint}>EXPERIENCE THE SOVEREIGN STUDIO</p>
                </div>
            ) : (
                <div style={{ ...styles.loadingContainer, animation: 'fade-in 1.5s ease-out' }}>
                    <div style={styles.barBg}>
                        <div 
                            style={{ ...styles.barFill, width: `${progress}%` }} 
                        />
                    </div>
                    <div style={styles.percentage}>{progress}%</div>
                    <div style={styles.status}>{status}</div>
                </div>
            )}
        </div>
    );
};
