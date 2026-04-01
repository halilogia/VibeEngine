import { VibeIcons } from '../../presentation/components/VibeIcons';

import { useEditorStore } from '../stores';
import './ViewportToolbar.css';

export const ViewportToolbar: React.FC = () => {
    const { 
        shadingMode, setShadingMode, 
        showGrid, toggleGrid, 
        showAxes, toggleAxes,
        isPlaying 
    } = useEditorStore();

    return (
        <div className="v-toolbar-container glass-panel">
            {/* Shading Modes */}
            <div className="v-toolbar-group">
                <button 
                    className={`v-tool-btn ${shadingMode === 'lit' ? 'active' : ''}`}
                    onClick={() => setShadingMode('lit')}
                    title="Shaded (Lit)"
                >
                    <VibeIcons name="Box" size={14} />
                </button>

                <button 
                    className={`v-tool-btn ${shadingMode === 'wireframe' ? 'active' : ''}`}
                    onClick={() => setShadingMode('wireframe')}
                    title="Wireframe"
                >
                    <VibeIcons name="Grid" size={14} />
                </button>

                <button 
                    className={`v-tool-btn ${shadingMode === 'solid' ? 'active' : ''}`}
                    onClick={() => setShadingMode('solid')}
                    title="Flat (Solid)"
                >
                    <VibeIcons name="Layers" size={14} />
                </button>

            </div>

            <div className="v-toolbar-divider" />

            {/* Scene Helpers */}
            <div className="v-toolbar-group">
                <button 
                    className={`v-tool-btn ${showGrid ? 'active' : ''}`}
                    onClick={toggleGrid}
                    title="Toggle Grid (G)"
                >
                    <VibeIcons name="Grid" size={14} />
                </button>

                <button 
                    className={`v-tool-btn ${showAxes ? 'active' : ''}`}
                    onClick={toggleAxes}
                    title="Toggle Axes"
                >
                    <VibeIcons name="Axis" size={14} />
                </button>

            </div>

            <div className="v-toolbar-divider" />

            {/* Viewport Extras */}
            <div className="v-toolbar-group">
                <button className="v-tool-btn" title="Stats View">
                    <VibeIcons name="Activity" size={14} />
                </button>
                <button className="v-tool-btn" title="Focus View (F)">
                    <VibeIcons name="Maximize" size={14} />
                </button>
            </div>


            {isPlaying && (
                <div className="v-toolbar-badge">
                    <div className="v-pulse-dot" />
                    <span>Live Simulation</span>
                </div>
            )}
        </div>
    );
};
