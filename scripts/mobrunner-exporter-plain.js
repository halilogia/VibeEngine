/**
 * Runtime Exporter - MobRunner → VibeEngine scene.json
 * 
 * USAGE (3 ways):
 * 
 * 1. BROWSER CONSOLE (easiest):
 *    - Open MobRunner in browser
 *    - Open DevTools Console (F12)
 *    - Copy-paste the ENTIRE content of mobrunner-exporter-plain.js
 *    - Type: exportToVibeEngine()
 * 
 * 2. TEMPORARY SCRIPT TAG:
 *    - Add to MobRunner's index.html before closing </body>:
 *      <script src="scripts/mobrunner-exporter-plain.js"></script>
 *    - Open game, then call exportToVibeEngine() in console
 * 
 * 3. BOOKMARKLET:
 *    - Create a bookmark with this URL:
 *      javascript:(function(){/* paste minified code here */})()
 * 
 * WHAT IT EXPORTS:
 * - Static environment: buildings, roads, sidewalks, fences, trees, streetlights
 * - Game objects: gates, enemies, bosses (with placeholder ScriptComponents)
 * - Transforms: position (x,y,z), rotation (degrees), scale
 * - Render info: mesh type or model path, color
 * - Collision info: box colliders for game objects
 * 
 * WHAT IT SKIPS:
 * - Lights (ambient, directional, hemisphere)
 * - Clouds (decorative, not part of level design)
 * - Invisible plane (raycasting helper)
 * - Player/mobs (dynamic, spawned at runtime)
 * - Bullets, explosions, VFX (transient effects)
 */

// ─── CONFIG ────────────────────────────────────────────────
var EXPORT_CONFIG = {
    skipNames: ['__sceneroot__', 'planemesh', 'cloud'],
    zRange: { min: -500, max: 100 },
    modelPathMap: [
        { key: 'building', path: 'assets/models/environment/buildings/' },
        { key: 'road', path: 'assets/models/environment/roads/' },
        { key: 'tree', path: 'assets/models/environment/trees/' },
        { key: 'fence', path: 'assets/models/environment/fences/' },
        { key: 'light', path: 'assets/models/environment/lights/' },
        { key: 'planter', path: 'assets/models/environment/props/' },
    ],
};

// ─── HELPER FUNCTIONS ──────────────────────────────────────

function detectObjectType(obj) {
    if (obj.userData && obj.userData.type) return obj.userData.type;
    if (obj.userData && obj.userData.isEnemy) return 'enemy';
    if (obj.userData && obj.userData.isPlayer) return 'player';
    if (obj.userData && obj.userData.isGate) return 'gate';
    if (obj.userData && obj.userData.isBoss) return 'boss';

    var name = obj.name ? obj.name.toLowerCase() : '';
    if (name.indexOf('building') !== -1) return 'building';
    if (name.indexOf('road') !== -1) return 'road';
    if (name.indexOf('sidewalk') !== -1) return 'sidewalk';
    if (name.indexOf('tree') !== -1) return 'tree';
    if (name.indexOf('fence') !== -1) return 'fence';
    if (name.indexOf('light') !== -1) return 'streetlight';
    if (name.indexOf('planter') !== -1 || name.indexOf('prop') !== -1) return 'prop';
    if (name.indexOf('water') !== -1 || name.indexOf('ground') !== -1) return 'ground';

    if (obj.isMesh) {
        var geo = obj.geometry;
        if (geo) {
            if (geo.type === 'PlaneGeometry') return 'ground';
            if (geo.type === 'BoxGeometry') return 'box';
        }
    }

    return 'unknown';
}

function extractModelPath(obj) {
    if (obj.userData && obj.userData.modelPath) return obj.userData.modelPath;

    var objType = detectObjectType(obj);
    for (var i = 0; i < EXPORT_CONFIG.modelPathMap.length; i++) {
        var entry = EXPORT_CONFIG.modelPathMap[i];
        if (objType.indexOf(entry.key) !== -1) {
            return entry.path;
        }
    }
    return null;
}

