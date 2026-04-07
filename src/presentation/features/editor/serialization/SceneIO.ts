import { useSceneStore, useProjectStore } from "@infrastructure/store";
import { ProjectScanner } from "@infrastructure/services/ProjectScanner";
import { serializeScene, deserializeScene } from "./SceneSerializer";
import { normalizeGLTF } from "./GLTFNormalizer";

export async function downloadScene(filename = "scene.json"): Promise<void> {
  const json = serializeScene();
  const launchedProject = useProjectStore.getState().launchedProject;

  if (launchedProject?.path) {
    try {
      const sceneName = useSceneStore.getState().sceneName || "main";
      const absolutePath = `${launchedProject.path}/src/levels/${sceneName}.json`;
      console.log(`💎 VIBEENGINE: Direct saving to workspace... ${absolutePath}`);
      const result = await ProjectScanner.saveFile(absolutePath, json);
      if (result.success) {
        console.log("✅ Scene saved directly to project workspace!");
        return;
      } else {
        console.warn("⚠️ Direct save failed, falling back to download:", result.error);
      }
    } catch (e) {
      console.error("❌ Error during direct save:", e);
    }
  }

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function loadSceneFromFile(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        deserializeScene(reader.result as string);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function importRuntimeScene(json: string): void {
  deserializeScene(json);
}

export function importUniversalScene(json: string): { format: string; entityCount: number } {
  const raw = JSON.parse(json);
  const hasMetadata = raw._metadata?.source;
  const hasSceneName = typeof raw.sceneName === "string";
  const hasNextEntityId = typeof raw.nextEntityId === "number";
  const hasEntities = Array.isArray(raw.entities);

  let format = "unknown";
  if (hasMetadata && raw._metadata.source.includes("Universal")) format = "universal-three";
  else if (hasSceneName && hasNextEntityId && hasEntities) format = "runtime-exporter";
  else if (raw.version && raw.name && hasEntities) format = "vibe-engine";
  else if (raw.scenes || raw.nodes || raw.asset) format = "gltf";

  if (format === "gltf") {
    const normalized = normalizeGLTF(raw);
    deserializeScene(JSON.stringify(normalized));
    return { format, entityCount: normalized.entities.length };
  }

  deserializeScene(json);
  return { format, entityCount: raw.entities?.length || 0 };
}