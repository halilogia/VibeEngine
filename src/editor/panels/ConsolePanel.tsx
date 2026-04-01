/**
 * ConsolePanel - Log output v2 with Store integration
 */

import React, { useState } from 'react';
import { VibeIcons } from '../../presentation/components/VibeIcons';

import { useConsoleStore, useEditorStore, type LogLevel } from '../stores';
import './ConsolePanel.css';

const getIcon = (level: LogLevel) => {
    switch (level) {
        case 'error': return <VibeIcons name="AlertCircle" size={14} />;
        case 'warning': return <VibeIcons name="AlertTriangle" size={14} />;
        case 'success': return <VibeIcons name="CheckCircle" size={14} />;
        default: return <VibeIcons name="Sparkles" size={14} />;
    }
};


interface ConsolePanelProps {
    dragHandleProps?: any;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ dragHandleProps }) => {
    const { logs, clearLogs } = useConsoleStore();
    const { activePanelId, setActivePanel } = useEditorStore();
    const [filter, setFilter] = useState<LogLevel | 'all'>('all');

    const filteredLogs = logs.filter((log) =>
        filter === 'all' || log.level === filter
    );

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div 
            className={`editor-panel console-panel ${activePanelId === 'console' ? 'active-panel' : ''}`}
            onClick={() => setActivePanel('console')}
        >
            <div className="panel-header" {...dragHandleProps}>
                <div className="drag-handle-pill">
                    <VibeIcons name="Grip" size={14} />
                </div>
                <div className="panel-header-left">
                    <VibeIcons name="Terminal" size={14} style={{ color: 'var(--editor-accent)' }} />
                    <h2>CONSOLE</h2>
                </div>

                <div className="panel-header-actions" onClick={e => e.stopPropagation()}>
                    <div className="console-filters">
                        <button 
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-btn info ${filter === 'info' ? 'active' : ''}`}
                            onClick={() => setFilter('info')}
                        >
                            Info
                        </button>
                        <button 
                            className={`filter-btn warn ${filter === 'warning' ? 'active' : ''}`}
                            onClick={() => setFilter('warning')}
                        >
                            Warn
                        </button>
                        <button 
                            className={`filter-btn error ${filter === 'error' ? 'active' : ''}`}
                            onClick={() => setFilter('error')}
                        >
                            Error
                        </button>
                    </div>
                    <div className="v-separator" />
                    <button 
                        className="panel-action-btn" 
                        onClick={clearLogs}
                        title="Clear logs"
                    >
                        <VibeIcons name="Trash" size={14} />
                    </button>
                </div>
            </div>

            <div className="console-content">
                {filteredLogs.length === 0 ? (
                    <div className="console-empty">
                        <VibeIcons name="Terminal" size={32} />
                        <p>No console output</p>
                    </div>
                ) : (
                    filteredLogs.map((log, idx) => (
                        <div key={idx} className={`console-entry ${log.level}`}>
                            <div className="console-time">{formatTime(log.timestamp)}</div>
                            <div className="console-icon">{getIcon(log.level)}</div>
                            <div className="console-message">{log.message}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

