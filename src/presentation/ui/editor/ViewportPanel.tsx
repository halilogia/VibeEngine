// @ts-expect-error: Vite HMR meta types are not globally declared but exist at runtime.
if (import.meta.hot) { import.meta.hot.accept(() => { /* No-op to avoid loop */ }); }

import React, { useRef, useEffect, useCallback, useState } from 'react';
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
    UISystem,
    PhysicsSystem,
    FollowCameraSystem,
    VehicleSystem,
    RaceSystem
} from '@engine';
import { useEditorStore } from '@infrastructure/store';
import { ViewportToolbar } from '@ui/editor/ViewportToolbar';
import { StatusBar } from './StatusBar';
import { usePlayModeStore } from '@presentation/features/editor/core';
import { motion, AnimatePresence } from 'framer-motion';
import { viewportStyles as styles, viewportAnimations } from './ViewportPanel.styles';
import { RaceHUD } from './RaceHUD';

export const ViewportPanel: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<Application | null>(null);

    const { 
        showGrid, selectEntity, clearSelection, selectedEntityId,
        activePanelId, setActivePanel, shadingMode, isViewportMaximized
    } = useEditorStore();

    const { isPlaying, isPaused } = usePlayModeStore();

    const [selectedEntityName, setSelectedEntityName] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);

    // Initialize Engine (Sovereign Elite Standard)
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const { clientWidth, clientHeight } = containerRef.current;
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;

        const app = new Application(canvasRef.current, {
            antialias: false, // Using FXAA in post-processing
            backgroundColor: 0x0f0f1a // Sovereign Dark Base
        });
        
        // Initial setup
        app.renderer.setSize(clientWidth, clientHeight);
        app.composer.setSize(clientWidth, clientHeight);
        app.camera.aspect = clientWidth / clientHeight;
        app.camera.updateProjectionMatrix();

        // Add Core & Editor Systems
        app.addSystem(new PhysicsSystem()); // Priority: 10 (Initialize RAPIER)
        app.addSystem(new RenderSystem()); // Priority: 99
        app.addSystem(new SceneSyncSystem()); // Priority: -1000
        app.addSystem(new EditorCameraSystem());
        app.addSystem(new FollowCameraSystem()); // Priority: 200
        app.addSystem(new VehicleSystem()); // Priority: 50
        app.addSystem(new RaceSystem()); // Priority: 60
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

        // Focus handling
        const handleFocus = () => setIsFocused(true);
        const handleBlur = () => setIsFocused(false);
        const handleMouseEnter = () => canvasRef.current?.focus();

        canvasRef.current.addEventListener('focus', handleFocus);
        canvasRef.current.addEventListener('blur', handleBlur);
        containerRef.current.addEventListener('mouseenter', handleMouseEnter);

        // ⏱️ Elite FPS Tracker for StatusBar
        let lastTime = performance.now();
        let frames = 0;
        const updateFPS = () => {
            frames++;
            const now = performance.now();
            if (now >= lastTime + 1000) {
                (window as unknown as { VibeFPS?: number }).VibeFPS = frames;
                frames = 0;
                lastTime = now;
            }
            if (appRef.current) {
                requestAnimationFrame(updateFPS);
            }
        };
        requestAnimationFrame(updateFPS);

        // Resize Handling with Debounce
        const resizeObserver = new ResizeObserver((entries) => {
            if (!containerRef.current || !appRef.current) return;
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    appRef.current.onResize(width, height);
                }
            }
        });
        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            if (canvasRef.current) {
                canvasRef.current.removeEventListener('focus', handleFocus);
                canvasRef.current.removeEventListener('blur', handleBlur);
            }
            if (containerRef.current) {
                containerRef.current.removeEventListener('mouseenter', handleMouseEnter);
            }
            app.destroy();
            appRef.current = null;
        };
    }, []);

    // Sync Editor State
    useEffect(() => {
        const app = appRef.current;
        if (!app) return;

        const gridSystem = app.getSystem(EditorGridSystem);
        if (gridSystem) gridSystem.setVisible(showGrid && !isPlaying);

        // Environment Sync
        const isEnvActive = useEditorStore.getState().showEnvironment;
        app.threeScene.background = new THREE.Color(isEnvActive ? 0x0a0a0f : 0x0f0f1a);
        app.renderer.toneMappingExposure = isEnvActive ? 1.2 : 1.0;

        // Mode Sync
        const cameraSystem = app.getSystem(EditorCameraSystem);
        const selectionSystem = app.getSystem(SelectionGizmoSystem);
        
        if (cameraSystem) cameraSystem.enabled = !isPlaying;
        if (selectionSystem) selectionSystem.enabled = !isPlaying;

        // Shading Sync
        app.threeScene.traverse((obj) => {
            if (obj instanceof THREE.Mesh && obj.material) {
                const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
                materials.forEach(m => { m.wireframe = shadingMode === 'wireframe'; });
            }
        });
    }, [showGrid, shadingMode, isPlaying]);

    // Handle Selection Name Sync
    useEffect(() => {
        if (selectedEntityId !== null && appRef.current) {
            const entity = appRef.current.threeScene.getObjectByProperty('userData.entityId', selectedEntityId);
            setSelectedEntityName(entity?.name || `Entity_${selectedEntityId}`);
        } else {
            setSelectedEntityName('');
        }
    }, [selectedEntityId]);

    // Simplified Click/Selection Logic
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (isPlaying || !appRef.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, appRef.current.camera);

        const intersects = raycaster.intersectObjects(appRef.current.threeScene.children, true);
        
        if (intersects.length > 0) {
            let current: THREE.Object3D | null = intersects[0].object;
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
            style={styles.panel}
            onClick={(e) => {
                setActivePanel('viewport');
                handleClick(e);
            }}
            tabIndex={0}
        >
            <style dangerouslySetInnerHTML={{ __html: viewportAnimations }} />
            
            <canvas ref={canvasRef} style={styles.canvas} />
            
            <div style={styles.watermark}>VibeEngine</div>
            
            {/* Viewport Focus State */}
            {isFocused && (
                <div style={styles.focusIndicator}>
                    <div style={styles.focusCrosshairH} />
                    <div style={styles.focusCrosshairV} />
                </div>
            )}

            <div style={styles.overlay}>
                <div style={styles.topBar}>
                    <AnimatePresence mode="wait">
                        {isPlaying && (
                            <motion.div
                                key={isPaused ? 'paused' : 'live'}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                style={isPaused ? styles.pausedIndicator : styles.liveIndicator}
                            >
                                <div style={{ 
                                    ...styles.liveDot, 
                                    background: isPaused ? '#f59e0b' : '#ef4444',
                                    animation: isPaused ? 'none' : 'live-pulse 2s infinite'
                                }} />
                                <span style={isPaused ? styles.pausedText : styles.liveText}>
                                    {isPaused ? 'PAUSED' : 'LIVE'}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ pointerEvents: 'auto' }}>
                        <ViewportToolbar />
                    </div>
                </div>

                <AnimatePresence>
                    {isPlaying && <RaceHUD />}
                </AnimatePresence>

                <div style={styles.bottomBar}>
                    <div style={{ flex: 1 }} />
                    <AnimatePresence>
                        {selectedEntityId !== null && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                style={styles.selectionInfo}
                            >
                                <span style={styles.selectionName}>{selectedEntityName}</span>
                                <span style={styles.selectionType}>ID: {selectedEntityId}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div style={{ flex: 1 }} />
                </div>
            </div>

            {/* Bottom Status Layer */}
            {!isViewportMaximized && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'auto' }}>
                    <StatusBar />
                </div>
            )}
        </div>
    );
};

export default ViewportPanel;