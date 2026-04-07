// @ts-expect-error: Vite HMR meta types are not globally declared but exist at runtime.
if (import.meta.hot) { import.meta.hot.accept(() => { /* No-op to avoid loop */ }); }

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { 
    Application, 
    RenderSystem, 
    EditorCameraSystem, 
    EditorGridSystem, 
    SelectionGizmoSystem,
    SceneSyncSystem,
    OceanSystem,
    ParticleSystem,
    WeatherSystem,
    AudioSystem,
    InputSystem,
    PostProcessingSystem,
    LightSystem,
    LightGizmoSystem,
    UISystem
} from '@engine';
import { useEditorStore } from '@infrastructure/store';
import { ViewportToolbar } from '@ui/editor/ViewportToolbar';
import { StatusBar } from './StatusBar';
import { VibeIcons } from '@ui/common/VibeIcons';
import { usePlayModeStore } from '@presentation/features/editor/core';
import { motion, AnimatePresence } from 'framer-motion';
import { viewportStyles as styles, viewportAnimations } from './ViewportPanel.styles';

export const ViewportPanel: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<Application | null>(null);

    const { 
        showGrid, selectEntity, clearSelection,
        activePanelId, setActivePanel, shadingMode
    } = useEditorStore();

    const { isPlaying } = usePlayModeStore();

    const [perf, setPerf] = React.useState({ fps: 0, mem: 0, fov: 75 });

    // Initialize Engine (Unity-Style)
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const app = new Application(canvasRef.current, {
            antialias: true,
            backgroundColor: 0x0f0f1a // Sovereign Dark Base
        });

        // Add Core & Editor Systems
        app.addSystem(new RenderSystem());
        app.addSystem(new SceneSyncSystem()); // Bridge Store -> Engine
        app.addSystem(new EditorCameraSystem());
        app.addSystem(new EditorGridSystem());
        app.addSystem(new OceanSystem());
        app.addSystem(new ParticleSystem());
        app.addSystem(new WeatherSystem());
        app.addSystem(new InputSystem());
        app.addSystem(new AudioSystem());
        app.addSystem(new PostProcessingSystem());
        app.addSystem(new LightSystem());
        app.addSystem(new LightGizmoSystem());
        app.addSystem(new UISystem());
        app.addSystem(new SelectionGizmoSystem());

        app.start();
        appRef.current = app;

        // HUD Data - Update every frame
        let frameId: number;
        const updatePerf = () => {
            if (appRef.current) {
                const fps = Math.round(appRef.current.fps);
                const memInfo = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
                const mem = memInfo ? Math.round(memInfo.usedJSHeapSize / 1048576) : 0;
                const fov = Math.round(appRef.current.camera.fov);
                setPerf({ fps, mem, fov });
                (window as unknown as Record<string, number>).VibeFPS = fps;
            }
            frameId = requestAnimationFrame(updatePerf);
        };
        updatePerf();

        // Resize Handling
        const resizeObserver = new ResizeObserver(() => {
            if (containerRef.current && appRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                appRef.current.renderer.setSize(clientWidth, clientHeight);
                appRef.current.composer.setSize(clientWidth, clientHeight); // Sync composer
                appRef.current.camera.aspect = clientWidth / clientHeight;
                appRef.current.camera.updateProjectionMatrix();
            }
        });
        resizeObserver.observe(containerRef.current);

        return () => {
            cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
            app.destroy();
            appRef.current = null;
        };
    }, []); // Only once per mount

    // Sync Editor State to Systems
    useEffect(() => {
        const app = appRef.current;
        if (!app) return;

        const gridSystem = app.getSystem(EditorGridSystem);
        if (gridSystem) gridSystem.setVisible(showGrid && !isPlaying);

        // Control Post-Processing
        app.bloomPass.enabled = useEditorStore.getState().showBloom;
        
        // Control Environment
        if (useEditorStore.getState().showEnvironment) {
            app.threeScene.background = new THREE.Color(0x0a0a0f); // Deep Space
            app.renderer.toneMappingExposure = 1.2;
        } else {
            app.threeScene.background = new THREE.Color(0x0f0f1a);
            app.renderer.toneMappingExposure = 1.0;
        }

        // Disable editor systems during play mode
        const cameraSystem = app.getSystem(EditorCameraSystem);
        const selectionSystem = app.getSystem(SelectionGizmoSystem);
        
        if (cameraSystem) cameraSystem.enabled = !isPlaying;
        if (selectionSystem) selectionSystem.enabled = !isPlaying;

        // Update wireframe mode globally
        app.threeScene.traverse((obj) => {
            if (obj instanceof THREE.Mesh && obj.material) {
                const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
                materials.forEach(m => { m.wireframe = shadingMode === 'wireframe'; });
            }
        });
    }, [showGrid, shadingMode, isPlaying, useEditorStore.getState().showBloom, useEditorStore.getState().showEnvironment]);

    // Selection Raycasting
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (isPlaying) return;
        
        const app = appRef.current;
        if (!app || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), app.camera);

        // Filter valid pickable meshes (ignore helpers)
        const intersects = raycaster.intersectObjects(app.threeScene.children, true);
        
        if (intersects.length > 0) {
            const first = intersects[0].object;
            // Traverse up to find Entity tag
            let current: THREE.Object3D | null = first;
            while(current) {
                if (current.userData.entityId !== undefined) {
                    selectEntity(current.userData.entityId);
                    return;
                }
                current = current.parent;
            }
        }
        
        clearSelection();
    }, [selectEntity, clearSelection, isPlaying]);

    return (
        <div 
            ref={containerRef} 
            className={`viewport-panel ${activePanelId === 'viewport' ? 'active-panel' : ''}`}
            style={{ ...styles.panel, flex: 1 }}
            onClick={(e) => {
                setActivePanel('viewport');
                handleClick(e);
            }}
        >
            <style dangerouslySetInnerHTML={{ __html: viewportAnimations }} />
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            
            <div style={{ ...styles.overlay, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                <div style={styles.watermark}>VibeEngine Sovereign Elite</div>

                <div style={styles.cameraInfo}>
                    <div style={styles.cameraBadge}>
                        <VibeIcons name="Video" size={10} />
                        <span>{perf.fov}° FOV</span>
                    </div>
                </div>

                <AnimatePresence>
                    {isPlaying && (
                        <motion.div 
                            key="live-indicator"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            style={styles.liveBadge}
                        >
                            <div style={{ ...styles.liveDot, animation: 'live-pulse 2s infinite' }} />
                            <span style={styles.liveText}>Live Simulation</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <div style={{ pointerEvents: 'auto' }}>
                    <ViewportToolbar />
                </div>

                <div style={styles.performanceHud}>
                    <div style={styles.performanceItem}>
                        <span>MEM</span>
                        <span style={styles.performanceValue}>{ perf.mem || 0 } MB</span>
                    </div>
                </div>

                <div style={{ pointerEvents: 'auto' }}>
                    <StatusBar />
                </div>
            </div>
        </div>
    );
};

export default ViewportPanel;