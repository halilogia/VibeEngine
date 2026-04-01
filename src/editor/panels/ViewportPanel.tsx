/**
 * ViewportPanel v2 - 3D scene viewport with entity picking
 */

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { useEditorStore, useSceneStore } from '../stores';
import { Layers, Activity, MousePointer2 } from 'lucide-react';
import { ViewportToolbar } from '../components/ViewportToolbar';
import './ViewportPanel.css';

// Map editor entity IDs to Three.js objects
const entityMeshMap = new Map<number, THREE.Object3D>();

// Create mesh based on component data
function createMeshForEntity(meshType: string, color: string): THREE.Mesh {
    let geometry: THREE.BufferGeometry;

    switch (meshType) {
        case 'sphere':
            geometry = new THREE.SphereGeometry(0.5, 16, 16);
            break;
        case 'cylinder':
            geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
            break;
        case 'plane':
            geometry = new THREE.PlaneGeometry(1, 1);
            break;
        case 'capsule':
            geometry = new THREE.CapsuleGeometry(0.3, 0.5, 4, 8);
            break;
        case 'cube':
        default:
            geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    const material = new THREE.MeshStandardMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
}

export const ViewportPanel: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const orbitRef = useRef<OrbitControls | null>(null);
    const transformRef = useRef<TransformControls | null>(null);
    const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
    const gizmoRef = useRef<{ scene: THREE.Scene, camera: THREE.PerspectiveCamera } | null>(null);

    const { 
        editorMode, showGrid, showAxes, isPlaying, selectedEntityId, selectEntity,
        activePanelId, setActivePanel, shadingMode 
    } = useEditorStore();
    const { entities, rootEntityIds, updateComponent } = useSceneStore();
 
    // Helper to create a vertical gradient background texture
    const createGradientBackground = () => {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        if (!context) return null;

        const gradient = context.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, '#0f0f1a'); // Top (Deepest Space)
        gradient.addColorStop(0.5, '#1a1a2e'); // Middle
        gradient.addColorStop(1, '#2c2c4d'); // Bottom (Horizon Influence)

        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    };

    // Setup Three.js scene
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const scene = new THREE.Scene();
        const bgTexture = createGradientBackground();
        if (bgTexture) {
            scene.background = bgTexture;
        } else {
            scene.background = new THREE.Color(0x1a1a2e);
        }
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.autoClear = false;
        rendererRef.current = renderer;

        // Scene Atmosphere
        scene.fog = new THREE.FogExp2(0x1a1a2e, 0.02);

        // Orbit controls
        const orbit = new OrbitControls(camera, canvasRef.current);
        orbit.enableDamping = true;
        orbit.dampingFactor = 0.1;
        orbitRef.current = orbit;

        // Transform controls
        const transform = new TransformControls(camera, canvasRef.current);
        transform.addEventListener('dragging-changed', (e) => {
            orbit.enabled = !e.value;
        });

        // Sync transform back to store
        transform.addEventListener('objectChange', () => {
            if (selectedEntityId !== null) {
                const mesh = entityMeshMap.get(selectedEntityId);
                if (mesh) {
                    updateComponent(selectedEntityId, 'Transform', {
                        position: [mesh.position.x, mesh.position.y, mesh.position.z],
                        rotation: [
                            THREE.MathUtils.radToDeg(mesh.rotation.x),
                            THREE.MathUtils.radToDeg(mesh.rotation.y),
                            THREE.MathUtils.radToDeg(mesh.rotation.z)
                        ],
                        scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z]
                    });
                }
            }
        });

        scene.add(transform as unknown as THREE.Object3D);
        transformRef.current = transform;

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambient);

        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(10, 20, 10);
        directional.castShadow = true;
        scene.add(directional);

        // Grid
        const grid = new THREE.GridHelper(20, 20, 0x444466, 0x333355);
        grid.name = 'grid';
        scene.add(grid);

        // Axes
        const axes = new THREE.AxesHelper(5);
        axes.name = 'axes';
        scene.add(axes);

        // Viewport Gizmo Setup
        const gizmoScene = new THREE.Scene();
        const gizmoCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 10);
        gizmoCamera.position.set(0, 0, 5);
        const gizmoAxes = new THREE.AxesHelper(2);
        gizmoScene.add(gizmoAxes);
        gizmoRef.current = { scene: gizmoScene, camera: gizmoCamera };

        // Floor
        const floorGeo = new THREE.PlaneGeometry(20, 20);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x252536 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        floor.name = 'floor';
        scene.add(floor);

        // Resize handler
        const handleResize = () => {
            if (!containerRef.current || !renderer || !camera) return;
            const { clientWidth, clientHeight } = containerRef.current;
            renderer.setSize(clientWidth, clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            camera.aspect = clientWidth / clientHeight;
            camera.updateProjectionMatrix();
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(containerRef.current);
        handleResize();

        // Animation loop
        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            // Manual Clear At Start Of Frame
            renderer.clear();

            // Render main scene
            renderer.setViewport(0, 0, containerRef.current!.clientWidth, containerRef.current!.clientHeight);
            renderer.render(scene, camera);

            // Render Gizmo
            if (gizmoRef.current) {
                const { scene: gScene, camera: gCamera } = gizmoRef.current;
                gCamera.position.copy(camera.position);
                gCamera.position.sub(orbit.target);
                gCamera.position.setLength(5);
                gCamera.lookAt(0, 0, 0);
                
                renderer.clearDepth();
                const gizmoSize = 80;
                renderer.setViewport(10, 10, gizmoSize, gizmoSize);
                renderer.render(gScene, gCamera);
            }
        };
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            resizeObserver.disconnect();
            renderer.dispose();
            entityMeshMap.clear();
        };
    }, []);

    // Sync entities from store to Three.js scene
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        // Get current entity IDs
        const currentIds = new Set<number>();

        const syncEntity = (entityId: number) => {
            const entity = entities.get(entityId);
            if (!entity) return;

            currentIds.add(entityId);

            // Find or create mesh
            let mesh = entityMeshMap.get(entityId);

            const renderComp = entity.components.find(c => c.type === 'Render');
            const transformComp = entity.components.find(c => c.type === 'Transform');

            if (renderComp) {
                if (!mesh) {
                    // Create new mesh
                    mesh = createMeshForEntity(
                        renderComp.data.meshType || 'cube',
                        renderComp.data.color || '#6366f1'
                    );
                    mesh.userData.entityId = entityId;
                    mesh.name = `entity_${entityId}`;
                    scene.add(mesh);
                    entityMeshMap.set(entityId, mesh);
                }

                // Update transform
                if (transformComp && !transformRef.current?.dragging) {
                    const pos = transformComp.data.position || [0, 0, 0];
                    const rot = transformComp.data.rotation || [0, 0, 0];
                    const scl = transformComp.data.scale || [1, 1, 1];

                    mesh.position.set(pos[0], pos[1], pos[2]);
                    mesh.rotation.set(
                        THREE.MathUtils.degToRad(rot[0]),
                        THREE.MathUtils.degToRad(rot[1]),
                        THREE.MathUtils.degToRad(rot[2])
                    );
                    mesh.scale.set(scl[0], scl[1], scl[2]);
                }
            }

            // Sync children
            entity.children.forEach(syncEntity);
        };

        rootEntityIds.forEach(syncEntity);

        // Remove meshes for deleted entities
        entityMeshMap.forEach((mesh, id) => {
            if (!currentIds.has(id)) {
                scene.remove(mesh);
                entityMeshMap.delete(id);
            }
        });

    }, [entities, rootEntityIds]);

    // Handle selection - attach transform controls
    useEffect(() => {
        const transform = transformRef.current;
        if (!transform) return;

        if (selectedEntityId !== null) {
            const mesh = entityMeshMap.get(selectedEntityId);
            if (mesh) {
                transform.attach(mesh);
            } else {
                transform.detach();
            }
        } else {
            transform.detach();
        }
    }, [selectedEntityId, entities]);

    // Update transform mode
    useEffect(() => {
        if (transformRef.current) {
            transformRef.current.setMode(editorMode);
        }
    }, [editorMode]);

    // Toggle grid
    useEffect(() => {
        if (sceneRef.current) {
            const grid = sceneRef.current.getObjectByName('grid');
            if (grid) grid.visible = showGrid;
        }
    }, [showGrid]);

    // Toggle axes
    useEffect(() => {
        if (sceneRef.current) {
            const axes = sceneRef.current.getObjectByName('axes');
            if (axes) axes.visible = showAxes;
        }
    }, [showAxes]);

    // Handle Shading Mode
    useEffect(() => {
        if (!sceneRef.current) return;
        
        sceneRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.name === 'grid' || child.name === 'axes') return;
                
                const material = child.material as THREE.MeshStandardMaterial;
                if (!material) return;

                if (shadingMode === 'wireframe') {
                    material.wireframe = true;
                } else if (shadingMode === 'solid') {
                    material.wireframe = false;
                    material.flatShading = true;
                    material.needsUpdate = true;
                } else {
                    material.wireframe = false;
                    material.flatShading = false;
                    material.needsUpdate = true;
                }
            }
        });
    }, [shadingMode, entities]);

    // Click to select entity
    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        const camera = cameraRef.current;
        const scene = sceneRef.current;

        if (!container || !camera || !scene) return;

        // Don't pick if clicking on gizmo
        if (transformRef.current?.dragging) return;

        const rect = container.getBoundingClientRect();
        mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(mouseRef.current, camera);

        // Get pickable objects (entity meshes only)
        const pickable: THREE.Object3D[] = [];
        entityMeshMap.forEach(mesh => pickable.push(mesh));

        const intersects = raycasterRef.current.intersectObjects(pickable, true);

        if (intersects.length > 0) {
            // Find entity ID from hit object
            let obj: THREE.Object3D | null = intersects[0].object;
            while (obj) {
                if (obj.userData.entityId !== undefined) {
                    selectEntity(obj.userData.entityId);
                    return;
                }
                obj = obj.parent;
            }
        } else {
            // Click on empty space - deselect
            selectEntity(null);
        }
    }, [selectEntity]);

    return (
        <div 
            className={`viewport-panel editor-panel ${activePanelId === 'viewport' ? 'active-panel' : ''} ${isPlaying ? 'is-playing' : ''}`}
            ref={containerRef} 
            onClick={(e) => {
                setActivePanel('viewport');
                handleClick(e);
            }}
        >
            <canvas ref={canvasRef} className="viewport-canvas" />
            
            {/* Elite Design: Inset shadow for depth */}
            <div className="viewport-inset-shadow" />

            <div className="viewport-overlay">
                <ViewportToolbar />
                
                <div className="viewport-scene-stats">
                    <div className="stats-item">
                        <Activity size={12} />
                        <span>60 FPS</span>
                    </div>
                    <div className="stats-item">
                        <Layers size={12} />
                        <span>{entities.size} Entities</span>
                    </div>
                    {selectedEntityId !== null && (
                        <div className="stats-item highlight">
                            <MousePointer2 size={12} />
                            <span>Entity #{selectedEntityId} Selected</span>
                        </div>
                    )}
                </div>

                <div className="viewport-info">
                    {isPlaying && (
                        <div className="live-status">
                            <div className="live-dot" />
                            <span className="live-text">LIVE</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
