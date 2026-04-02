/**
 * Runtime Exporter - MobRunner → VibeEngine scene.json
 * 
 * USAGE: Paste this script into browser console while MobRunner is running,
 *        or add it temporarily to MobRunner's index.html and call exportToVibeEngine()
 * 
 * WHAT IT DOES:
 * 1. Traverses the Three.js scene (scene.children + gameLayer)
 * 2. Extracts position, rotation, scale from each mesh/group
 * 3. Detects object types via userData tags and naming conventions
 * 4. Outputs VibeEngine-compatible scene.json
 * 5. Downloads the file automatically
 */

interface VibeEntity {
    id: number;
    name: string;
    parentId: number | null;
    children: number[];
    components: VibeComponent[];
    enabled: boolean;
    tags: string[];
}

interface VibeComponent {
    type: string;
    data: Record<string, unknown>;
    enabled: boolean;
}

interface VibeSceneFile {
    sceneName: string;
    version: string;
    nextEntityId: number;
    entities: VibeEntity[];
    rootEntityIds: number[];
}

// ─── CONFIG ────────────────────────────────────────────────
const EXPORT_CONFIG = {
    // Skip these Three.js internals
    skipTypes: ['AmbientLight', 'DirectionalLight', 'HemisphereLight', 'PointLight', 'SpotLight'],
    skipNames: ['__SceneRoot__', 'planeMesh', 'cloud'],
    // Only export objects within this Z range (relative to player)
    zRange: { min: -500, max: 100 },
    // Model path mapping (MobRunner model names → VibeEngine asset paths)
    modelPathMap: new Map<string, string>([
        ['building', 'assets/models/environment/buildings/'],
        ['road', 'assets/models/environment/roads/'],
        ['tree', 'assets/models/environment/trees/'],
        ['fence', 'assets/models/environment/fences/'],
        ['light', 'assets/models/environment/lights/'],
        ['planter', 'assets/models/environment/props/'],
    ]),
};

// ─── HELPER FUNCTIONS ──────────────────────────────────────

/**
 * Detect object category from userData, name, or structure
 */
function detectObjectType(obj: THREE.Object3D): string {
    // Check userData first (most reliable)
    if (obj.userData?.type) {
        return obj.userData.type;
    }
    if (obj.userData?.isEnemy) return 'enemy';
    if (obj.userData?.isPlayer) return 'player';
    if (obj.userData?.isGate) return 'gate';
    if (obj.userData?.isBoss) return 'boss';

    // Check name patterns
    const name = obj.name.toLowerCase();
    if (name.includes('building')) return 'building';
    if (name.includes('road')) return 'road';
    if (name.includes('sidewalk')) return 'sidewalk';
    if (name.includes('tree')) return 'tree';
    if (name.includes('fence')) return 'fence';
    if (name.includes('light')) return 'streetlight';
    if (name.includes('planter') || name.includes('prop')) return 'prop';
    if (name.includes('water') || name.includes('ground')) return 'ground';

    // Check if it's a mesh with geometry
    if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry?.type === 'PlaneGeometry') return 'ground';
        if (mesh.geometry?.type === 'BoxGeometry') return 'box';
    }

    return 'unknown';
}

/**
 * Extract model path from object's userData or geometry
 */
function extractModelPath(obj: THREE.Object3D): string | null {
    // Check userData for explicit model path
    if (obj.userData?.modelPath) {
        return obj.userData.modelPath;
    }

    // Try to infer from object structure
    const objType = detectObjectType(obj);
    for (const [key, path] of EXPORT_CONFIG.modelPathMap) {
        if (objType.includes(key)) {
            // Return the base path - specific filename would need to be set manually
            return path;
        }
    }

    return null;
}

/**
 * Determine mesh type for VibeEngine RenderComponent
 */
function determineMeshType(obj: THREE.Object3D): string {
    if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const geoType = mesh.geometry?.type;
        if (geoType === 'PlaneGeometry') return 'plane';
        if (geoType === 'BoxGeometry') return 'cube';
        if (geoType === 'SphereGeometry') return 'sphere';
        if (geoType === 'CylinderGeometry') return 'cylinder';
        if (geoType === 'ConeGeometry') return 'cone';
        return 'mesh';
    }
    return 'group';
}

/**
 * Extract color from object's material
 */
function extractColor(obj: THREE.Object3D): string {
    let color = '#808080';
    obj.traverse((child) => {
        if (color !== '#808080') return; // Already found
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshLambertMaterial | THREE.MeshBasicMaterial;
            if (mat.color) {
                color = '#' + mat.color.getHexString();
            }
        }
    });
    return color;
}

/**
 * Convert Three.js Euler (radians) to VibeEngine degrees
 */
function radToDeg(rad: number): number {
    return THREE.MathUtils.radToDeg(rad);
}

/**
 * Check if object should be exported
 */
function shouldExport(obj: THREE.Object3D): boolean {
    // Skip lights
    if (obj.isLight) return false;

    // Skip skipped names
    if (EXPORT_CONFIG.skipNames.some(name => obj.name.toLowerCase().includes(name))) return false;

    // Skip clouds
    if (obj.userData?.speed && !obj.userData?.type) return false; // Clouds have speed but no type

    // Check Z range
    if (obj.position.z < EXPORT_CONFIG.zRange.min || obj.position.z > EXPORT_CONFIG.zRange.max) {
        return false;
    }

    return true;
}

