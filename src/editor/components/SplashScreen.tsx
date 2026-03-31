/**
 * SplashScreen - Logo animation with sound (10 seconds)
 */

import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Play startup sound
        try {
            const audio = new Audio('./assets/start.mp3');
            audio.volume = 0.6;
            audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (e) {
            console.log('Audio error:', e);
        }

        // Show logo for 10 seconds, then fade out
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(onComplete, 800);
        }, 10000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
            <div className="splash-logo">
                <img src="./assets/icon1.png" alt="VibeEngine" />
            </div>
        </div>
    );
};
