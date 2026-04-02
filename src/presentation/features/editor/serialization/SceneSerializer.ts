/**
 * SceneSerializer - Save/Load scene data to JSON
 */

import { useSceneStore, type EntityData, type ComponentData, useProjectStore } from '@infrastructure/store';
import { ProjectScanner } from '@infrastructure/services/ProjectScanner';

export interface SerializedScene {
    version: string;
    name: string;
    entities: SerializedEntity[];
}

export interface SerializedEntity {
    id: number;
    name: string;
    parentId: number | null;
    enabled: boolean;
    tags: string[];
    components: ComponentData[];
}

/**
 * Serialize current scene to JSON string
 */
export function serializeScene(): string {
    const state = useSceneStore.getState();

    const data: SerializedScene = {
        version: '1.0.0',
        name: state.sceneName,
        entities: []
    };

    // Serialize all entities
    state.entities.forEach((entity) => {
        data.entities.push({
            id: entity.id,
            name: entity.name,
            parentId: entity.parentId,
            enabled: entity.enabled,
            tags: [...entity.tags],
            components: entity.components.map(c => ({
                type: c.type,
                data: { ...c.data },
                enabled: c.enabled
            }))
        });
    });

    return JSON.stringify(data, null, 2);
}

/**
 * Deserialize JSON string to scene
 */
export function deserializeScene(json: string): void {
    const raw = JSON.parse(json);
    // Support both VibeEngine format (name) and Runtime Exporter format (sceneName)
    const data: SerializedScene = {
        version: raw.version || '1.0.0',
        name: raw.name || raw.sceneName || 'Imported Scene',
        entities: raw.entities || []
    };
    const store = useSceneStore.getState();

    // Clear existing scene
    store.clear();

    // Set scene name
    useSceneStore.setState({ sceneName: data.name });

    // Create entities (first pass - create all)
    const entityMap = new Map<number, EntityData>();
    const seenEntities = new Set<string>();

    for (const entity of data.entities) {
        // 🏛️ Sovereign Asset Normalization: Fix model paths if they are just directories
        const render = entity.components?.find((c: any) => c.type === 'Render');
        const transform = entity.components?.find((c: any) => c.type === 'Transform');
        
        if (render && render.data.meshType === 'model') {
            let path = render.data.modelPath || '';
            if (path && path.endsWith('/')) {
                const baseName = entity.name.replace(/_\d+$/, '');
                render.data.modelPath = path + (baseName.endsWith('.glb') ? baseName : baseName + '.glb');
            }
        }

        // 🛡️ Deduplication Heuristic: MobRunner sometimes exports parent and child with same model
        // If this is a child with same name/model as parent and zero transform, it's likely a duplicate
        const pId = entity.parentId;
        if (pId !== null && pId !== undefined && render && render.data.meshType === 'model') {
            const parent = data.entities.find((e: any) => e.id === pId);
            const pRender = parent?.components?.find((c: any) => c.type === 'Render');
            if (pRender && pRender.data.meshType === 'model' && pRender.data.modelPath === render.data.modelPath) {
                // Same model as parent, check if transform is identity
                const pos = transform?.data.position || [0,0,0];
                if (pos[0] === 0 && pos[1] === 0 && pos[2] === 0) {
                    continue; // Skip this duplicate entity
                }
            }
        }

        const entityData: EntityData = {
            id: entity.id,
            name: entity.name,
            parentId: null, // Set in second pass
            children: [],
            components: entity.components,
            enabled: entity.enabled,
            tags: entity.tags
        };
        entityMap.set(entity.id, entityData);
    }

    // Second pass - set up hierarchy
    const rootIds: number[] = [];

    for (const entity of data.entities) {
        const entityData = entityMap.get(entity.id);
        if (!entityData) continue; // Skip if entity was filtered out by deduplication

        if (entity.parentId === null || entity.parentId === undefined) {
            rootIds.push(entity.id);
        } else {
            entityData.parentId = entity.parentId;
            const parent = entityMap.get(entity.parentId);
            if (parent) {
                parent.children.push(entity.id);
            } else {
                // If parent was filtered out, make this a root entity
                rootIds.push(entity.id);
            }
        }
    }

    // Update store
    useSceneStore.setState({
        entities: entityMap,
        rootEntityIds: rootIds,
        nextEntityId: Math.max(...data.entities.map(e => e.id)) + 1,
        isDirty: false
    });
}

/**
 * Save scene (Direct to workspace if active, or Download as JSON)
 */
