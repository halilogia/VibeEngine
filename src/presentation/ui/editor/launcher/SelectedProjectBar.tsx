import React from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface SelectedProject {
  name: string;
}

interface SelectedProjectBarProps {
  selectedProject: SelectedProject;
  onLaunch: () => void;
}

export const SelectedProjectBar: React.FC<SelectedProjectBarProps> = ({ selectedProject, onLaunch }) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ y: 200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 200, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{
        position: 'absolute', bottom: '2rem', left: '4rem', right: '4rem',
        padding: '2rem 3rem', backgroundColor: 'var(--vibe-bg-secondary)',
        borderRadius: '24px', border: '1px solid var(--vibe-border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        zIndex: 10, backdropFilter: 'blur(20px)'
      }}
    >
      <div>
        <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          <span style={{ color: 'var(--vibe-accent)' }}>{selectedProject.name}</span> {t('launcher.status_active')}
        </h4>
        <p style={{ color: 'var(--vibe-text-secondary)', fontSize: '0.95rem' }}>{t('launcher.status_description')}</p>
      </div>
      
      <motion.button 
        whileHover={{ scale: 1.02, backgroundColor: 'var(--vibe-accent-hover)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onLaunch}
        style={{
          padding: '1.25rem 3rem', backgroundColor: 'var(--vibe-accent)',
          color: '#fff', borderRadius: '16px', fontSize: '1.125rem',
          fontWeight: 900, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '1rem',
          boxShadow: `0 10px 30px -10px var(--vibe-accent)`, letterSpacing: '1px'
        }}
      >
        <VibeIcons name="Play" size={20} style={{ fill: '#fff' }} />
        <span style={{ position: 'relative', zIndex: 1 }}>{t('launcher.start_engine')}</span>
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '16px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            pointerEvents: 'none'
          }} 
        />
      </motion.button>
    </motion.div>
  );
};