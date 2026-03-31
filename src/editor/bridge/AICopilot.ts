/**
 * AICopilot - Bridge between Natural Language AI commands and VibeEngine Store
 * This allows an AI (like Gemini) to control the engine by sending JSON commands.
 */

import { useSceneStore, type ComponentData } from '../stores/sceneStore';

/**
 * Supported AI Command Types
 */
export type AICommandType = 
    | 'add_entity' 
    | 'remove_entity' 
    | 'rename_entity'
    | 'add_component' 
    | 'update_component'
    | 'remove_component'
    | 'set_parent';

/**
 * Structure of a single AI command
 */
export interface AICommand {
    type: AICommandType;
    params: Record<string, any>;
}

/**
 * Result of command execution
 */
export interface CommandResult {
    success: boolean;
    message: string;
    entityId?: number;
}

/**
 * CommandInterpreter - Parses and executes AI commands
 */
export class CommandInterpreter {
    /**
     * Executes a batch of commands in sequence
     * @param commands List of commands to execute
     * @returns Array of results for each command
     */
    static executeBatch(commands: AICommand[]): CommandResult[] {
        const results: CommandResult[] = [];
        const sceneStore = useSceneStore.getState();

        console.group('🤖 AI Copilot: Executing Command Batch');
        
        for (const cmd of commands) {
            const result = this.execute(cmd, sceneStore);
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

    /**
     * Executes a single command
     */
    private static execute(cmd: AICommand, store: any): CommandResult {
        try {
            switch (cmd.type) {
                case 'add_entity': {
                    const id = store.addEntity(cmd.params.name, cmd.params.parentId);
                    
                    if (cmd.params.components && Array.isArray(cmd.params.components)) {
                        for (const comp of cmd.params.components) {
                            store.addComponent(id, comp);
                        }
                    }

                    return { success: true, message: `Entity "${cmd.params.name}" added with ID ${id}`, entityId: id };
                }

                case 'spawn_prefab': {
                    const prefabName = cmd.params.prefabName;
                    const id = store.addEntity(prefabName, cmd.params.parentId);
                    
                    // Built-in Prefab Templates for Prototype
                    switch (prefabName) {
                        case 'PirateShip':
                            store.updateComponent(id, 'Transform', { scale: [1, 0.8, 2], position: cmd.params.position || [0, 0.5, 0] });
                            store.addComponent(id, { type: 'Render', data: { meshType: 'cube', color: '#4a3728' }, enabled: true });
                            store.addComponent(id, { type: 'Collision', data: { colliderType: 'box' }, enabled: true });
                            break;
                            
                        case 'PlayerCharacter':
                            store.updateComponent(id, 'Transform', { position: cmd.params.position || [0, 0.5, 0] });
                            store.addComponent(id, { type: 'Render', data: { meshType: 'capsule', color: '#0f3460' }, enabled: true });
                            store.addComponent(id, { type: 'Script', data: { scriptName: 'PlayerMoveScript' }, enabled: true });
                            store.addComponent(id, { type: 'Collision', data: { colliderType: 'capsule' }, enabled: true });
                            break;

                        case 'OceanTile':
                            store.updateComponent(id, 'Transform', { scale: [50, 1, 50], rotation: [-90, 0, 0] });
                            store.addComponent(id, { type: 'Render', data: { meshType: 'plane', color: '#0077be' }, enabled: true });
                            break;
                    }

                    return { success: true, message: `Prefab "${prefabName}" spawned with ID ${id}`, entityId: id };
                }

                case 'remove_entity': {
                    store.removeEntity(cmd.params.id);
                    return { success: true, message: `Entity ${cmd.params.id} removed` };
                }

                case 'rename_entity': {
                    store.renameEntity(cmd.params.id, cmd.params.name);
                    return { success: true, message: `Entity ${cmd.params.id} renamed to "${cmd.params.name}"` };
                }

                case 'add_component': {
                    const comp: ComponentData = {
                        type: cmd.params.componentType,
                        data: cmd.params.data || {},
                        enabled: cmd.params.enabled !== false
                    };
                    store.addComponent(cmd.params.entityId, comp);
                    return { success: true, message: `Component ${cmd.params.componentType} added to entity ${cmd.params.entityId}` };
                }

                case 'update_component': {
                    store.updateComponent(cmd.params.entityId, cmd.params.componentType, cmd.params.data);
                    return { success: true, message: `Component ${cmd.params.componentType} updated on entity ${cmd.params.entityId}` };
                }

                case 'remove_component': {
                    store.removeComponent(cmd.params.entityId, cmd.params.componentType);
                    return { success: true, message: `Component ${cmd.params.componentType} removed from entity ${cmd.params.entityId}` };
                }

                case 'set_parent': {
                    store.setParent(cmd.params.entityId, cmd.params.parentId);
                    return { success: true, message: `Entity ${cmd.params.entityId} parented to ${cmd.params.parentId}` };
                }

                default:
                    return { success: false, message: `Unsupported command type: ${cmd.type}` };
            }
        } catch (error) {
            return { success: false, message: `Execution error: ${error instanceof Error ? error.message : String(error)}` };
        }
    }
}

/**
 * Mock utility for testing AI commands from the console
 */
export const syncAICopilot = () => {
    (window as any).VibeAI = {
        execute: (commands: AICommand[]) => CommandInterpreter.executeBatch(commands),
        
        // Helper for quick scene generation tests
        testPirateScene: () => {
             CommandInterpreter.executeBatch([
                { type: 'add_entity', params: { name: 'Ocean' } },
                { type: 'update_component', params: { entityId: 1, componentType: 'Render', data: { meshType: 'plane', color: '#0077be' } } },
                { type: 'update_component', params: { entityId: 1, componentType: 'Transform', data: { scale: [20, 1, 20], rotation: [-90, 0, 0] } } },
                
                { type: 'add_entity', params: { name: 'Island' } },
                { type: 'update_component', params: { entityId: 2, componentType: 'Render', data: { meshType: 'sphere', color: '#c2b280' } } },
                { type: 'update_component', params: { entityId: 2, componentType: 'Transform', data: { position: [0, -0.5, 0], scale: [5, 1, 5] } } },
                
                { type: 'add_entity', params: { name: 'PirateShip' } },
                { type: 'update_component', params: { entityId: 3, componentType: 'Render', data: { meshType: 'cube', color: '#4a3728' } } },
                { type: 'update_component', params: { entityId: 3, componentType: 'Transform', data: { position: [4, 0.5, 4], scale: [1, 0.8, 2] } } }
            ]);
        }
    };
    console.log('🤖 VibeAI Copilot Bridge initialized! Use window.VibeAI to send commands.');
};
