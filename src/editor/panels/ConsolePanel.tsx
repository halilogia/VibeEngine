/**
 * ConsolePanel - Log output
 */

import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';
import './ConsolePanel.css';

type LogLevel = 'info' | 'warning' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
}

// Initial logs
const INITIAL_LOGS: LogEntry[] = [
    { level: 'info', message: 'VibeEngine Editor v1.0.0-beta initialized', timestamp: new Date() },
    { level: 'info', message: 'AI Copilot Bridge: Active', timestamp: new Date() },
    { level: 'info', message: 'Graphics: ACESFilmic Rendering Enabled', timestamp: new Date() },
];

const getIcon = (level: LogLevel) => {
    switch (level) {
        case 'error': return <AlertCircle size={14} />;
        case 'warning': return <AlertTriangle size={14} />;
        default: return <Info size={14} />;
    }
};

export const ConsolePanel: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
    const [filter, setFilter] = useState<LogLevel | 'all'>('all');

    const filteredLogs = logs.filter(log =>
        filter === 'all' || log.level === filter
    );

    const clearLogs = () => setLogs([]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="editor-panel console-panel">
            <div className="editor-panel-header">
                <span>Console</span>
                <div className="panel-actions">
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
                    <button className="panel-action-btn" onClick={clearLogs} title="Clear">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="console-content">
                {filteredLogs.length === 0 ? (
                    <div className="console-empty">No logs</div>
                ) : (
                    filteredLogs.map((log, idx) => (
                        <div key={idx} className={`console-entry ${log.level}`}>
                            <span className="console-icon">{getIcon(log.level)}</span>
                            <span className="console-time">{formatTime(log.timestamp)}</span>
                            <span className="console-message">{log.message}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
