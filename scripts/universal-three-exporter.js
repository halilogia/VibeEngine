/**
 * Universal Three.js Scene Exporter → VibeEngine
 * 
 * Works with ANY Three.js project — auto-detects scene references.
 * 
 * USAGE:
 * 1. Open any Three.js project in browser
 * 2. Open DevTools Console (F12)
 * 3. Copy-paste this entire file
 * 4. Type: exportToVibeEngine()
 * 
 * AUTO-DETECTION:
 * Scans common locations: window.scene, window.game.scene, window.app.scene,
 * window.renderer.scene, THREE.Scene instances in window, etc.
 * 
 * WHAT IT EXPORTS:
 * - Meshes, Groups, Sprites (with transforms, materials)
 * - Hierarchy (parent-child relationships)
 * - Model paths from userData
 * - Collision hints from userData
 * 
 * WHAT IT SKIPS:
 * - Lights, cameras, helpers (by default, configurable)
 * - Transient objects (bullets, particles, effects)
 */

// ─── CONFIG ────────────────────────────────────────────────
var VIBE_EXPORT_CONFIG = {
    skipTypes: ['Light', 'Camera', 'Helper', 'GridHelper', 'AxesHelper'],
    skipNames: ['__sceneroot__', 'invisible', 'debug', 'gizmo'],
    skipUserDataKeys: ['isBullet', 'isExplosion', 'isMob', 'isParticle', 'isVFX'],
    zRange: null, // Set to {min, max} to filter by Z, or null to disable
    modelPathMap: [
        { key: 'building', path: 'assets/models/environment/buildings/' },
        { key: 'road', path: 'assets/models/environment/roads/' },
        { key: 'tree', path: 'assets/models/environment/trees/' },
        { key: 'fence', path: 'assets/models/environment/fences/' },
        { key: 'light', path: 'assets/models/environment/lights/' },
        { key: 'prop', path: 'assets/models/environment/props/' },
        { key: 'character', path: 'assets/models/characters/' },
        { key: 'weapon', path: 'assets/models/weapons/' },
    ],
};

// ─── SCENE DETECTION ──────────────────────────────────────

function detectThreeScene() {
    // 1. Direct window properties
    var candidates = [
        window.scene,
        window.gameScene,
        window.mainScene,
        window.game && window.game.scene,
        window.game && window.game.currentScene,
        window.app && window.app.scene,
        window.application && window.application.scene,
        window.engine && window.engine.scene,
        window.world && window.world.scene,
    ];

    for (var i = 0; i < candidates.length; i++) {
        if (candidates[i] && candidates[i].isScene) return candidates[i];
    }

    // 2. Check renderer
    if (window.renderer && window.renderer.scene && window.renderer.scene.isScene) {
        return window.renderer.scene;
    }

    // 3. Scan window for THREE.Scene instances
    for (var key in window) {
        try {
            var val = window[key];
            if (val && typeof val === 'object' && val.isScene) return val;
        } catch (e) { /* skip */ }
    }

    // 4. Scan THREE.Object3D children of document body
    if (typeof THREE !== 'undefined' && THREE.Scene) {
        var canvas = document.querySelector('canvas');
        if (canvas && canvas.parentNode) {
            // Try to find scene via renderer
            var props = Object.keys(canvas);
            for (var j = 0; j < props.length; j++) {
                if (props[j].startsWith('__reactFiber') || props[j].startsWith('__reactContainer')) {
                    // React Three Fiber — traverse fiber tree
                    var fiber = canvas[props[j]];
                    if (fiber) {
                        var found = findSceneInFiber(fiber);
                        if (found) return found;
                    }
                }
            }
        }
    }

    return null;
}

function findSceneInFiber(fiber) {
    if (!fiber) return null;
    if (fiber.memoizedProps && fiber.memoizedProps.scene) return fiber.memoizedProps.scene;
    if (fiber.child) {
        var found = findSceneInFiber(fiber.child);
        if (found) return found;
    }
    if (fiber.sibling) {
        var sibFound = findSceneInFiber(fiber.sibling);
        if (sibFound) return sibFound;
    }
    return null;
}

// ─── OBJECT CLASSIFICATION ────────────────────────────────