export async function downloadScene(filename: string = 'scene.json'): Promise<void> {
    const json = serializeScene();
    const launchedProject = useProjectStore.getState().launchedProject;

    // 🚀 Ultimate Studio: Direct Save to Workspace!
    if (launchedProject && launchedProject.path) {
        try {
            // Standard VibeEngine level path: src/levels/[sceneName].json
            const sceneName = useSceneStore.getState().sceneName || 'main';
            const projectRelativePath = `src/levels/${sceneName}.json`;
            const absolutePath = `${launchedProject.path}/${projectRelativePath}`;
            
            console.log(`💎 VIBEENGINE: Direct saving to workspace... ${absolutePath}`);
            const result = await ProjectScanner.saveFile(absolutePath, json);
            
            if (result.success) {
                console.log('✅ Scene saved directly to project workspace!');
                
                // Also trigger a small "Saved" notification if possible, 
                // but for now we'll just log success.
                return;
            } else {
                console.warn('⚠️ Direct save failed, falling back to download:', result.error);
            }
        } catch (e) {
            console.error('❌ Error during direct save:', e);
        }
    }

    // Default Fallback: Browser Download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Load scene from file input
 */
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

/**
 * Import scene from Runtime Exporter JSON string (MobRunner format)
 * Supports both VibeEngine format and Runtime Exporter format (sceneName, nextEntityId)
 */
export function importRuntimeScene(json: string): void {
    deserializeScene(json);
}

/**
 * Universal scene import — auto-detects format and normalizes
 * Supports: VibeEngine, MobRunner, Universal Three.js Exporter, GLTF JSON
 */
export function importUniversalScene(json: string): { format: string; entityCount: number } {
    const raw = JSON.parse(json);
    
    // Detect format
    const hasMetadata = raw._metadata && raw._metadata.source;
    const hasSceneName = typeof raw.sceneName === 'string';
    const hasNextEntityId = typeof raw.nextEntityId === 'number';
    const hasEntities = Array.isArray(raw.entities);
    
    let format = 'unknown';
    if (hasMetadata && raw._metadata.source.includes('Universal')) {
        format = 'universal-three';
    } else if (hasSceneName && hasNextEntityId && hasEntities) {
        format = 'runtime-exporter';
    } else if (raw.version && raw.name && hasEntities) {
        format = 'vibe-engine';
    } else if (raw.scenes || raw.nodes || raw.asset) {
        format = 'gltf';
    }
    
    // Normalize GLTF-like format
    if (format === 'gltf') {
        const normalized = normalizeGLTF(raw);
        deserializeScene(JSON.stringify(normalized));
        return { format, entityCount: normalized.entities.length };
    }
    
    // All other formats are compatible with deserializeScene
    deserializeScene(json);
    
    const entityCount = raw.entities ? raw.entities.length : 0;
    return { format, entityCount };
}

/**
 * Normalize GLTF JSON to VibeEngine format
 */
function normalizeGLTF(gltf: any): SerializedScene {
    const entities: SerializedEntity[] = [];
    const rootIds: number[] = [];
    let nextId = 1;
    
    const nodes = gltf.nodes || [];
    const meshes = gltf.meshes || [];
    
    const processNode = (node: any, parentId: number | null) => {
        const id = nextId++;
        const entity: SerializedEntity = {
            id,
            name: node.name || `node_${id}`,
            parentId,
            enabled: true,
            tags: ['imported'],
            components: []
        };
        
        // Transform
        const pos = node.translation || [0, 0, 0];
        const rot = node.rotation ? [
            node.rotation[0] * 180 / Math.PI,
            node.rotation[1] * 180 / Math.PI,
            node.rotation[2] * 180 / Math.PI
        ] : [0, 0, 0];
        const scl = node.scale || [1, 1, 1];
        
        entity.components.push({
            type: 'Transform',
            data: { position: pos, rotation: rot, scale: scl },
            enabled: true
        });
        
        // Render (if has mesh reference)
        if (node.mesh !== undefined && meshes[node.mesh]) {
            entity.components.push({
                type: 'Render',
                data: { meshType: 'mesh', color: '#808080' },
                enabled: true
            });
        }
        
        entities.push(entity);
        
        if (parentId === null) rootIds.push(id);
        
        // Process children
        if (node.children) {
            for (const childIdx of node.children) {
                if (nodes[childIdx]) {
                    processNode(nodes[childIdx], id);
                }
            }
        }
    };
    
    // Process root nodes
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const hasParent = nodes.some((n: any) => n.children && n.children.includes(i));
        if (!hasParent) {
            processNode(node, null);
        }
    }
    
    return {
        version: '1.0.0',
        name: gltf.asset?.generator || 'GLTF_Imported',
        entities,
    };
}

/**
 * Create default scene with basic entities
 */
export function createDefaultScene(): void {
    const store = useSceneStore.getState();
    store.clear();

    // Set scene name
    useSceneStore.setState({ sceneName: 'New Scene' });

    // Add camera
    const cameraId = store.addEntity('Main Camera', null);
    store.addComponent(cameraId, {
        type: 'Camera',
        data: { fov: 75, near: 0.1, far: 1000, isActive: true },
        enabled: true
    });
    store.updateComponent(cameraId, 'Transform', {
        position: [0, 5, 10],
        rotation: [-20, 0, 0]
    });

    // Add directional light
    const lightId = store.addEntity('Directional Light', null);
    store.addComponent(lightId, {
        type: 'Light',
        data: { lightType: 'directional', color: '#ffffff', intensity: 1, castShadow: true },
        enabled: true
    });
    store.updateComponent(lightId, 'Transform', {
        position: [5, 10, 5],
        rotation: [-45, 30, 0]
    });

    // Add ground
    const groundId = store.addEntity('Ground', null);
    store.addComponent(groundId, {
        type: 'Render',
        data: { meshType: 'plane', color: '#374151', castShadow: false, receiveShadow: true },
        enabled: true
    });
    store.updateComponent(groundId, 'Transform', {
        scale: [20, 1, 20],
        rotation: [-90, 0, 0]
    });

    // Add sample cube
    const cubeId = store.addEntity('Cube', null);
    store.addComponent(cubeId, {
        type: 'Render',
        data: { meshType: 'cube', color: '#6366f1', castShadow: true, receiveShadow: true },
        enabled: true
    });
    store.updateComponent(cubeId, 'Transform', {
        position: [0, 0.5, 0]
    });

    useSceneStore.setState({ isDirty: false });
}
