import React from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useLauncherViewModel } from './LauncherViewModel';
import { VibeTheme } from '@themes/VibeStyles';
import { motion } from 'framer-motion';

export const ProjectLauncher: React.FC = () => {
  const { 
    projects, 
    selectedProject, 
    isLoading, 
    error, 
    pickProjectFolder, 
    handleProjectSelect,
    launchActiveProject
  } = useLauncherViewModel();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: VibeTheme.colors.bgPrimary,
      color: VibeTheme.colors.textMain,
      padding: '4rem',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Cinematic Ambient Glow */}
      <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
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
                background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.4) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
            }}>
                VibeEngine
            </h1>
            <p style={{
                color: VibeTheme.colors.textSecondary,
                fontSize: '1.25rem',
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <VibeIcons name="Sparkles" size={20} color={VibeTheme.colors.accent} />
                Projektör: Oyun Evrenini Başlatın
            </p>
          </motion.div>
      </header>

      <section style={{ flex: 1, overflowY: 'auto', zIndex: 1, position: 'relative', paddingBottom: '100px' }}>
          <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'between',
              marginBottom: '2rem'
          }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <VibeIcons name="Search" size={24} color={VibeTheme.colors.textSecondary} />
                  <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>Kitaplığınız ({projects.length})</span>
              </div>
              <button 
                  onClick={pickProjectFolder}
                  style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: VibeTheme.colors.bgSecondary,
                      border: `1px solid ${VibeTheme.colors.glassBorder}`,
                      color: VibeTheme.colors.textMain,
                      borderRadius: VibeTheme.radius.panel,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontWeight: 600
                  }}
                  disabled={isLoading}
              >
                  {isLoading ? <VibeIcons name="Loader" size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <VibeIcons name="Folder" size={18} />}
                  Proje Klasörü Aktar
              </button>
          </div>

          {error && (
              <div style={{
                  padding: '1.5rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: VibeTheme.radius.panel,
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
              {projects.map((project) => (
                  <div
                      key={project.path}
                      onClick={() => handleProjectSelect(project)}
                      style={{
                          padding: '2rem',
                          borderRadius: '20px',
                          border: `2px solid ${selectedProject?.path === project.path ? VibeTheme.colors.accent : 'transparent'}`,
                          backgroundColor: selectedProject?.path === project.path ? 'rgba(99, 102, 241, 0.08)' : VibeTheme.colors.bgSecondary,
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: selectedProject?.path === project.path ? `0 0 40px rgba(99, 102, 241, 0.15)` : 'none'
                      }}
                  >
                      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'start', marginBottom: '1.5rem' }}>
                          <div style={{
                              padding: '1rem',
                              backgroundColor: 'rgba(255,255,255,0.03)',
                              borderRadius: '12px',
                              color: project.hasDomain ? '#4ade80' : VibeTheme.colors.textSecondary
                          }}>
                              <VibeIcons name="Folder" size={28} />
                          </div>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: VibeTheme.colors.textMain }}>{project.name}</h3>
                      <p style={{ fontSize: '0.875rem', color: VibeTheme.colors.textSecondary, marginBottom: '2rem', opacity: 0.6 }}>{project.path}</p>

                      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {project.hasDomain && (
                                  <span style={{
                                      fontSize: '0.65rem',
                                      textTransform: 'uppercase',
                                      fontWeight: 800,
                                      letterSpacing: '0.05em',
                                      backgroundColor: 'rgba(74, 222, 128, 0.1)',
                                      color: '#4ade80',
                                      padding: '0.25rem 0.6rem',
                                      borderRadius: '6px'
                                  }}>GAME READY</span>
                              )}
                          </div>
                          <VibeIcons 
                              name="Play" 
                              size={20} 
                              style={{ 
                                  fill: selectedProject?.path === project.path ? VibeTheme.colors.accent : 'transparent',
                                  color: selectedProject?.path === project.path ? VibeTheme.colors.accent : VibeTheme.colors.textSecondary
                              }} 
                          />
                      </div>
                  </div>
              ))}
          </div>
      </section>

      {selectedProject && (
          <div style={{
              position: 'absolute',
              bottom: 0,
              left: 40,
              right: 40,
              padding: '2.5rem',
              backgroundColor: VibeTheme.colors.bgSecondary,
              borderRadius: '24px 24px 0 0',
              border: `1px solid ${VibeTheme.colors.glassBorder}`,
              borderBottom: 'none',
              boxShadow: '0 -20px 40px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'between',
              zIndex: 10
          }}>
              <div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                      <span style={{ color: VibeTheme.colors.accent }}>{selectedProject.name}</span> aktif.
                  </h4>
                  <p style={{ color: VibeTheme.colors.textSecondary, fontSize: '0.95rem' }}>Tüm alt sistemler ve domain logic bağlandı.</p>
              </div>
              <button 
                  onClick={launchActiveProject}
                  style={{
                      padding: '1.25rem 3rem',
                      backgroundColor: VibeTheme.colors.accent,
                      color: '#fff',
                      borderRadius: '16px',
                      fontSize: '1.125rem',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: `0 10px 25px rgba(99, 102, 241, 0.3)`
                  }}
                  onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = VibeTheme.colors.accentHover;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = VibeTheme.colors.accent;
                      e.currentTarget.style.transform = 'translateY(0)';
                  }}
              >
                  MOTORU BAŞLAT
              </button>
          </div>
      )}
    </div>
  );
};
