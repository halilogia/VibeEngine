import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { viewportStyles as styles } from './ViewportPanel.styles';

export const RaceHUD: React.FC = () => {
    const [raceData, setRaceData] = useState({
        speed: 0,
        lap: 1,
        totalLaps: 3,
        time: 0,
        isFinished: false
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const data = (window as unknown as { VibeRaceState?: typeof raceData }).VibeRaceState;
            if (data) {
                setRaceData({ ...data });
            }
        }, 33); // ~30fps UI update
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            style={styles.raceHUD}
        >
            {}
            <div style={styles.raceHUDItem}>
                <div style={styles.raceHUDValue}>
                    {raceData.speed}
                    <span style={styles.speedometerUnit}>KM/H</span>
                </div>
                <div style={styles.raceHUDLabel}>Speed</div>
            </div>

            {}
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />

            {}
            <div style={styles.raceHUDItem}>
                <div style={styles.raceHUDValue}>
                    {raceData.lap}<span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '18px' }}>/{raceData.totalLaps}</span>
                </div>
                <div style={styles.raceHUDLabel}>Lap</div>
            </div>

            {}
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />

            {}
            <div style={styles.raceHUDItem}>
                <div style={{ ...styles.raceHUDValue, minWidth: '140px', textAlign: 'center' }}>
                    {formatTime(raceData.time)}
                </div>
                <div style={styles.raceHUDLabel}>Round Time</div>
            </div>

            <AnimatePresence>
                {raceData.isFinished && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            position: 'absolute',
                            top: '-100px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#10b981',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            letterSpacing: '2px',
                            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)'
                        }}
                    >
                        RACE FINISHED
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