function getObjectType(obj) {
    // userData.type takes priority
    if (obj.userData && obj.userData.type) return obj.userData.type;

    var name = obj.name ? obj.name.toLowerCase() : '';

    // Name-based detection
    var nameMap = [
        { keys: ['building', 'house', 'tower'], type: 'building' },
        { keys: ['road', 'street', 'path'], type: 'road' },
        { keys: ['sidewalk', 'pavement'], type: 'sidewalk' },
        { keys: ['tree', 'plant', 'bush'], type: 'tree' },
        { keys: ['fence', 'wall', 'barrier'], type: 'fence' },
        { keys: ['light', 'lamp', 'streetlight'], type: 'streetlight' },
        { keys: ['prop', 'planter', 'bench'], type: 'prop' },
        { keys: ['water', 'ocean', 'lake', 'river'], type: 'water' },
        { keys: ['ground', 'terrain', 'floor'], type: 'ground' },
        { keys: ['player', 'hero', 'character'], type: 'player' },
        { keys: ['enemy', 'mob', 'monster', 'npc'], type: 'enemy' },
        { keys: ['boss'], type: 'boss' },
        { keys: ['gate', 'door', 'portal', 'trigger'], type: 'gate' },
        { keys: ['obstacle', 'crate', 'box', 'rock'], type: 'obstacle' },
        { keys: ['collectible', 'coin', 'item', 'pickup'], type: 'collectible' },
        { keys: ['ui', 'hud', 'canvas'], type: 'ui' },
    ];

    for (var i = 0; i < nameMap.length; i++) {
        var entry = nameMap[i];
        for (var j = 0; j < entry.keys.length; j++) {
            if (name.indexOf(entry.keys[j]) !== -1) return entry.keys[j] === 'ui' ? 'ui' : entry.type;
        }
    }

    // Geometry-based detection
    if (obj.isMesh && obj.geometry) {
        var geoType = obj.geometry.type;
        if (geoType === 'PlaneGeometry') return 'ground';
        if (geoType === 'BoxGeometry') return 'box';
        if (geoType === 'SphereGeometry') return 'sphere';
        if (geoType === 'CylinderGeometry') return 'cylinder';
        if (geoType === 'ConeGeometry') return 'cone';
        if (geoType === 'CapsuleGeometry') return 'capsule';
        return 'mesh';
    }

    if (obj.isGroup || obj.type === 'Group') return 'group';
    if (obj.isSprite) return 'sprite';
    if (obj.isPoints) return 'points';

    return 'unknown';
}

function extractModelPath(obj) {
    // 1. userData.modelPath
    if (obj.userData && obj.userData.modelPath) return obj.userData.modelPath;
    if (obj.userData && obj.userData.gltfPath) return obj.userData.gltfPath;
    if (obj.userData && obj.userData.assetPath) return obj.userData.assetPath;

    // 2. userData with full URL — extract relative path
    if (obj.userData && obj.userData.url) {
        var url = obj.userData.url;
        var match = url.match(/\/(assets\/[^?]+)/);
        if (match) return match[1];
    }

    // 3. Name-based heuristic
    var objType = getObjectType(obj);
    for (var i = 0; i < VIBE_EXPORT_CONFIG.modelPathMap.length; i++) {
        var entry = VIBE_EXPORT_CONFIG.modelPathMap[i];
        if (objType.indexOf(entry.key) !== -1) return entry.path;
    }

    return null;
}

function determineMeshType(obj) {
    if (!obj.isMesh || !obj.geometry) {
        if (obj.isGroup || obj.type === 'Group') return 'group';
        if (obj.isSprite) return 'sprite';
        return 'unknown';
    }

    var geoType = obj.geometry.type;
    switch (geoType) {
        case 'PlaneGeometry': return 'plane';
        case 'BoxGeometry': return 'cube';
        case 'SphereGeometry': return 'sphere';
        case 'CylinderGeometry': return 'cylinder';
        case 'ConeGeometry': return 'cone';
        case 'CapsuleGeometry': return 'capsule';
        case 'TorusGeometry': return 'torus';
        case 'RingGeometry': return 'ring';
        case 'DodecahedronGeometry':
        case 'IcosahedronGeometry':
        case 'OctahedronGeometry':
        case 'TetrahedronGeometry': return 'polyhedron';
        case 'BufferGeometry': return 'mesh';
        default: return 'mesh';
    }
}

function extractColor(obj) {
    var color = '#808080';
    obj.traverse(function(child) {
        if (color !== '#808080') return;
        if (child.isMesh && child.material) {
            var mat = child.material;
            if (Array.isArray(mat)) mat = mat[0];
            if (mat && mat.color) {
                color = '#' + mat.color.getHexString();
            }
        }
    });
    return color;
}

function radToDeg(rad) {
    return rad * (180 / Math.PI);
}

// ─── FILTERING ────────────────────────────────────────────

function shouldExport(obj) {
    // Skip by type
    for (var i = 0; i < VIBE_EXPORT_CONFIG.skipTypes.length; i++) {
        if (obj.type && obj.type.indexOf(VIBE_EXPORT_CONFIG.skipTypes[i]) !== -1) return false;
    }

    // Skip by name
    var name = obj.name ? obj.name.toLowerCase() : '';
    for (var j = 0; j < VIBE_EXPORT_CONFIG.skipNames.length; j++) {
        if (name.indexOf(VIBE_EXPORT_CONFIG.skipNames[j]) !== -1) return false;
    }

    // Skip by userData flags
    if (obj.userData) {
        for (var k = 0; k < VIBE_EXPORT_CONFIG.skipUserDataKeys.length; k++) {
            if (obj.userData[VIBE_EXPORT_CONFIG.skipUserDataKeys[k]]) return false;
        }
    }

    // Skip invisible objects
    if (obj.visible === false) return false;

    // Z range filter
    if (VIBE_EXPORT_CONFIG.zRange) {
        if (obj.position.z < VIBE_EXPORT_CONFIG.zRange.min || obj.position.z > VIBE_EXPORT_CONFIG.zRange.max) {
            return false;
        }
    }

    return true;
}