function determineMeshType(obj) {
    if (obj.isMesh && obj.geometry) {
        var t = obj.geometry.type;
        if (t === 'PlaneGeometry') return 'plane';
        if (t === 'BoxGeometry') return 'cube';
        if (t === 'SphereGeometry') return 'sphere';
        if (t === 'CylinderGeometry') return 'cylinder';
        if (t === 'ConeGeometry') return 'cone';
        return 'mesh';
    }
    return 'group';
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

function shouldExport(obj) {
    if (obj.isLight) return false;

    var name = obj.name ? obj.name.toLowerCase() : '';
    for (var i = 0; i < EXPORT_CONFIG.skipNames.length; i++) {
        if (name.indexOf(EXPORT_CONFIG.skipNames[i]) !== -1) return false;
    }

    // Skip clouds (have userData.speed but no userData.type)
    if (obj.userData && obj.userData.speed && !obj.userData.type) return false;

    // Skip transient game objects
    if (obj.userData && obj.userData.isBullet) return false;
    if (obj.userData && obj.userData.isExplosion) return false;
    if (obj.userData && obj.userData.isMob) return false;

    // Check Z range
    if (obj.position.z < EXPORT_CONFIG.zRange.min || obj.position.z > EXPORT_CONFIG.zRange.max) {
        return false;
    }

    return true;
}

// ─── MAIN EXPORT FUNCTION ──────────────────────────────────

function exportToVibeEngine() {
    console.log('🚀 Starting MobRunner → VibeEngine export...');

    var scene = window.scene;
    var gameLayer = window.gameLayer;

    if (!scene) {
        console.error('❌ window.scene not found! Make sure MobRunner is running.');
        return;
    }

    var entities = [];
    var nextId = 1;
    var rootIds = [];
    var exportedObjects = new Set();

    function convertObject(obj, parentId) {
        if (parentId === undefined) parentId = null;
        if (!shouldExport(obj) || exportedObjects.has(obj)) return;
        exportedObjects.add(obj);

        var objType = detectObjectType(obj);
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

        // ─── CollisionComponent (for game objects) ──────────
        if (['enemy', 'player', 'gate', 'boss', 'obstacle'].indexOf(objType) !== -1) {
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
        if (['enemy', 'gate', 'boss'].indexOf(objType) !== -1) {
            var scriptName = objType.charAt(0).toUpperCase() + objType.slice(1) + 'Logic';
            entity.components.push({
                type: 'Script',
                data: {
                    scriptName: scriptName,
                    scriptContent: '// TODO: Implement ' + objType + ' logic\n// This is a placeholder - add your game logic here',
                },
                enabled: true
            });
        }

        entities.push(entity);

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

    // ─── EXPORT SCENE OBJECTS ───────────────────────────────
    console.log('📦 Exporting scene objects...');

    if (gameLayer) {
        for (var i = 0; i < gameLayer.children.length; i++) {
            convertObject(gameLayer.children[i]);
        }
    }

    // Also check root scene for any missed objects
    for (var j = 0; j < scene.children.length; j++) {
        var child = scene.children[j];
        if (!exportedObjects.has(child) && shouldExport(child)) {
            convertObject(child);
        }
    }

    // ─── BUILD SCENE FILE ───────────────────────────────────
    var sceneFile = {
        sceneName: 'MobRunner_Imported',
        version: '1.0.0',
        nextEntityId: nextId,
        entities: entities,
        rootEntityIds: rootIds,
    };

    // ─── DOWNLOAD ───────────────────────────────────────────
    var json = JSON.stringify(sceneFile, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'mobrunner_scene.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // ─── SUMMARY ────────────────────────────────────────────
    var typeCounts = {};
    for (var k = 0; k < entities.length; k++) {
        var tag = entities[k].tags[0] || 'unknown';
        typeCounts[tag] = (typeCounts[tag] || 0) + 1;
    }

    console.log('✅ Export complete!');
    console.log('📊 Total entities: ' + entities.length);
    console.log('📋 Breakdown:', typeCounts);
    console.log('💾 File downloaded: mobrunner_scene.json');
    console.log('');
    console.log('📝 NEXT STEP: Import mobrunner_scene.json into VibeEngine editor');
    console.log('   via Assets Panel → Import Scene, or drag-drop into Viewport.');
}

// ─── EXPOSE TO WINDOW ──────────────────────────────────────
if (typeof window !== 'undefined') {
    window.exportToVibeEngine = exportToVibeEngine;
    console.log('✅ Runtime Exporter loaded. Call exportToVibeEngine() in console to export.');
}
