import { useSceneStore, type ComponentData } from "@infrastructure/store";

export type AICommandType =
  | "add_entity"
  | "remove_entity"
  | "rename_entity"
  | "add_component"
  | "update_component"
  | "remove_component"
  | "set_parent"
  | "spawn_prefab"
  | "set_position"
  | "set_rotation"
  | "set_scale"
  | "set_material"
  | "save_file"
  | "attach_script";

export interface AICommand {
  type: AICommandType;
  params: Record<string, unknown>;
}

import { ProjectScanner } from "@infrastructure/services/ProjectScanner";

export interface CommandResult {
  success: boolean;
  message: string;
  entityId?: number;
}

export class CommandInterpreter {
  static async executeBatch(commands: AICommand[]): Promise<CommandResult[]> {
    const results: CommandResult[] = [];
    const sceneStore = useSceneStore.getState();

    console.group("🤖 AI Copilot: Executing Command Batch");

    for (const cmd of commands) {
      const result = await this.execute(cmd, sceneStore);
      results.push(result);

      if (!result.success) {
        console.error(`❌ [AI] Command failed: ${cmd.type}`, result.message);
      } else {
        console.log(`✅ [AI] Command success: ${cmd.type}`, result.message);
      }
    }

    console.groupEnd();
    return results;
  }