// ─── MAIN EXPORT ──────────────────────────────────────────

function exportToVibeEngine() {
    console.log('🚀 Universal Three.js → VibeEngine export starting...');

    var scene = detectThreeScene();
    if (!scene) {
        console.error('❌ No Three.js scene detected! Tried:');
        console.error('  - window.scene, window.gameScene, window.mainScene');
        console.error('  - window.game.scene, window.app.scene');
        console.error('  - window.renderer.scene');
        console.error('  - React Three Fiber detection');
        console.error('');
        console.error('💡 Manual override: set window.scene = yourScene, then run again.');
        return;
    }

    console.log('✅ Scene detected: ' + (scene.name || 'unnamed'));

    var entities = [];
    var nextId = 1;
    var rootIds = [];
    var exportedObjects = new Set();
    var typeCounts = {};

    function convertObject(obj, parentId) {
        if (parentId === undefined) parentId = null;
        if (!shouldExport(obj) || exportedObjects.has(obj)) return;
        exportedObjects.add(obj);

        var objType = getObjectType(obj);
        var entityId = nextId++;

        var entity = {
            id: entityId,
            name: obj.name || (objType + '_' + entityId),
            parentId: parentId,
            children: [],
            components: [],
            enabled: obj.visible !== false,
            tags: [objType],
        };

        // ─── TransformComponent ─────────────────────────────
        entity.components.push({
            type: 'Transform',
            data: {
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
            },
            enabled: true
        });

        // ─── RenderComponent ────────────────────────────────
        var meshType = determineMeshType(obj);
        var modelPath = extractModelPath(obj);
        var color = extractColor(obj);

        if (meshType !== 'unknown' && meshType !== 'group') {
            var renderData = {
                meshType: modelPath ? 'model' : meshType,
                color: color,
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
        }

        // ─── CollisionComponent (hint from userData) ────────
        if (obj.userData && (obj.userData.isTrigger || obj.userData.collider || obj.userData.collision)) {
            entity.components.push({
                type: 'Collision',
                data: {
                    colliderType: obj.userData.colliderType || 'box',
                    size: obj.userData.colliderSize || [1, 1, 1],
                    isTrigger: obj.userData.isTrigger || false,
                },
                enabled: true
            });
        }

        // ─── ScriptComponent (hint from userData) ───────────
        if (obj.userData && obj.userData.scriptName) {
            entity.components.push({
                type: 'Script',
                data: {
                    scriptName: obj.userData.scriptName,
                    scriptContent: obj.userData.scriptContent || '// Auto-generated from userData\n// TODO: Implement logic',
                },
                enabled: true
            });
        }

        entities.push(entity);
        typeCounts[objType] = (typeCounts[objType] || 0) + 1;

        if (parentId === null) {
            rootIds.push(entityId);
        } else {
            for (var i = 0; i < entities.length; i++) {
                if (entities[i].id === parentId) {
                    entities[i].children.push(entityId);
                    break;
                }
            }
        }

        // Process children
        for (var j = 0; j < obj.children.length; j++) {
            convertObject(obj.children[j], entityId);
        }
    }

    // Export from scene root
    for (var i = 0; i < scene.children.length; i++) {
        convertObject(scene.children[i]);
    }

    // ─── BUILD SCENE FILE ───────────────────────────────────
    var sceneFile = {
        sceneName: scene.name || 'Universal_Imported',
        version: '1.0.0',
        nextEntityId: nextId,
        entities: entities,
        rootEntityIds: rootIds,
        _metadata: {
            source: 'Universal Three.js Exporter',
            originalSceneName: scene.name || 'unnamed',
            exportDate: new Date().toISOString(),
            typeCounts: typeCounts,
        }
    };

    // ─── DOWNLOAD ───────────────────────────────────────────
    var json = JSON.stringify(sceneFile, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (scene.name || 'scene') + '_vibe.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // ─── SUMMARY ────────────────────────────────────────────
    console.log('✅ Export complete!');
    console.log('📊 Total entities: ' + entities.length);
    console.log('📋 Breakdown:', typeCounts);
    console.log('💾 File downloaded: ' + (scene.name || 'scene') + '_vibe.json');
    console.log('');
    console.log('📝 NEXT STEP: Import into VibeEngine via File → Import Runtime Scene');
}

// ─── EXPOSE ───────────────────────────────────────────────
if (typeof window !== 'undefined') {
    window.exportToVibeEngine = exportToVibeEngine;
    window._vibeSceneDetector = detectThreeScene;
    console.log('✅ Universal Three.js Exporter loaded.');
    console.log('   Call exportToVibeEngine() in console to export.');
    console.log('   Call _vibeSceneDetector() to check detected scene.');
}
