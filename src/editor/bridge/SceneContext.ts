/**
 * SceneContext - Provides the AI with a "vision" of the current scene.
 * This serializes the VibeEngine state into a format the AI can easily parse.
 */

import { useSceneStore, type EntityData } from '../stores/sceneStore';
import { COMPONENT_REGISTRY } from './ComponentRegistry';
import { SCRIPT_REGISTRY } from './ScriptRegistry';

/**
 * SceneContext - Serializer for the AI Copilot
 */
export class SceneContext {
    /**
     * Returns a full diagnostic of the current engine state
     */
    static getFullContext(): string {
        const sceneData = this.serializeScene();
        const capabilities = this.getEngineCapabilities();
        
        return JSON.stringify({
            scene: sceneData,
            engine: capabilities,
            timestamp: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Serializes the current hierarchy and entity states
     */
    static serializeScene(): any {
        const store = useSceneStore.getState();
        const rootEntities = store.rootEntityIds.map(id => store.entities.get(id)).filter(Boolean) as EntityData[];

        return {
            name: store.sceneName,
            entities: rootEntities.map(entity => this.serializeEntity(entity, store.entities))
        };
    }

    /**
     * Recursively serialize an entity and its children
     */
    private static serializeEntity(entity: EntityData, allEntities: Map<number, EntityData>): any {
        return {
            id: entity.id,
            name: entity.name,
            enabled: entity.enabled,
            components: entity.components.map(c => ({
                type: c.type,
                data: c.data
            })),
            children: entity.children
                .map(childId => allEntities.get(childId))
                .filter(Boolean)
                .map(child => this.serializeEntity(child as EntityData, allEntities))
        };
    }

    /**
     * Returns a summary of available components, scripts and prefabs
     */
    static getEngineCapabilities(): any {
        return {
            availableComponents: COMPONENT_REGISTRY.map(c => ({
                type: c.type,
                properties: c.properties.map(p => ({
                    name: p.name,
                    type: p.type,
                    options: p.options
                }))
            })),
            availableScripts: SCRIPT_REGISTRY.map(s => ({
                name: s.name,
                description: s.description,
                properties: s.properties
            })),
            availablePrefabs: ['PirateShip', 'PlayerCharacter', 'OceanTile', 'Island', 'LightSun'],
            availableMeshes: ['cube', 'sphere', 'cylinder', 'plane', 'capsule'],
            availableMaterials: ['standard']
        };
    }
}

/**
 * Global utility for console debugging
 */
export const syncSceneContext = () => {
    (window as any).VibeContext = {
        getScene: () => SceneContext.serializeScene(),
        getCapabilities: () => SceneContext.getEngineCapabilities(),
        getPromptContext: () => SceneContext.getFullContext()
    };
};
