import React from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ProjectInfo } from '@infrastructure/store/useProjectStore';

interface ProjectCardProps {
  project: ProjectInfo;
  isSelected: boolean;
  onSelect: (project: ProjectInfo) => void;
  onRemove: (path: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, isSelected, onSelect, onRemove }) => {
  const { t } = useTranslation();
  
  return (
    <div
      onClick={() => onSelect(project)}
      style={{
        padding: '2rem',
        borderRadius: '20px',
        border: `2px solid ${isSelected ? 'var(--vibe-accent)' : 'transparent'}`,
        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--vibe-bg-secondary)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isSelected ? '0 0 40px rgba(99, 102, 241, 0.15)' : 'none'
      }}
    >
      <motion.button
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
        whileTap={{ scale: 0.9 }}
        title="Remove from library"
        onClick={(e) => { e.stopPropagation(); onRemove(project.path); }}
        style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '50%', width: '28px', height: '28px',
          color: 'rgba(255,255,255,0.8)', cursor: 'pointer', zIndex: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <VibeIcons name="X" size={14} />
      </motion.button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
        <div style={{
          padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px',
          color: project.hasDomain ? 'var(--vibe-success)' : 'var(--vibe-text-secondary)'
        }}>
          <VibeIcons name="Folder" size={28} />
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--vibe-text-main)' }}>{project.name}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--vibe-text-secondary)', marginBottom: '2rem', opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.path}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {project.hasDomain && (
            <span style={{
              fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em',
              backgroundColor: 'rgba(74, 222, 128, 0.1)', color: 'var(--vibe-success)', padding: '0.25rem 0.6rem', borderRadius: '6px'
            }}>{t('launcher.status_ready')}</span>
          )}
        </div>
        <VibeIcons name="Play" size={20} style={{ fill: isSelected ? 'var(--vibe-accent)' : 'transparent', color: isSelected ? 'var(--vibe-accent)' : 'var(--vibe-text-secondary)' }} />
      </div>
    </div>
  );
};