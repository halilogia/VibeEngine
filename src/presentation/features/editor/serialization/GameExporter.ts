import { serializeScene } from "./SceneSerializer";
import { useProjectStore } from "@infrastructure/store/useProjectStore";
import { useToastStore } from "@infrastructure/store/toastStore";
import { generateHTMLTemplate, generateMobileRuntime } from "./GameTemplates";

interface ProjectScannerCommandResult {
  success: boolean;
}

interface ProjectScanner {
  createFolder(path: string): Promise<void>;
  saveFile(path: string, content: string): Promise<void>;
  copyFolder(src: string, dest: string): Promise<void>;
  runCommand(command: string, workingDir: string): Promise<ProjectScannerCommandResult>;
}

interface WindowWithProjectScanner {
  ProjectScanner?: ProjectScanner;
}

export function exportToHTML(gameName = "MyGame"): void {
  const sceneData = serializeScene();
  const html = generateHTMLTemplate(gameName, sceneData);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${gameName.replace(/\s+/g, "_")}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log("📦 Game exported as HTML!");
}

export async function exportToCapacitor(gameName = "MyGame"): Promise<void> {
  const sceneData = serializeScene();
  const scanner = (window as unknown as WindowWithProjectScanner).ProjectScanner;
  const addToast = useToastStore.getState().addToast;
  const launchedProject = useProjectStore.getState().launchedProject;

  if (scanner && launchedProject) {
    try {
      const projectPath = launchedProject.path.replace(/\\/g, "/");
      const buildPath = `${projectPath}/capacitor_build`;
      const assetSrc = `${projectPath}/public/assets`;

      addToast("🌊 VibeMobile: Starting build process...", "info");
      await scanner.createFolder(buildPath);
      await scanner.createFolder(`${buildPath}/www`);

      const config = {
        appId: `com.vibeengine.${gameName.toLowerCase().replace(/\s+/g, "")}`,
        appName: gameName,
        webDir: "www",
        bundledWebRuntime: false,
      };
      await scanner.saveFile(`${buildPath}/capacitor.config.json`, JSON.stringify(config, null, 2));
      await scanner.saveFile(`${buildPath}/www/index.html`, generateMobileRuntime(gameName, sceneData));
      await scanner.saveFile(`${buildPath}/www/scene.json`, sceneData);

      addToast("📂 Mirroring assets to build folder...", "info");
      await scanner.copyFolder(assetSrc, `${buildPath}/www/assets`);

      addToast("⚡ Injecting Capacitor CLI...", "info");
      const installRes = await scanner.runCommand("npm install @capacitor/core @capacitor/cli", buildPath);

      if (installRes.success) {
        addToast("🔄 Syncing Native Bridge...", "info");
        await scanner.runCommand("npx cap sync", buildPath);
        addToast("✅ BUILD SUCCESSFUL! Capacitor project ready.", "success");
      } else {
        addToast("⚠️ Dependency injection skipped or failed, but files are ready.", "warning");
      }
      return;
    } catch (e) {
      addToast(`❌ Build failed: ${(e as Error).message}`, "error");
      return;
    }
  }

  const config = {
    appId: `com.vibeengine.${gameName.toLowerCase().replace(/\s+/g, "")}`,
    appName: gameName,
    webDir: "www",
  };
  const projectData = {
    scene: JSON.parse(sceneData),
    capacitorConfig: config,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${gameName.replace(/\s+/g, "_")}_capacitor.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function getExportFormats(): { label: string; action: () => void }[] {
  return [
    { label: "Export for Capacitor", action: () => exportToCapacitor("MyGame") },
    { label: "Mobile Build (Beta)", action: () => alert("Native mobile build is being prepared by Neural Engine...") },
  ];
}