  private static async execute(
    cmd: AICommand,
    store: ReturnType<typeof useSceneStore.getState>,
  ): Promise<CommandResult> {
    try {
      switch (cmd.type) {
        case "save_file": {
          const { filePath, content } = cmd.params;
          const res = await ProjectScanner.saveFile(
            filePath as string,
            content as string,
          );
          return {
            success: res.success,
            message: res.success
              ? `File saved: ${filePath}`
              : `Save failed: ${res.error}`,
          };
        }

        case "attach_script": {
          const { entityId, scriptPath } = cmd.params;
          store.addComponent(entityId as number, {
            type: "Script",
            data: { scriptPath: scriptPath as string },
            enabled: true,
          });
          return {
            success: true,
            message: `Script ${scriptPath} attached to entity ${entityId}`,
          };
        }

        case "set_position": {
          const { id, x, y, z } = cmd.params;
          store.updateComponent(id as number, "Transform", {
            position: [x, y, z],
          });
          return {
            success: true,
            message: `Position of entity ${id} set to [${x}, ${y}, ${z}]`,
          };
        }

        case "set_rotation": {
          const { id, x, y, z } = cmd.params;
          store.updateComponent(id as number, "Transform", {
            rotation: [x, y, z],
          });
          return {
            success: true,
            message: `Rotation of entity ${id} set to [${x}, ${y}, ${z}]`,
          };
        }

        case "set_scale": {
          const { id, x, y, z } = cmd.params;
          store.updateComponent(id as number, "Transform", {
            scale: [x, y, z],
          });
          return {
            success: true,
            message: `Scale of entity ${id} set to [${x}, ${y}, ${z}]`,
          };
        }

        case "set_material": {
          const { id, color, opacity } = cmd.params;
          store.updateComponent(id as number, "Render", {
            color,
            opacity: opacity ?? 1.0,
          });
          return {
            success: true,
            message: `Material of entity ${id} updated (Color: ${color})`,
          };
        }

        case "add_entity": {
          const id = store.addEntity(
            cmd.params.name as string,
            cmd.params.parentId as number | undefined,
          );

          if (cmd.params.components && Array.isArray(cmd.params.components)) {
            for (const comp of cmd.params.components) {
              store.addComponent(id, comp as ComponentData);
            }
          }

          return {
            success: true,
            message: `Entity "${cmd.params.name}" added with ID ${id}`,
            entityId: id,
          };
        }

        case "spawn_prefab": {
          const prefabName = cmd.params.prefabName as string;
          const id = store.addEntity(
            prefabName,
            cmd.params.parentId as number | undefined,
          );

          switch (prefabName) {
            case "PirateShip":
              store.updateComponent(id, "Transform", {
                scale: [1, 0.8, 2],
                position: (cmd.params.position as number[]) || [0, 0.5, 0],
              });
              store.addComponent(id, {
                type: "Render",
                data: { meshType: "cube", color: "#4a3728" },
                enabled: true,
              });
              store.addComponent(id, {
                type: "Collision",
                data: { colliderType: "box" },
                enabled: true,
              });
              break;

            case "PlayerCharacter":
              store.updateComponent(id, "Transform", {
                position: (cmd.params.position as number[]) || [0, 0.5, 0],
              });
              store.addComponent(id, {
                type: "Render",
                data: { meshType: "capsule", color: "#0f3460" },
                enabled: true,
              });
              store.addComponent(id, {
                type: "Script",
                data: { scriptName: "PlayerMoveScript" },
                enabled: true,
              });
              store.addComponent(id, {
                type: "Collision",
                data: { colliderType: "capsule" },
                enabled: true,
              });
              break;

            case "OceanTile":
              store.updateComponent(id, "Transform", {
                scale: [50, 1, 50],
                rotation: [-90, 0, 0],
              });
              store.addComponent(id, {
                type: "Render",
                data: { meshType: "plane", color: "#0077be" },
                enabled: true,
              });
              break;
          }

          return {
            success: true,
            message: `Prefab "${prefabName}" spawned with ID ${id}`,
            entityId: id,
          };
        }

        case "remove_entity": {
          store.removeEntity(cmd.params.id as number);
          return { success: true, message: `Entity ${cmd.params.id} removed` };
        }

        case "rename_entity": {
          store.renameEntity(
            cmd.params.id as number,
            cmd.params.name as string,
          );
          return {
            success: true,
            message: `Entity ${cmd.params.id} renamed to "${cmd.params.name}"`,
          };
        }

        case "add_component": {
          const comp: ComponentData = {
            type: cmd.params.componentType as string,
            data: (cmd.params.data ?? {}) as Record<string, unknown>,
            enabled: cmd.params.enabled !== false,
          };
          store.addComponent(cmd.params.entityId as number, comp);
          return {
            success: true,
            message: `Component ${cmd.params.componentType} added to entity ${cmd.params.entityId}`,
          };
        }

        case "update_component": {
          store.updateComponent(
            cmd.params.entityId as number,
            cmd.params.componentType as string,
            cmd.params.data as Record<string, unknown>,
          );
          return {
            success: true,
            message: `Component ${cmd.params.componentType} updated on entity ${cmd.params.entityId}`,
          };
        }

        case "remove_component": {
          store.removeComponent(
            cmd.params.entityId as number,
            cmd.params.componentType as string,
          );
          return {
            success: true,
            message: `Component ${cmd.params.componentType} removed from entity ${cmd.params.entityId}`,
          };
        }

        case "set_parent": {
          store.setParent(
            cmd.params.entityId as number,
            cmd.params.parentId as number,
          );
          return {
            success: true,
            message: `Entity ${cmd.params.entityId} parented to ${cmd.params.parentId}`,
          };
        }

        default:
          return {
            success: false,
            message: `Unsupported command type: ${cmd.type}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Execution error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

export const syncAICopilot = () => {
  (window as unknown as Record<string, unknown>).VibeAI = {
    execute: (commands: AICommand[]) =>
      CommandInterpreter.executeBatch(commands),

    testPirateScene: () => {
      CommandInterpreter.executeBatch([
        { type: "add_entity", params: { name: "Ocean" } },
        {
          type: "update_component",
          params: {
            entityId: 1,
            componentType: "Render",
            data: { meshType: "plane", color: "#0077be" },
          },
        },
        {
          type: "update_component",
          params: {
            entityId: 1,
            componentType: "Transform",
            data: { scale: [20, 1, 20], rotation: [-90, 0, 0] },
          },
        },

        { type: "add_entity", params: { name: "Island" } },
        {
          type: "update_component",
          params: {
            entityId: 2,
            componentType: "Render",
            data: { meshType: "sphere", color: "#c2b280" },
          },
        },
        {
          type: "update_component",
          params: {
            entityId: 2,
            componentType: "Transform",
            data: { position: [0, -0.5, 0], scale: [5, 1, 5] },
          },
        },

        { type: "add_entity", params: { name: "PirateShip" } },
        {
          type: "update_component",
          params: {
            entityId: 3,
            componentType: "Render",
            data: { meshType: "cube", color: "#4a3728" },
          },
        },
        {
          type: "update_component",
          params: {
            entityId: 3,
            componentType: "Transform",
            data: { position: [4, 0.5, 4], scale: [1, 0.8, 2] },
          },
        },
      ]);
    },
  };
  console.log(
    "🤖 VibeAI Copilot Bridge initialized! Use window.VibeAI to send commands.",
  );
};
