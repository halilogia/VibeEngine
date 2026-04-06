import React from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useLauncherViewModel } from './LauncherViewModel';
import { VibeTheme } from '@themes/VibeStyles';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const ProjectLauncher: React.FC = () => {
  const { t } = useTranslation();
  const { 
    projects, 
    selectedProject, 
    isLoading, 
    error, 
    pickProjectFolder, 
    handleProjectSelect,
    handleProjectRemove,
    launchActiveProject
  } = useLauncherViewModel();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--vibe-bg-primary)',
      color: 'var(--vibe-text-main)',
      padding: '4rem',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {}
      <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: `radial-gradient(circle, ${VibeTheme.colors.accent}22 0%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none'
      }} />

      <header style={{ marginBottom: '4rem', zIndex: 1, position: 'relative' }}>
          <motion.div 
            animate={{ x: 0, opacity: 1 }} 
            initial={{ x: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            <h1 style={{
                fontSize: '3.5rem',
                fontWeight: 900,
                letterSpacing: '-0.05em',
                color: 'var(--vibe-text-main)',
                marginBottom: '0.5rem'
            }}>
                {t('launcher.title')}
            </h1>
            <p style={{
                color: 'var(--vibe-text-secondary)',
                fontSize: '1.25rem',
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <VibeIcons name="Sparkles" size={20} color="var(--vibe-accent)" />
                {t('launcher.subtitle')}
            </p>
          </motion.div>
      </header>

      <section style={{ flex: 1, overflowY: 'auto', zIndex: 1, position: 'relative', paddingBottom: '180px' }}>
          <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem'
          }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <VibeIcons name="Search" size={24} color="var(--vibe-text-secondary)" />
                  <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{t('launcher.library')} ({projects.length})</span>
              </div>
              <button 
                  onClick={pickProjectFolder}
                  style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'var(--vibe-bg-secondary)',
                      border: '1px solid var(--vibe-border)',
                      color: 'var(--vibe-text-main)',
                      borderRadius: 'var(--vibe-radius-panel)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontWeight: 600
                  }}
                  disabled={isLoading}
              >
                  {isLoading ? <VibeIcons name="Loader" size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <VibeIcons name="FolderPlus" size={18} />}
                  {t('launcher.import')}
              </button>
          </div>

          {error && (
              <div style={{
                  padding: '1.5rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--vibe-radius-panel)',
                  color: '#fca5a5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '2rem'
              }}>
                  <VibeIcons name="AlertCircle" size={20} />
                  <span>{error}</span>
              </div>
          )}

          <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem'
          }}>
              {projects.map((project) => {
                  const isSelected = selectedProject?.path === project.path;
                  return (
                    <div
                        key={project.path}
                        onClick={() => handleProjectSelect(project)}
                        style={{
                            padding: '2rem',
                            borderRadius: '20px',
                            border: `2px solid ${isSelected ? 'var(--vibe-accent)' : 'transparent'}`,
                            backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--vibe-bg-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: isSelected ? `0 0 40px rgba(99, 102, 241, 0.15)` : 'none'
                        }}
                    >
                        {}
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                            whileTap={{ scale: 0.9 }}
                            title="Remove from library"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleProjectRemove(project.path);
                            }}
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                color: 'rgba(255,255,255,0.8)',
                                cursor: 'pointer',
                                zIndex: 5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <VibeIcons name="X" size={14} />
                        </motion.button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                            <div style={{
                                padding: '1rem',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
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
                                        fontSize: '0.65rem',
                                        textTransform: 'uppercase',
                                        fontWeight: 800,
                                        letterSpacing: '0.05em',
                                        backgroundColor: 'rgba(74, 222, 128, 0.1)',
                                        color: 'var(--vibe-success)',
                                        padding: '0.25rem 0.6rem',
                                        borderRadius: '6px'
                                    }}>{t('launcher.status_ready')}</span>
                                )}
                            </div>
                            <VibeIcons 
                                name="Play" 
                                size={20} 
                                style={{ 
                                    fill: isSelected ? 'var(--vibe-accent)' : 'transparent',
                                    color: isSelected ? 'var(--vibe-accent)' : 'var(--vibe-text-secondary)'
                                }} 
                            />
                        </div>
                    </div>
                  );
              })}
          </div>
      </section>

      <AnimatePresence>
        {selectedProject && (
            <motion.div 
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 200, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '4rem',
                    right: '4rem',
                    padding: '2rem 3rem',
                    backgroundColor: 'var(--vibe-bg-secondary)',
                    borderRadius: '24px',
                    border: '1px solid var(--vibe-border)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 10,
                    backdropFilter: 'blur(20px)'
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
                    onClick={launchActiveProject}
                    style={{
                        padding: '1.25rem 3rem',
                        backgroundColor: 'var(--vibe-accent)',
                        color: '#fff',
                        borderRadius: '16px',
                        fontSize: '1.125rem',
                        fontWeight: 900,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        boxShadow: `0 10px 30px -10px var(--vibe-accent)`,
                        letterSpacing: '1px'
                    }}
                >
                    <VibeIcons name="Play" size={20} style={{ fill: '#fff' }} />
                    <span style={{ position: 'relative', zIndex: 1 }}>{t('launcher.start_engine')}</span>
                    
                    {}
                    <motion.div 
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '16px',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                            pointerEvents: 'none'
                        }} 
                    />
                </motion.button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
