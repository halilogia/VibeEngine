export interface LoadingStatus {
  progress: number;
  status: "initializing" | "ready" | "stopped" | "error";
  modules: Record<string, "loading" | "success" | "error">;
  details: string;
}

type WindowWithLoading = Window & { VibeLoading?: LoadingStatus };

export function initLoadingBridge(): void {
  (window as WindowWithLoading).VibeLoading = {
    progress: 0,
    status: "initializing",
    modules: {},
    details: "Starting Engine Modules...",
  };
}

export function updateLoadingStatus(
  module: string,
  status: "success" | "error",
  details: string,
  totalModules: number,
): void {
  const bridge = (window as WindowWithLoading).VibeLoading;
  if (!bridge) return;

  bridge.modules[module] = status;
  bridge.details = details;

  const completedModules = Object.values(bridge.modules).filter(
    (s) => s === "success" || s === "error",
  ).length;
  bridge.progress = Math.round((completedModules / totalModules) * 100);

  if (status === "success") {
    console.log(`✅ [Module] ${module}: Ready`);
  } else {
    console.error(`❌ [Module] ${module}: Failed - ${details}`);
  }

  if (bridge.progress >= 100) {
    bridge.status = "ready";
    console.log("🚀 Application: All systems go!");
  }
}
