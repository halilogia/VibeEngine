import { useProjectStore, ProjectInfo } from '@infrastructure/store/useProjectStore';
import { ProjectScanner } from '@infrastructure/services/ProjectScanner';
import { useSceneStore } from '@infrastructure/store/sceneStore';
import { deserializeScene, createDefaultScene } from '@editor/serialization/SceneSerializer';

export const useLauncherViewModel = () => {
  const { setAssets } = useSceneStore();
  const { 
    projects, 
    selectedProject, 
    isLoading, 
    error,
    selectProject,
    launchProject,
    setLoading,
    setError,
    addProject,
    removeProject
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

  const handleProjectRemove = (path: string) => {
    removeProject(path);
    console.log(`Proje kütüphaneden kaldırıldı: ${path}`);
  };

  const launchActiveProject = async () => {
    if (selectedProject) {
      setLoading(true);
      try {
        // 🟢 Elite Asset Sync: Scan project src folder
        const assets = await ProjectScanner.scanProjectAssets(selectedProject.path);
        setAssets(assets);
        
        // 🚀 Ultimate Studio Sync: Tell Electron which project is active
        await ProjectScanner.setActiveProject(selectedProject.path);
        
        // 🟢 Elite Scene Loading: Try to auto-load the project's main scene
        const sceneName = selectedProject.mainScene || 'main'; // Should fallback to 'main'
        const baseFolder = selectedProject.path;
        const sceneFile = `${baseFolder}/src/levels/${sceneName}.json`;
        
        try {
          const result = await ProjectScanner.readFile(sceneFile);
          if (result.success && result.content) {
            // Found a level file! Load it immediately.
            deserializeScene(result.content);
            console.log(`✅ Scene auto-loaded from: ${sceneFile}`);
          } else {
            // Fallback: Check if there's a 'scene.json' in the root or /src/
            const rootScene = `${baseFolder}/scene.json`;
            const rootRes = await ProjectScanner.readFile(rootScene);
            if (rootRes.success && rootRes.content) {
              deserializeScene(rootRes.content);
              console.log(`✅ Scene auto-loaded from: ${rootScene}`);
            } else {
              // 🏛️ Workspace is ready but no engine scene found yet.
              console.warn('⚠️ No VibeEngine scene found in project. Please save a scene to create the workspace data.');
            }
          }
        } catch (e) {
          console.warn('⚠️ No scene loaded. Skipping auto-load.');
        }

        launchProject(selectedProject);
        console.log(`Motor ve Assets senkronize edildi: ${selectedProject.name} (${assets.length} varlık)`);
      } catch (e) {
        console.error('Asset tarama hatası:', e);
        launchProject(selectedProject);
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    projects,
    selectedProject,
    isLoading,
    error,
    pickProjectFolder,
    handleProjectSelect,
    handleProjectRemove,
    launchActiveProject
  };
};
