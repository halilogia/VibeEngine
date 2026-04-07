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
    SceneSyncSystem
} from '@engine';
import { useEditorStore } from '@infrastructure/store';
import { ViewportToolbar } from '@ui/editor/ViewportToolbar';
import { StatusBar } from './StatusBar';
import { usePlayModeStore } from '@presentation/features/editor/core';
import { motion, AnimatePresence } from 'framer-motion';
import { viewportStyles as styles, viewportAnimations } from './ViewportPanel.styles';

export const ViewportPanel: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<Application | null>(null);

    const { 
        showGrid, selectEntity,
        activePanelId, setActivePanel, shadingMode
    } = useEditorStore();

    const { isPlaying } = usePlayModeStore();

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
        app.addSystem(new SelectionGizmoSystem());

        app.start();
        appRef.current = app;

        // FPS Counter - Update window.VibeFPS every frame
        const updateFPS = () => {
            if (appRef.current) {
                (window as unknown as Record<string, unknown>).VibeFPS = Math.round(appRef.current.fps);
            }
            requestAnimationFrame(updateFPS);
        };
        updateFPS();

        // Resize Handling
        const resizeObserver = new ResizeObserver(() => {
            if (containerRef.current && appRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                appRef.current.renderer.setSize(clientWidth, clientHeight);
                appRef.current.camera.aspect = clientWidth / clientHeight;
                appRef.current.camera.updateProjectionMatrix();
            }
        });
        resizeObserver.observe(containerRef.current);

        return () => {
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
    }, [showGrid, shadingMode, isPlaying]);

    // Selection Raycasting
    const handleClick = useCallback((e: React.MouseEvent) => {
        const app = appRef.current;
        if (!app || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, app.camera);

        const pickable: THREE.Object3D[] = [];
        app.threeScene.traverse(obj => {
            if (obj instanceof THREE.Mesh && !obj.userData.isHelper) {
                pickable.push(obj);
            }
        });

        const intersects = raycaster.intersectObjects(pickable, true);
        if (intersects.length > 0) {
            let obj: THREE.Object3D | null = intersects[0].object;
            while (obj) {
                if (obj.userData.entityId !== undefined) {
                    selectEntity(obj.userData.entityId);
                    return;
                }
                obj = obj.parent;
            }
        } else {
            selectEntity(null);
        }
    }, [selectEntity]);

    return (
        <div 
            className={`viewport-panel editor-panel ${activePanelId === 'viewport' ? 'active-panel' : ''}`}
            ref={containerRef} 
            onClick={(e) => { setActivePanel('viewport'); handleClick(e); }}
            style={{ ...styles.panel, position: 'relative' }}
        >
            <style dangerouslySetInnerHTML={{ __html: viewportAnimations }} />
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            
            <div style={{ ...styles.overlay, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
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
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <div style={{ pointerEvents: 'auto' }}>
                    <ViewportToolbar />
                </div>
                <div style={{ pointerEvents: 'auto' }}>
                    <StatusBar />
                </div>
            </div>
        </div>
    );
};

export default ViewportPanel;