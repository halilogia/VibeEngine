import React from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useLauncherViewModel } from './LauncherViewModel';
import { VibeTheme } from '@themes/VibeStyles';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ProjectCard } from './ProjectCard';
import { CreateProjectModal } from './CreateProjectModal';
import { SelectedProjectBar } from './SelectedProjectBar';

export const ProjectLauncher: React.FC = () => {
  const { t } = useTranslation();
  const { 
    projects, selectedProject, isLoading, error, pickProjectFolder,
    handleProjectSelect, handleProjectRemove, launchActiveProject, createNewProject
  } = useLauncherViewModel();

  const [isCreating, setIsCreating] = React.useState(false);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      backgroundColor: 'var(--vibe-bg-primary)', color: 'var(--vibe-text-main)',
      padding: '4rem', fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      overflow: 'hidden', position: 'relative'
    }}>
      <div style={{
        position: 'absolute', top: '-10%', right: '-10%', width: '600px', height: '600px',
        background: `radial-gradient(circle, ${VibeTheme.colors.accent}22 0%, transparent 70%)`,
        filter: 'blur(80px)', pointerEvents: 'none'
      }} />

      <header style={{ marginBottom: '4rem', zIndex: 1, position: 'relative' }}>
        <motion.div animate={{ x: 0, opacity: 1 }} initial={{ x: -20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.05em',
            color: 'var(--vibe-text-main)', marginBottom: '0.5rem' }}>{t('launcher.title')}</h1>
          <p style={{ color: 'var(--vibe-text-secondary)', fontSize: '1.25rem', fontWeight: 400,
            display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <VibeIcons name="Sparkles" size={20} color="var(--vibe-accent)" />
            {t('launcher.subtitle')}
          </p>
        </motion.div>
      </header>

      <section style={{ flex: 1, overflowY: 'auto', zIndex: 1, position: 'relative', paddingBottom: '180px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <VibeIcons name="Search" size={24} color="var(--vibe-text-secondary)" />
            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{t('launcher.library')} ({projects.length})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button onClick={pickProjectFolder} style={{
              padding: '0.75rem 1.5rem', backgroundColor: 'var(--vibe-bg-secondary)',
              border: '1px solid var(--vibe-border)', color: 'var(--vibe-text-main)',
              borderRadius: 'var(--vibe-radius-panel)', display: 'flex', alignItems: 'center',
              gap: '0.75rem', cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: 600
            }} disabled={isLoading}>
              {isLoading ? <VibeIcons name="Loader" size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <VibeIcons name="FolderPlus" size={18} />}
              {t('launcher.import')}
            </button>
            <button onClick={() => setIsCreating(true)} style={{
              padding: '0.75rem 2.5rem', backgroundColor: 'var(--vibe-accent)', border: 'none',
              color: '#fff', borderRadius: 'var(--vibe-radius-panel)', display: 'flex',
              alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.2s ease',
              fontWeight: 800, boxShadow: `0 4px 15px ${VibeTheme.colors.accent}44`
            }} disabled={isLoading}>
              <VibeIcons name="Plus" size={20} />
              {t('launcher.new_project')}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isCreating && (
            <CreateProjectModal isOpen={isCreating} onClose={() => setIsCreating(false)} onCreate={createNewProject} />
          )}
        </AnimatePresence>

        {error && (
          <div style={{ padding: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--vibe-radius-panel)',
            color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <VibeIcons name="AlertCircle" size={20} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {projects.map((project) => (
            <ProjectCard key={project.path} project={project}
              isSelected={selectedProject?.path === project.path}
              onSelect={handleProjectSelect} onRemove={handleProjectRemove} />
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedProject && (
          <SelectedProjectBar selectedProject={selectedProject} onLaunch={launchActiveProject} />
        )}
      </AnimatePresence>
    </div>
  );
};