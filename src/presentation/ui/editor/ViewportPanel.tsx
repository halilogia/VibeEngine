/**
 * ViewportPanel (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { useEditorStore, useSceneStore } from '@infrastructure/store';
import { VibeIcons } from '@ui/common/VibeIcons';
import { ViewportToolbar } from '@ui/editor/ViewportToolbar';
import { viewportStyles as styles, viewportAnimations } from './ViewportPanel.styles';

// Map editor entity IDs to Three.js objects
const entityMeshMap = new Map<number, THREE.Object3D>();

/**
 * createMeshForEntity - Utility to generate Three.js primitives.
 * 
 * @param meshType - Type of geometry to create (cube, sphere, etc.)
 * @param color - Hex color string for the material
 * @returns A fully configured THREE.Mesh with shadow support
 */
function createMeshForEntity(meshType: string, color: string): THREE.Mesh {
    let geometry: THREE.BufferGeometry;
    switch (meshType) {
        case 'sphere': geometry = new THREE.SphereGeometry(0.5, 16, 16); break;
        case 'cylinder': geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16); break;
        case 'plane': geometry = new THREE.PlaneGeometry(1, 1); break;
        case 'capsule': geometry = new THREE.CapsuleGeometry(0.3, 0.5, 4, 8); break;
        case 'cube':
        default: geometry = new THREE.BoxGeometry(1, 1, 1);
    }
    const material = new THREE.MeshStandardMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

/**
 * ViewportPanel - The 3D visual gateway of the VibeEngine Studio.
 * 🏛️⚛️💎🚀
 * 
 * Manages the Three.js render loop, camera controls, post-processing (Bloom),
 * and interactive object selection via Raycasting. Synchronizes the 
 * Editor state with the actual 3D scene.
 */
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
    const gizmoRef = useRef<{ scene: THREE.Scene, camera: THREE.PerspectiveCamera } | null>(null);

    const { 
        editorMode, showGrid, showAxes, isPlaying, selectedEntityId, selectEntity,
        activePanelId, setActivePanel, shadingMode, showBloom, showEnvironment 
    } = useEditorStore();

    const { entities, rootEntityIds, updateComponent } = useSceneStore();

    // Background Gradient Helper
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

    // Setup Three.js scene
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const scene = new THREE.Scene();
        const bgTexture = createGradientBackground();
        scene.background = bgTexture || new THREE.Color(0x1a1a2e);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
        camera.position.set(10, 10, 10);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
        renderer.shadowMap.enabled = true;
        rendererRef.current = renderer;

        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(1024,1024), 0.5, 0.4, 0.85);
        composer.addPass(bloomPass);
        composer.addPass(new OutputPass());
        composerRef.current = composer;

        const orbit = new OrbitControls(camera, canvasRef.current);
        orbit.enableDamping = true;
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

        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        scene.add(dirLight);

        const grid = new THREE.GridHelper(20, 20, 0x444466, 0x333355);
        grid.name = 'grid';
        scene.add(grid);

        const axes = new THREE.AxesHelper(5);
        axes.name = 'axes';
        scene.add(axes);

        const handleResize = () => {
            if (!containerRef.current || !renderer || !camera) return;
            const { clientWidth, clientHeight } = containerRef.current;
            renderer.setSize(clientWidth, clientHeight);
            composer.setSize(clientWidth, clientHeight);
            camera.aspect = clientWidth / clientHeight;
            camera.updateProjectionMatrix();
        };
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(containerRef.current);
        handleResize();

        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            orbit.update();
            renderer.clear();
            composer.render();
        };
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            resizeObserver.disconnect();
            renderer.dispose();
            entityMeshMap.clear();
        };
    }, []);

    // Sync entities to Three.js
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;
        const currentIds = new Set<number>();
        const syncEntity = (id: number) => {
            const entity = entities.get(id);
            if (!entity) return;
            currentIds.add(id);
            let mesh = entityMeshMap.get(id);
            const render = entity.components.find(c => c.type === 'Render');
            const transform = entity.components.find(c => c.type === 'Transform');
            if (render) {
                if (!mesh) {
                    mesh = createMeshForEntity(render.data.meshType || 'cube', render.data.color || '#6366f1');
                    mesh.userData.entityId = id;
                    scene.add(mesh);
                    entityMeshMap.set(id, mesh);
                }
                if (transform && !transformRef.current?.dragging) {
                    const p = transform.data.position || [0,0,0], r = transform.data.rotation || [0,0,0], s = transform.data.scale || [1,1,1];
                    mesh.position.set(p[0], p[1], p[2]);
                    mesh.rotation.set(THREE.MathUtils.degToRad(r[0]), THREE.MathUtils.degToRad(r[1]), THREE.MathUtils.degToRad(r[2]));
                    mesh.scale.set(s[0], s[1], s[2]);
                }
            }
            entity.children.forEach(syncEntity);
        };
        rootEntityIds.forEach(syncEntity);
        entityMeshMap.forEach((m, id) => { if (!currentIds.has(id)) { scene.remove(m); entityMeshMap.delete(id); } });
    }, [entities, rootEntityIds]);

    // 🟢 REACTIVE GIZMO ATTACH/DETACH (RESTORED & STRENGTHENED)
    useEffect(() => {
        const controls = transformRef.current;
        if (!controls) return;
        
        const mesh = selectedEntityId !== null ? entityMeshMap.get(selectedEntityId) : null;
        
        if (mesh) {
            console.debug(`[VibeEngine] Attaching gizmo to entity: ${selectedEntityId}`);
            controls.attach(mesh);
            // Ensure mode is correct upon attachment
            const mode = editorMode === 'translate' ? 'translate' : 
                         editorMode === 'rotate' ? 'rotate' : 'scale';
            controls.setMode(mode as any);
        } else {
            console.debug(`[VibeEngine] Detaching gizmo (no selection)`);
            controls.detach();
        }
    }, [selectedEntityId, entities, editorMode]); // Depend on entities too if they change

    // 🟢 REACTIVE GIZMO MODE UPDATE
    useEffect(() => {
        const controls = transformRef.current;
        if (!controls) return;
        const mode = editorMode === 'translate' ? 'translate' : 
                     editorMode === 'rotate' ? 'rotate' : 'scale';
        controls.setMode(mode as any);
    }, [editorMode]);

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
                <ViewportToolbar />
                
                <div style={styles.stats}>
                    <div style={styles.statsItem}>
                        <VibeIcons name="Activity" size={12} />
                        <span>60 FPS</span>
                    </div>
                    <div style={styles.statsItem}>
                        <VibeIcons name="Layers" size={12} />
                        <span>{entities.size} Entities</span>
                    </div>
                    {selectedEntityId !== null && (
                        <div style={{ ...styles.statsItem, ...styles.statsHighlight }}>
                            <VibeIcons name="Cursor" size={12} />
                            <span>Entity #{selectedEntityId} Selected</span>
                        </div>
                    )}
                </div>

                {isPlaying && (
                    <div style={styles.liveBadge}>
                        <div style={{ ...styles.liveDot, animation: 'live-pulse 1.5s infinite' }} />
                        <span style={styles.liveText}>LIVE</span>
                    </div>
                )}
            </div>
        </div>
    );
};
