import { useSceneStore } from "@infrastructure/store";

export function createDefaultScene(): void {
  const store = useSceneStore.getState();
  store.clear();
  useSceneStore.setState({ sceneName: "New Scene" });

  const cameraId = store.addEntity("Main Camera", null);
  store.addComponent(cameraId, {
    type: "Camera",
    data: { fov: 75, near: 0.1, far: 1000, isActive: true },
    enabled: true,
  });
  store.updateComponent(cameraId, "Transform", {
    position: [0, 5, 10],
    rotation: [-20, 0, 0],
  });

  const lightId = store.addEntity("Directional Light", null);
  store.addComponent(lightId, {
    type: "Light",
    data: { lightType: "directional", color: "#ffffff", intensity: 1, castShadow: true },
    enabled: true,
  });
  store.updateComponent(lightId, "Transform", {
    position: [5, 10, 5],
    rotation: [-45, 30, 0],
  });

  const groundId = store.addEntity("Ground", null);
  store.addComponent(groundId, {
    type: "Render",
    data: { meshType: "plane", color: "#374151", castShadow: false, receiveShadow: true },
    enabled: true,
  });
  store.updateComponent(groundId, "Transform", {
    scale: [20, 1, 20],
    rotation: [-90, 0, 0],
  });

  const cubeId = store.addEntity("Cube", null);
  store.addComponent(cubeId, {
    type: "Render",
    data: { meshType: "cube", color: "#6366f1", castShadow: true, receiveShadow: true },
    enabled: true,
  });
  store.updateComponent(cubeId, "Transform", { position: [0, 0.5, 0] });

  useSceneStore.setState({ isDirty: false });
}