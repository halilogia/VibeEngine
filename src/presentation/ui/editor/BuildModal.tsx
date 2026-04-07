import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VibeIcons, VibeIconName } from '@ui/common/VibeIcons';
import { BuildManager, BuildTarget } from '@infrastructure/bridge/BuildManager';

export const BuildModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const startBuild = async (target: BuildTarget) => {
        onClose();
        await BuildManager.startBuild(target);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(5, 5, 10, 0.9)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    style={{ width: '500px', background: '#0a0a1a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em' }}>Sovereign Build Core <span style={{ color: '#6366f1' }}>v1.0</span></h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                            <VibeIcons name="X" />
                        </button>
                    </div>

                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', fontSize: '14px' }}>Select target platform to package your engine and current scene context.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {[
                            { id: 'web' as BuildTarget, name: 'Web Player', icon: 'Globe' as VibeIconName, desc: 'Package as Static HTML5' },
                            { id: 'mobile' as BuildTarget, name: 'Android / iOS', icon: 'Smartphone' as VibeIconName, desc: 'Capacitor Native Build' },
                            { id: 'desktop' as BuildTarget, name: 'PC / Mac', icon: 'Monitor' as VibeIconName, desc: 'Windows / Linux EXE' }
                        ].map((item) => (
                            <motion.button
                                key={item.id}
                                whileHover={{ y: -5, background: 'rgba(99, 102, 241, 0.1)', borderColor: '#6366f1' }}
                                onClick={() => startBuild(item.id)}
                                style={{ 
                                    background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px 16px', cursor: 'pointer', color: '#fff',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <div style={{ background: 'rgba(99, 102, 241, 0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#6366f1' }}>
                                    <VibeIcons name={item.icon} size={24} />
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{item.name}</span>
                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{item.desc}</span>
                            </motion.button>
                        ))}
                    </div>

                    <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px dashed rgba(255, 255, 255, 0.1)', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        ℹ️ Note: Mobile and Desktop builds require local SDKs (Android Studio, Xcode, Node.js) to be installed on your system.
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
