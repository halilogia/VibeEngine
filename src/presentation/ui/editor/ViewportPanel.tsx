/**
 * ViewportPanel (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useEditorStore, useSceneStore, useProjectStore } from '@infrastructure/store';
import { ViewportToolbar } from '@ui/editor/ViewportToolbar';
import { StatusBar } from './StatusBar';
import { usePlayModeStore } from '@presentation/features/editor/core';
import { motion, AnimatePresence } from 'framer-motion';
import { viewportStyles as styles, viewportAnimations } from './ViewportPanel.styles';

// Map editor entity IDs to Three.js objects
const entityMeshMap = new Map<number, THREE.Object3D>();

function disposeObject(obj: THREE.Object3D) {
    obj.traverse((node) => {
        if (node instanceof THREE.Mesh) {
            if (node.geometry) node.geometry.dispose();
            if (node.material) {
                const materials = Array.isArray(node.material) ? node.material : [node.material];
                materials.forEach(m => m.dispose());
            }
        }
    });
}

const modelLoader = new GLTFLoader();
const modelCache = new Map<string, THREE.Group>();

function createMeshForEntity(meshType: string, color: string, modelPath?: string, entityId?: number, onModelLoaded?: (group: THREE.Group) => void, hasWorkspace?: boolean): THREE.Object3D {
    if (meshType === 'model' && modelPath) {
        const group = new THREE.Group();
        group.name = 'placeholder';
        // Add a placeholder box while loading
        const placeholder = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({ color, wireframe: true, transparent: true, opacity: 0 })
        );
        placeholder.visible = false;
        group.add(placeholder);

        // Load model
        let fullPath = modelPath;
        if (hasWorkspace && !fullPath.startsWith('vibe-asset://') && !fullPath.startsWith('http')) {
            const cleanPath = modelPath.startsWith('/') ? modelPath.slice(1) : modelPath;
            fullPath = `vibe-asset://${cleanPath}`;
        } else if (!fullPath.startsWith('vibe-asset://') && !fullPath.startsWith('http')) {
            fullPath = modelPath.startsWith('/') ? modelPath : `/${modelPath}`;
        }
        
        if (modelCache.has(fullPath)) {
            const cached = modelCache.get(fullPath)!;
            const model = cached.clone();
            onModelLoaded?.(model);
            return model;
        }

        modelLoader.load(fullPath, (gltf) => {
            const model = gltf.scene;
            model.traverse((node) => {
                if (node instanceof THREE.Mesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            modelCache.set(fullPath, model);
            onModelLoaded?.(model.clone());
        }, undefined, (error) => {
            console.error(`Error loading model at ${fullPath}:`, error);
        });

        return group;
    }

    let geometry: THREE.BufferGeometry;
    switch (meshType) {
        case 'sphere': geometry = new THREE.SphereGeometry(0.5, 16, 16); break;
        case 'cylinder': geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16); break;
        case 'plane': geometry = new THREE.PlaneGeometry(1, 1); break;
        case 'capsule': geometry = new THREE.CapsuleGeometry(0.3, 0.5, 4, 8); break;
        case 'group': return new THREE.Group();
        case 'cube':
        default: geometry = new THREE.BoxGeometry(1, 1, 1);
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
    const composerRef = useRef<EffectComposer | null>(null);
    const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
    const [fps, setFps] = useState(60);

    const { 
        editorMode, showGrid, showAxes, selectedEntityId, selectEntity,
        activePanelId, setActivePanel, shadingMode, showBloom, showEnvironment 
    } = useEditorStore();

    const { isPlaying } = usePlayModeStore();
    const { entities, rootEntityIds, updateComponent } = useSceneStore();
    const { launchedProject } = useProjectStore();

    const createGradientBackground = () => {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const context = canvas.getContext('2d');
        if (!context) return null;
        const gradient = context.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, '#0f0f1a');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#2c2c4d');
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    };

    // 🟢 REACTIVE VIEWPORT CONTROLS
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;
        const grid = scene.getObjectByName('grid');
        if (grid) grid.visible = showGrid;
        const axes = scene.getObjectByName('axes');
        if (axes) axes.visible = showAxes;
        const ambient = scene.getObjectByName('ambientLight');
        if (ambient) ambient.visible = showEnvironment;
        const dir = scene.getObjectByName('directionalLight');
        if (dir) dir.visible = showEnvironment;
    }, [showGrid, showAxes, showEnvironment]);

    // 🟢 REACTIVE SHADING MODE
    useEffect(() => {
        sceneRef.current?.traverse((obj) => {
            if (obj instanceof THREE.Mesh && obj.material) {
                const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
                materials.forEach(m => { m.wireframe = shadingMode === 'wireframe'; });
            }
        });
    }, [shadingMode, entities]); 

    // 🟢 REACTIVE BLOOM
    useEffect(() => {
        const composer = composerRef.current;
        if (!composer) return;
        const bloomPass = composer.passes[1] as any;
        if (bloomPass) bloomPass.enabled = showBloom;
    }, [showBloom]);

    // 🔵 MAIN SETUP EFFECT
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const scene = new THREE.Scene();
        const bgTexture = createGradientBackground();
        scene.background = bgTexture || new THREE.Color(0x1a1a2e);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 5000); // 🏛️ Elite Far Plane
        camera.position.set(150, 150, 150);
        camera.lookAt(0, 0, -200);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ 
            canvas: canvasRef.current, 
            antialias: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
        });
        renderer.shadowMap.enabled = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        rendererRef.current = renderer;

        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        
        // 🏛️ Recalibrated Sovereign Bloom: Prevents over-exposure and gizmo glow
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight), 
            0.15, // Strength: Minimal radiance
            0.1,  // Radius: Tight dispersion
            0.95   // Threshold: Only high-luminance peaks glow
        );
        composer.addPass(bloomPass);
        composer.addPass(new OutputPass());
        composerRef.current = composer;

        const orbit = new OrbitControls(camera, canvasRef.current);
        orbit.enableDamping = true;
        orbit.target.set(0, 0, -100); // 🎯 Center of MobRunner track
        orbit.update();
        orbitRef.current = orbit;

        const transform = new TransformControls(camera, canvasRef.current);
        transform.addEventListener('dragging-changed', (e) => orbit.enabled = !e.value);
        transform.addEventListener('objectChange', () => {
            if (selectedEntityId !== null) {
                const mesh = entityMeshMap.get(selectedEntityId);
                if (mesh) {
                    updateComponent(selectedEntityId, 'Transform', {
                        position: [mesh.position.x, mesh.position.y, mesh.position.z],
                        rotation: [THREE.MathUtils.radToDeg(mesh.rotation.x), THREE.MathUtils.radToDeg(mesh.rotation.y), THREE.MathUtils.radToDeg(mesh.rotation.z)],
                        scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z]
                    });
                }
            }
        });
        scene.add(transform as any);
        transformRef.current = transform;

        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        ambient.name = 'ambientLight';
        scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.name = 'directionalLight';
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        scene.add(dirLight);

        const grid = new THREE.GridHelper(20, 20, 0x444466, 0x333355);
        grid.name = 'grid';
        scene.add(grid);

        const axes = new THREE.AxesHelper(5);
        axes.name = 'axes';
        scene.add(axes);

        let needsResize = false;
        const handleResize = () => { needsResize = true; };
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(containerRef.current);
        needsResize = true; // Initial trigger

        let animationId: number;
        let lastTime = performance.now();
        let frames = 0;

        const animate = () => {
            animationId = requestAnimationFrame(animate);

            // 🛠️ Optimized Resize: Sync with Animation Loop to prevent layout-thrashing
            if (needsResize && containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                if (clientWidth > 0 && clientHeight > 0) {
                    renderer.setSize(clientWidth, clientHeight, false);
                    composer.setSize(clientWidth, clientHeight);
                    camera.aspect = clientWidth / clientHeight;
                    camera.updateProjectionMatrix();
                    
                    // Stabilize Bloom Pass
                    const bloom = composer.passes[1] as any;
                    if (bloom && bloom.resolution) {
                        bloom.resolution.set(clientWidth, clientHeight);
                    }
                }
                needsResize = false;
            }

            // 🛡️ Guard: Prevent rendering on empty framebuffers
            if (!containerRef.current || containerRef.current.clientWidth === 0 || containerRef.current.clientHeight === 0) {
                return;
            }

            // 🔴 Real-time FPS Calculation
            frames++;
            const currentTime = performance.now();
            if (currentTime >= lastTime + 1000) {
                const currentFps = Math.round((frames * 1000) / (currentTime - lastTime));
                (window as any).VibeFPS = currentFps;
                frames = 0;
                lastTime = currentTime;
            }

            orbit.update();
            composer.render();
        };
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            resizeObserver.disconnect();
            
            // 🧹 Elite Cleanup: Deep Dispose
            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current.forceContextLoss();
            }
            if (sceneRef.current) disposeObject(sceneRef.current);
            if (orbitRef.current) orbitRef.current.dispose();
            if (transformRef.current) transformRef.current.dispose();
            if (composerRef.current) {
                composerRef.current.passes.forEach(pass => {
                    if ((pass as any).dispose) (pass as any).dispose();
                });
            }
            
            entityMeshMap.clear();
            rendererRef.current = null;
            sceneRef.current = null;
            cameraRef.current = null;
            orbitRef.current = null;
            transformRef.current = null;
            composerRef.current = null;
        };
    }, []);

    // Sync entities to Three.js
    // Sync entities to Three.js with Hierarchy support
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;
        const currentIds = new Set<number>();

        const syncEntity = (id: number, parentObject: THREE.Object3D) => {
            const entity = entities.get(id);
            if (!entity) return;
            currentIds.add(id);

            let mesh = entityMeshMap.get(id);
            const render = entity.components.find(c => c.type === 'Render');
            const transform = entity.components.find(c => c.type === 'Transform');

            if (render || entity.children.length > 0) {
                if (!mesh) {
                    const onModelLoaded = (loadedGroup: THREE.Group) => {
                        // 🧹 Elite Deep Clean: Find and delete ANY previous instances for this ID
                        const existing = entityMeshMap.get(id);
                        if (existing) {
                            existing.traverse((node: any) => {
                                if (node.geometry) node.geometry.dispose();
                                if (node.material) {
                                    const mats = Array.isArray(node.material) ? node.material : [node.material];
                                    mats.forEach((m: any) => m.dispose());
                                }
                            });
                            existing.parent?.remove(existing);
                        }
                        
                        loadedGroup.userData.entityId = id;
                        loadedGroup.userData.isModel = true;
                        
                        // Add to current parent (Scene or Parent Object)
                        const currentEntity = entities.get(id);
                        const parentId = currentEntity?.parentId;
                        const parentContainer = parentId !== null && parentId !== undefined ? entityMeshMap.get(parentId) : scene;
                        
                        if (parentContainer) {
                            parentContainer.add(loadedGroup);
                        } else {
                            scene.add(loadedGroup);
                        }
                        
                        entityMeshMap.set(id, loadedGroup);
                        
                        // Force sync transform
                        const t = entities.get(id)?.components.find(c => c.type === 'Transform');
                        if (t) {
                            const p = t.data.position || [0,0,0], r = t.data.rotation || [0,0,0], s = t.data.scale || [1,1,1];
                            loadedGroup.position.set(p[0], p[1], p[2]);
                            loadedGroup.rotation.set(THREE.MathUtils.degToRad(r[0]), THREE.MathUtils.degToRad(r[1]), THREE.MathUtils.degToRad(r[2]));
                            loadedGroup.scale.set(s[0], s[1], s[2]);
                        }
                    };

                    mesh = createMeshForEntity(
                        render?.data.meshType || (entity.children.length > 0 ? 'group' : 'cube'), 
                        render?.data.color || '#6366f1', 
                        render?.data.modelPath,
                        id,
                        onModelLoaded,
                        !!launchedProject
                    );
                    mesh.userData.entityId = id;
                    parentObject.add(mesh);
                    entityMeshMap.set(id, mesh);
                }

                // Ensure it's attached to the right parent if hierarchy changed
                if (mesh.parent !== parentObject) {
                    parentObject.add(mesh);
                }

                if (transform && !transformRef.current?.dragging) {
                    const p = transform.data.position || [0,0,0], r = transform.data.rotation || [0,0,0], s = transform.data.scale || [1,1,1];
                    mesh.position.set(p[0], p[1], p[2]);
                    mesh.rotation.set(THREE.MathUtils.degToRad(r[0]), THREE.MathUtils.degToRad(r[1]), THREE.MathUtils.degToRad(r[2]));
                    mesh.scale.set(s[0], s[1], s[2]);
                }
            }

            // Recurse children
            entity.children.forEach(childId => syncEntity(childId, mesh || parentObject));
        };

        rootEntityIds.forEach(id => syncEntity(id, scene));

        // Cleanup removed entities
        entityMeshMap.forEach((m, id) => { 
            if (!currentIds.has(id)) { 
                m.parent?.remove(m); 
                entityMeshMap.delete(id); 
            } 
        });
    }, [entities, rootEntityIds]);

    // REACTIVE GIZMO
    useEffect(() => {
        const controls = transformRef.current;
        if (!controls) return;
        const mesh = selectedEntityId !== null ? entityMeshMap.get(selectedEntityId) : null;
        if (mesh) {
            controls.attach(mesh);
            const mode = editorMode === 'translate' ? 'translate' : editorMode === 'rotate' ? 'rotate' : 'scale';
            controls.setMode(mode as any);
        } else {
            controls.detach();
        }
    }, [selectedEntityId, entities, editorMode]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!containerRef.current || !cameraRef.current || !sceneRef.current || transformRef.current?.dragging) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const pickable: THREE.Object3D[] = [];
        entityMeshMap.forEach(m => pickable.push(m));
        const intersects = raycasterRef.current.intersectObjects(pickable, true);
        if (intersects.length > 0) {
            let obj: any = intersects[0].object;
            while (obj) {
                if (obj.userData.entityId !== undefined) { selectEntity(obj.userData.entityId); return; }
                obj = obj.parent;
            }
        } else { selectEntity(null); }
    }, [selectEntity]);

    return (
        <div 
            className={`viewport-panel editor-panel ${activePanelId === 'viewport' ? 'active-panel' : ''}`}
            ref={containerRef} 
            onClick={(e) => { setActivePanel('viewport'); handleClick(e); }}
            style={styles.panel}
        >
            <style dangerouslySetInnerHTML={{ __html: viewportAnimations }} />
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            
            <div style={styles.overlay}>
                <AnimatePresence>
                    {isPlaying && (
                        <motion.div 
                            key="live-indicator"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            style={styles.liveBadge}
                        >
                            <div style={{ ...styles.liveDot, animation: 'live-pulse 2s infinite' }} />
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <ViewportToolbar />
                <StatusBar />
                
                {/* Viewport is now completely clean - Sovereign Elite Standard */}
                {/* Viewport content is now completely clean of HUD elements */}
            </div>
        </div>
    );
};
