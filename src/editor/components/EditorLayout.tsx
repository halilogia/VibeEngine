/**
 * EditorLayout Component - Main layout with resizable panels
 */

import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { HierarchyPanel } from '../panels/HierarchyPanel';
import { ViewportPanel } from '../panels/ViewportPanel';
import { InspectorPanel } from '../panels/InspectorPanel';
import { AssetsPanel } from '../panels/AssetsPanel';
import { ConsolePanel } from '../panels/ConsolePanel';
import { AICopilotPanel } from '../panels/AICopilotPanel';
import { useEditorStore } from '../stores';
import './EditorLayout.css';

export const EditorLayout: React.FC = () => {
    const { showHierarchy, showInspector, showAssets, showConsole, showAICopilot } = useEditorStore();

    return (
        <div className="editor-layout">
            <PanelGroup direction="vertical">
                {/* Main area (top) */}
                <Panel defaultSize={75} minSize={30}>
                    <PanelGroup direction="horizontal">
                        {/* Hierarchy (left) */}
                        {showHierarchy && (
                            <>
                                <Panel defaultSize={15} minSize={10} maxSize={30}>
                                    <HierarchyPanel />
                                </Panel>
                                <PanelResizeHandle />
                            </>
                        )}

                        {/* Viewport (center) */}
                        <Panel defaultSize={45} minSize={30}>
                            <ViewportPanel />
                        </Panel>

                        {/* AI Copilot (right middle) */}
                        {showAICopilot && (
                            <>
                                <PanelResizeHandle />
                                <Panel defaultSize={20} minSize={15} maxSize={35}>
                                    <AICopilotPanel />
                                </Panel>
                            </>
                        )}

                        {/* Inspector (right) */}
                        {showInspector && (
                            <>
                                <PanelResizeHandle />
                                <Panel defaultSize={20} minSize={15} maxSize={40}>
                                    <InspectorPanel />
                                </Panel>
                            </>
                        )}
                    </PanelGroup>
                </Panel>

                {/* Bottom area */}
                {(showAssets || showConsole) && (
                    <>
                        <PanelResizeHandle />
                        <Panel defaultSize={25} minSize={15} maxSize={50}>
                            <PanelGroup direction="horizontal">
                                {/* Assets */}
                                {showAssets && (
                                    <Panel defaultSize={60} minSize={20}>
                                        <AssetsPanel />
                                    </Panel>
                                )}

                                {/* Console */}
                                {showAssets && showConsole && <PanelResizeHandle />}

                                {showConsole && (
                                    <Panel defaultSize={40} minSize={20}>
                                        <ConsolePanel />
                                    </Panel>
                                )}
                            </PanelGroup>
                        </Panel>
                    </>
                )}
            </PanelGroup>
        </div>
    );
};
