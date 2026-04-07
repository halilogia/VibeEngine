import { useSceneStore, type ComponentData } from "@infrastructure/store";
import { ProjectScanner } from "@infrastructure/services/ProjectScanner";

export type AICommandType =
  | "add_entity" | "remove_entity" | "rename_entity"
  | "add_component" | "update_component" | "remove_component"
  | "set_parent" | "spawn_prefab" | "set_position"
  | "set_rotation" | "set_scale" | "set_material"
  | "save_file" | "attach_script";

export interface AICommand {
  type: AICommandType;
  params: Record<string, unknown>;
}

export interface CommandResult {
  success: boolean;
  message: string;
  entityId?: number;
}

type Store = ReturnType<typeof useSceneStore.getState>;

const PREFABS: Record<string, (id: number, params: Record<string, unknown>, store: Store) => void> = {
  PirateShip: (id, params, store) => {
    store.updateComponent(id, "Transform", { scale: [1, 0.8, 2], position: (params.position as number[]) || [0, 0.5, 0] });
    store.addComponent(id, { type: "Render", data: { meshType: "cube", color: "#4a3728" }, enabled: true });
    store.addComponent(id, { type: "Collision", data: { colliderType: "box" }, enabled: true });
  },
  PlayerCharacter: (id, params, store) => {
    store.updateComponent(id, "Transform", { position: (params.position as number[]) || [0, 0.5, 0] });
    store.addComponent(id, { type: "Render", data: { meshType: "capsule", color: "#0f3460" }, enabled: true });
    store.addComponent(id, { type: "Script", data: { scriptName: "PlayerMoveScript" }, enabled: true });
    store.addComponent(id, { type: "Collision", data: { colliderType: "capsule" }, enabled: true });
  },
  OceanTile: (id, _params, store) => {
    store.updateComponent(id, "Transform", { scale: [50, 1, 50], rotation: [-90, 0, 0] });
    store.addComponent(id, { type: "Render", data: { meshType: "plane", color: "#0077be" }, enabled: true });
  },
};

const TRANSFORM_PROPS: Record<string, "position" | "rotation" | "scale"> = {
  set_position: "position",
  set_rotation: "rotation",
  set_scale: "scale",
};

export class CommandInterpreter {
  static async executeBatch(commands: AICommand[]): Promise<CommandResult[]> {
    const results: CommandResult[] = [];
    const sceneStore = useSceneStore.getState();
    console.group("🤖 AI Copilot: Executing Command Batch");
    for (const cmd of commands) {
      const result = await this.execute(cmd, sceneStore);
      results.push(result);
      console[result.success ? "log" : "error"](`${result.success ? "✅" : "❌"} [AI] ${result.success ? "success" : "failed"}: ${cmd.type}`, result.message);
    }
    console.groupEnd();
    return results;
  }

  private static async execute(cmd: AICommand, store: Store): Promise<CommandResult> {
    try {
      const { type, params } = cmd;

      if (type in TRANSFORM_PROPS) {
        const prop = TRANSFORM_PROPS[type];
        const { id, x, y, z } = params;
        store.updateComponent(id as number, "Transform", { [prop]: [x, y, z] });
        return { success: true, message: `${prop} of entity ${id} set to [${x}, ${y}, ${z}]` };
      }

      switch (type) {
        case "save_file": {
          const { filePath, content } = params;
          const res = await ProjectScanner.saveFile(filePath as string, content as string);
          return { success: res.success, message: res.success ? `File saved: ${filePath}` : `Save failed: ${res.error}` };
        }
        case "attach_script": {
          const { entityId, scriptPath } = params;
          store.addComponent(entityId as number, { type: "Script", data: { scriptPath: scriptPath as string }, enabled: true });
          return { success: true, message: `Script ${scriptPath} attached to entity ${entityId}` };
        }
        case "set_material": {
          const { id, color, opacity } = params;
          store.updateComponent(id as number, "Render", { color, opacity: opacity ?? 1.0 });
          return { success: true, message: `Material of entity ${id} updated (Color: ${color})` };
        }
        case "add_entity": {
          const id = store.addEntity(params.name as string, params.parentId as number | undefined);
          if (params.components && Array.isArray(params.components)) {
            for (const comp of params.components) store.addComponent(id, comp as ComponentData);
          }
          return { success: true, message: `Entity "${params.name}" added with ID ${id}`, entityId: id };
        }
        case "spawn_prefab": {
          const prefabName = params.prefabName as string;
          const id = store.addEntity(prefabName, params.parentId as number | undefined);
          PREFABS[prefabName]?.(id, params, store);
          return { success: true, message: `Prefab "${prefabName}" spawned with ID ${id}`, entityId: id };
        }
        case "remove_entity":
          store.removeEntity(params.id as number);
          return { success: true, message: `Entity ${params.id} removed` };
        case "rename_entity":
          store.renameEntity(params.id as number, params.name as string);
          return { success: true, message: `Entity ${params.id} renamed to "${params.name}"` };
        case "add_component": {
          const comp: ComponentData = { type: params.componentType as string, data: (params.data ?? {}) as Record<string, unknown>, enabled: params.enabled !== false };
          store.addComponent(params.entityId as number, comp);
          return { success: true, message: `Component ${params.componentType} added to entity ${params.entityId}` };
        }
        case "update_component":
          store.updateComponent(params.entityId as number, params.componentType as string, params.data as Record<string, unknown>);
          return { success: true, message: `Component ${params.componentType} updated on entity ${params.entityId}` };
        case "remove_component":
          store.removeComponent(params.entityId as number, params.componentType as string);
          return { success: true, message: `Component ${params.componentType} removed from entity ${params.entityId}` };
        case "set_parent":
          store.setParent(params.entityId as number, params.parentId as number);
          return { success: true, message: `Entity ${params.entityId} parented to ${params.parentId}` };
        default:
          return { success: false, message: `Unsupported command type: ${type}` };
      }
    } catch (error) {
      return { success: false, message: `Execution error: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
}

export const syncAICopilot = () => {
  (window as unknown as Record<string, unknown>).VibeAI = {
    execute: (commands: AICommand[]) => CommandInterpreter.executeBatch(commands),
    testPirateScene: () => CommandInterpreter.executeBatch([
      { type: "add_entity", params: { name: "Ocean" } },
      { type: "update_component", params: { entityId: 1, componentType: "Render", data: { meshType: "plane", color: "#0077be" } } },
      { type: "update_component", params: { entityId: 1, componentType: "Transform", data: { scale: [20, 1, 20], rotation: [-90, 0, 0] } } },
      { type: "add_entity", params: { name: "Island" } },
      { type: "update_component", params: { entityId: 2, componentType: "Render", data: { meshType: "sphere", color: "#c2b280" } } },
      { type: "update_component", params: { entityId: 2, componentType: "Transform", data: { position: [0, -0.5, 0], scale: [5, 1, 5] } } },
      { type: "add_entity", params: { name: "PirateShip" } },
      { type: "update_component", params: { entityId: 3, componentType: "Render", data: { meshType: "cube", color: "#4a3728" } } },
      { type: "update_component", params: { entityId: 3, componentType: "Transform", data: { position: [4, 0.5, 4], scale: [1, 0.8, 2] } } },
    ]),
  };
  console.log("🤖 VibeAI Copilot Bridge initialized! Use window.VibeAI to send commands.");
};