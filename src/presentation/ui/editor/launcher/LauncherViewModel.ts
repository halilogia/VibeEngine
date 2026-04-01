import { useProjectStore, ProjectInfo } from '@infrastructure/store/useProjectStore';
import { ProjectScanner } from '@infrastructure/services/ProjectScanner';

export const useLauncherViewModel = () => {
  const { 
    projects, 
    selectedProject, 
    isLoading, 
    error,
    selectProject,
    launchProject,
    setLoading,
    setError,
    addProject
  } = useProjectStore();

  const pickProjectFolder = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ProjectScanner.pickProjectFolder();
      if (result) {
        addProject(result);
        selectProject(result);
      }
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('bridge not available')) {
        setError('Keşif sistemi sadece Electron üzerinde aktiftir. Lütfen "npm run electron:dev" komutunu kullanın.');
      } else {
        setError('Proje klasörü okunamadı. Lütfen geçerli bir dizin seçin veya izinleri kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: ProjectInfo) => {
    selectProject(project);
    console.log(`Proje seçildi: ${project.name}`);
  };

  const launchActiveProject = () => {
    if (selectedProject) {
      launchProject(selectedProject);
      console.log(`Motor başlatılıyor: ${selectedProject.name}`);
    }
  };

  return {
    projects,
    selectedProject,
    isLoading,
    error,
    pickProjectFolder,
    handleProjectSelect,
    launchActiveProject
  };
};
