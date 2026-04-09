import {
  useProjectStore,
  ProjectInfo,
} from "@infrastructure/store/useProjectStore";
import { ProjectScanner } from "@infrastructure/services/ProjectScanner";
import {
  useSceneStore,
  type AssetData,
} from "@infrastructure/store/sceneStore";
import { deserializeScene } from "@editor/serialization/SceneSerializer";
import { useEffect } from "react";

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
    setProjects,
  } = useProjectStore();

  useEffect(() => {
    const refreshProjects = async () => {
      setLoading(true);
      try {
        const diskProjects = await ProjectScanner.listProjects();
        if (diskProjects && diskProjects.length > 0) {
            setProjects(diskProjects);
            
            // Validate selected project
            if (selectedProject) {
              const exists = diskProjects.some(p => p.path === selectedProject.path);
              if (!exists) {
                selectProject(null);
              }
            }
        }
      } catch (e) {
        console.error("Failed to refresh projects:", e);
      } finally {
        setLoading(false);
      }
    };

    refreshProjects();
  }, []);

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
        const assets = (await ProjectScanner.scanProjectAssets(
          selectedProject.path,
        )) as AssetData[];
        setAssets(assets);

        await ProjectScanner.setActiveProject(selectedProject.path);

        const sceneName = selectedProject.mainScene || 'main';
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

  const createNewProject = async (name: string, pickCustomPath: boolean = false) => {
    if (!name) return;
    setLoading(true);
    setError(null);
    try {
      let projectPath = "";
      
      if (pickCustomPath) {
        const result = await ProjectScanner.pickProjectFolder({
          title: "Proje Lokasyonu Seç"
        });
        if (!result) {
          setLoading(false);
          return;
        }
        projectPath = result.path;
      } else {
        // Create in default projects folder
        const appPath = await ProjectScanner.getAppPath();
        const defaultProjectsDir = `${appPath}/projects`;
        projectPath = `${defaultProjectsDir}/${name}`;
        
        // Ensure projects dir exists
        await ProjectScanner.createFolder(defaultProjectsDir);
        // Create the specific project folder
        const folderRes = await ProjectScanner.createFolder(projectPath);
        if (!folderRes.success && folderRes.error !== "Folder already exists") {
          throw new Error(folderRes.error);
        }
      }

      if (projectPath) {
        // Construct basic project structure
        await ProjectScanner.createFolder(`${projectPath}/src/levels`);
        await ProjectScanner.createFolder(`${projectPath}/src/domain`);
        await ProjectScanner.createFolder(`${projectPath}/assets/models`);
        await ProjectScanner.createFolder(`${projectPath}/assets/textures`);

        // Create initial scene (Unity-style main.json)
        const defaultScene = {
          entities: [],
          rootEntityIds: [],
          metadata: {
            name: "Main Scene",
            version: "1.0.0",
            engine: "vibe-engine",
          },
        };

        await ProjectScanner.createFile(
          `${projectPath}/src/levels/main.json`,
          JSON.stringify(defaultScene, null, 2),
        );

        // Create project.vibe — the VibeEngine native project manifest
        const vibeManifest = {
          vibeEngineVersion: '1.1.0',
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          version: '0.1.0',
          engine: 'vibe-engine',
          mainScene: 'main',
          author: 'Developer',
          description: 'A new VibeEngine project',
          createdAt: new Date().toISOString(),
          scenes: [
            { id: 'main', name: 'Main Scene', path: 'src/levels/main.json' }
          ],
          assetsDir: 'assets'
        };

        await ProjectScanner.createFile(
          `${projectPath}/project.vibe`,
          JSON.stringify(vibeManifest, null, 2),
        );

        const newProject: ProjectInfo = {
          path: projectPath,
          name,
          version: "0.1.0",
          engine: "vibe-engine",
          description: "A new VibeEngine project",
          author: "Developer",
          mainScene: "main",
          hasPackageJson: false,
          hasDomain: true,
        };

        addProject(newProject);
        selectProject(newProject);
        console.log(`🚀 New project created: ${name} at ${projectPath}`);
      }
    } catch (e) {
      console.error("Project creation error:", e);
      setError("Proje oluşturulamadı. Lütfen klasör izinlerini kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    selectedProject,
    isLoading,
    error,
    pickProjectFolder,
    createNewProject,
    handleProjectSelect,
    handleProjectRemove,
    launchActiveProject,
  };
};
