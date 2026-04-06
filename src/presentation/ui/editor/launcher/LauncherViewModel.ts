import {
  useProjectStore,
  ProjectInfo,
} from "@infrastructure/store/useProjectStore";
import { ProjectScanner } from "@infrastructure/services/ProjectScanner";
import { useSceneStore, type AssetData } from "@infrastructure/store/sceneStore";
import { deserializeScene } from "@editor/serialization/SceneSerializer";

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
    removeProject,
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
    } catch (e) {
      const msg = (e as Error)?.message || "";
      if (msg.includes("bridge not available")) {
        setError(
          'Keşif sistemi sadece Electron üzerinde aktiftir. Lütfen "npm run electron:dev" komutunu kullanın.',
        );
      } else {
        setError(
          "Proje klasörü okunamadı. Lütfen geçerli bir dizin seçin veya izinleri kontrol edin.",
        );
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
        
        const assets = await ProjectScanner.scanProjectAssets(
          selectedProject.path,
        ) as AssetData[];
        setAssets(assets);

        await ProjectScanner.setActiveProject(selectedProject.path);

        const sceneName = selectedProject.mainScene || "main"; 
        const baseFolder = selectedProject.path;
        const sceneFile = `${baseFolder}/src/levels/${sceneName}.json`;

        try {
          const result = await ProjectScanner.readFile(sceneFile);
          if (result.success && result.content) {
            
            deserializeScene(result.content);
            console.log(`✅ Scene auto-loaded from: ${sceneFile}`);
          } else {
            
            const rootScene = `${baseFolder}/scene.json`;
            const rootRes = await ProjectScanner.readFile(rootScene);
            if (rootRes.success && rootRes.content) {
              deserializeScene(rootRes.content);
              console.log(`✅ Scene auto-loaded from: ${rootScene}`);
            } else {
              
              console.log(
                '🔍 No scene found. Attempting automatic "Ultimate Snapshot" from local dev server...',
              );

              const backupUrls = [
                "http://localhost:5174",
                "http://localhost:5173",
                "http://localhost:5175",
              ];

              for (const url of backupUrls) {
                try {
                  const result = await ProjectScanner.captureScene(url);
                  if (result.success && result.data) {
                    deserializeScene(JSON.stringify(result.data));
                    console.log(
                      `✅ Ultimate Snapshot SUCCESS from ${url}! Scene loaded automatically.`,
                    );

                    break;
                  }
                } catch {
                  void 0;
                }
              }

              if (useSceneStore.getState().entities.size === 0) {
                console.warn(
                  "⚠️ No VibeEngine scene found and automatic hijack failed. Please save a scene manually.",
                );
              }
            }
          }
        } catch {
          console.warn("⚠️ No scene loaded. Skipping auto-load.");
        }

        launchProject(selectedProject);
        console.log(
          `Motor ve Assets senkronize edildi: ${selectedProject.name} (${assets.length} varlık)`,
        );
      } catch (e) {
        console.error("Asset tarama hatası:", e);
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
    launchActiveProject,
  };
};
