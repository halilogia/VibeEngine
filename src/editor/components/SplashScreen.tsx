/**
 * SplashScreen - Logo animation with sound (10 seconds)
 */

import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [fadeOut, setFadeOut] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Initializing Engine...');
    const [userReady, setUserReady] = useState(false);

    const handleStart = () => {
        setUserReady(true);
        // Play startup sound after interaction
        try {
            const audio = new Audio('./assets/start.mp3');
            audio.volume = 0.5;
            audio.play().catch(err => console.warn('Audio play failed:', err));
        } catch (e) {}
    };

    useEffect(() => {
        if (!userReady) return;

        // Poll for loading status from the engine bridge
        const pollInterval = setInterval(() => {
            const loading = (window as any).VibeLoading;
            if (loading) {
                setProgress(loading.progress);
                setStatus(loading.details || 'Loading Modules...');

                if (loading.status === 'ready' && loading.progress >= 100) {
                    clearInterval(pollInterval);
                    // Add a small delay for the 100% visual to be seen
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
        <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
            <div className="splash-logo">
                <img src="./assets/icon1.png" alt="VibeEngine" />
            </div>

            {!userReady ? (
                <div className="start-overlay">
                    <button className="start-btn" onClick={handleStart}>
                        <div className="start-btn-shadow" />
                        <span className="start-btn-text">START ENGINE</span>
                    </button>
                    <p className="start-hint">EXPERIENCE THE SOVEREIGN STUDIO</p>
                </div>
            ) : (
                <div className="loading-container">
                    <div className="loading-bar-bg">
                        <div 
                            className="loading-bar-fill" 
                            style={{ width: `${progress}%` }} 
                        />
                    </div>
                    <div className="loading-percentage">{progress}%</div>
                    <div className="loading-status">{status}</div>
                </div>
            )}
        </div>
    );
};
