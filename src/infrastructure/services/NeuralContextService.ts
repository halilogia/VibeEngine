/**
 * NeuralContextService - Serializes the current studio state for AI consumption.
 * Part of the Sovereign AI-Native Pipeline 🏛️⚛️
 */

import { useSceneStore } from '@infrastructure/store/sceneStore';
import { useProjectStore } from '@infrastructure/store/projectStore';

export class NeuralContextService {
    /**
     * Generates a compact JSON summary of the active 3D scene.
     * Focuses on Name, ID, and Transform for token efficiency.
     */
    static getSceneSnapshot(): string {
        const { entities, rootEntityIds } = useSceneStore.getState();
        const snapshot: any[] = [];

        // Recursive helper to traverse the tree (maintaining hierarchy context)
        const traverse = (id: number, depth = 0) => {
            const entity = entities.get(id);
            if (!entity) return;

            const transform = entity.components.find(c => c.type === 'Transform')?.data || {};
            const pos = transform.position || [0, 0, 0];
            
            snapshot.push({
                id: entity.id,
                name: entity.name,
                depth, // AI can infer hierarchy from depth
                pos: `[${pos[0]}, ${pos[1]}, ${pos[2]}]`,
                components: entity.components.map(c => c.type)
            });

            entity.children.forEach(childId => traverse(childId, depth + 1));
        };

        rootEntityIds.forEach(id => traverse(id));

        return JSON.stringify(snapshot, null, 2);
    }

    /**
     * Lists current project assets (Models, Scripts, Textures).
     */
    static getAssetInventory(): string {
        const { assets } = useSceneStore.getState(); // Assuming assets are tracked here
        
        const inventory = {
            scripts: assets.filter(a => a.type === 'script').map(a => a.name),
            models: assets.filter(a => a.type === 'model').map(a => a.name)
        };

        return JSON.stringify(inventory, null, 2);
    }

    /**
     * Composes the full system context block.
     */
    static getFullContext(): string {
        const scene = this.getSceneSnapshot();
        const assets = this.getAssetInventory();
        const { selectedEntityId } = useSceneStore.getState();

        return `
--- SCENE CONTEXT (🏛️ VIBEENGINE SYSTEM SNAPSHOT) ---
ACTIVE_SELECTION_ID: ${selectedEntityId || 'NONE'}
ENTITIES_IN_WORLD:
${scene}

AVAILABLE_ASSETS:
${assets}
-----------------------------------------------------
        `.trim();
    }
}
