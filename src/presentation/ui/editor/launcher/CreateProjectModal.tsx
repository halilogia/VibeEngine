import React from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const { t } = useTranslation();
  const [newProjectName, setNewProjectName] = React.useState('');

  const handleCreate = () => {
    if (newProjectName) {
      onCreate(newProjectName);
      setNewProjectName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000, padding: '2rem'
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{
          width: '100%', maxHeight: '400px', maxWidth: '500px',
          backgroundColor: 'var(--vibe-bg-secondary)', borderRadius: '32px',
          border: '1px solid var(--vibe-border)', padding: '3rem',
          boxShadow: '0 30px 100px rgba(0,0,0,0.8)', position: 'relative'
        }}
      >
        <button onClick={onClose} style={{ 
          position: 'absolute', top: '1.5rem', right: '1.5rem', 
          background: 'transparent', border: 'none', color: 'var(--vibe-text-secondary)', cursor: 'pointer' 
        }}>
          <VibeIcons name="X" size={24} />
        </button>

        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem' }}>{t('launcher.new_project')}</h2>
        
        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ display: 'block', color: 'var(--vibe-text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: 600 }}>
            {t('launcher.project_name')}
          </label>
          <input 
            type="text" autoFocus value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            placeholder="New Car Game..."
            style={{
              width: '100%', padding: '1.25rem', backgroundColor: 'var(--vibe-bg-primary)',
              border: '1px solid var(--vibe-border)', borderRadius: '16px',
              color: 'var(--vibe-text-main)', fontSize: '1.125rem',
              outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onClose} style={{ 
            flex: 1, padding: '1.25rem', background: 'transparent', 
            border: '1px solid var(--vibe-border)', color: 'var(--vibe-text-secondary)',
            borderRadius: '16px', cursor: 'pointer', fontWeight: 600 
          }}>
            {t('settings.cancel')}
          </button>
          <button onClick={handleCreate} disabled={!newProjectName} style={{ 
            flex: 2, padding: '1.25rem', backgroundColor: 'var(--vibe-accent)', 
            color: '#fff', border: 'none', borderRadius: '16px', 
            cursor: 'pointer', fontWeight: 900, opacity: newProjectName ? 1 : 0.5
          }}>
            {t('launcher.create')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};