// ─── MAIN EXPORT FUNCTION ──────────────────────────────────

function exportToVibeEngine(): void {
    console.log('🚀 Starting MobRunner → VibeEngine export...');

    const scene = (window as any).scene as THREE.Scene;
    const gameLayer = (window as any).gameLayer as THREE.Group;

    if (!scene) {
        console.error('❌ window.scene not found! Make sure MobRunner is running.');
        return;
    }

    const entities: VibeEntity[] = [];
    let nextId = 1;
    const rootIds: number[] = [];

    // Track objects we've already exported (avoid duplicates)
    const exportedObjects = new Set<THREE.Object3D>();

    /**
     * Convert a single Three.js object to VibeEngine entity
     */
    function convertObject(obj: THREE.Object3D, parentId: number | null = null): void {
        if (!shouldExport(obj) || exportedObjects.has(obj)) return;
        exportedObjects.add(obj);

        const objType = detectObjectType(obj);
        const entityId = nextId++;

        const entity: VibeEntity = {
            id: entityId,
            name: obj.name || `${objType}_${entityId}`,
            parentId,
            children: [],
            components: [],
            enabled: obj.visible,
            tags: [objType],
        };

        // ─── TransformComponent ─────────────────────────────
        const transformData = {
            position: [
                parseFloat(obj.position.x.toFixed(3)),
                parseFloat(obj.position.y.toFixed(3)),
                parseFloat(obj.position.z.toFixed(3))
            ],
            rotation: [
                parseFloat(radToDeg(obj.rotation.x).toFixed(2)),
                parseFloat(radToDeg(obj.rotation.y).toFixed(2)),
                parseFloat(radToDeg(obj.rotation.z).toFixed(2))
            ],
            scale: [
                parseFloat(obj.scale.x.toFixed(3)),
                parseFloat(obj.scale.y.toFixed(3)),
                parseFloat(obj.scale.z.toFixed(3))
            ]
        };

        entity.components.push({
            type: 'Transform',
            data: transformData,
            enabled: true
        });

        // ─── RenderComponent ────────────────────────────────
        const meshType = determineMeshType(obj);
        const modelPath = extractModelPath(obj);
        const color = extractColor(obj);

        const renderData: Record<string, unknown> = {
            meshType: modelPath ? 'model' : meshType,
            color,
            castShadow: false,
            receiveShadow: true,
        };

        if (modelPath) {
            renderData.modelPath = modelPath;
        }

        entity.components.push({
            type: 'Render',
            data: renderData,
            enabled: true
        });

        // ─── CollisionComponent (for game objects) ──────────
        if (['enemy', 'player', 'gate', 'boss', 'obstacle'].includes(objType)) {
            entity.components.push({
                type: 'Collision',
                data: {
                    colliderType: 'box',
                    size: [1, 1, 1],
                    isTrigger: objType === 'gate',
                },
                enabled: true
            });
        }

        // ─── ScriptComponent (for game logic objects) ───────
        if (['enemy', 'gate', 'boss'].includes(objType)) {
            entity.components.push({
                type: 'Script',
                data: {
                    scriptName: `${objType.charAt(0).toUpperCase() + objType.slice(1)}Logic`,
                    scriptContent: `// TODO: Implement ${objType} logic\n// This is a placeholder - add your game logic here`,
                },
                enabled: true
            });
        }

        entities.push(entity);

        if (parentId === null) {
            rootIds.push(entityId);
        } else {
            const parent = entities.find(e => e.id === parentId);
            if (parent) {
                parent.children.push(entityId);
            }
        }

        // Process children
        obj.children.forEach(child => convertObject(child, entityId));
    }

    // ─── EXPORT SCENE OBJECTS ───────────────────────────────
    console.log('📦 Exporting scene objects...');

    // Export gameLayer contents (this is where most game objects live)
    if (gameLayer) {
        gameLayer.children.forEach(child => convertObject(child));
    }

    // Also check root scene for any missed objects
    scene.children.forEach(child => {
        if (!exportedObjects.has(child) && shouldExport(child)) {
            convertObject(child);
        }
    });

    // ─── BUILD SCENE FILE ───────────────────────────────────
    const sceneFile: VibeSceneFile = {
        sceneName: 'MobRunner_Imported',
        version: '1.0.0',
        nextEntityId: nextId,
        entities,
        rootEntityIds: rootIds,
    };

    // ─── DOWNLOAD ───────────────────────────────────────────
    const json = JSON.stringify(sceneFile, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mobrunner_scene.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // ─── SUMMARY ────────────────────────────────────────────
    const typeCounts: Record<string, number> = {};
    entities.forEach(e => {
        const tag = e.tags[0] || 'unknown';
        typeCounts[tag] = (typeCounts[tag] || 0) + 1;
    });

    console.log('✅ Export complete!');
    console.log(`📊 Total entities: ${entities.length}`);
    console.log('📋 Breakdown:', typeCounts);
    console.log('💾 File downloaded: mobrunner_scene.json');
}

// ─── EXPOSE TO WINDOW ──────────────────────────────────────
if (typeof window !== 'undefined') {
    (window as any).exportToVibeEngine = exportToVibeEngine;
    console.log('✅ Runtime Exporter loaded. Call exportToVibeEngine() in console to export.');
}
