/**
 * ConsolePanel - Log output v2 with Store integration
 */

import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, Trash2, CheckCircle } from 'lucide-react';
import { useConsoleStore, useEditorStore, type LogLevel } from '../stores';
import './ConsolePanel.css';

const getIcon = (level: LogLevel) => {
    switch (level) {
        case 'error': return <AlertCircle size={14} />;
        case 'warning': return <AlertTriangle size={14} />;
        case 'success': return <CheckCircle size={14} />;
        default: return <Info size={14} />;
    }
};

export const ConsolePanel: React.FC = () => {
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
            className={`editor-panel console-panel glass-panel ${activePanelId === 'console' ? 'active-panel' : ''}`}
            onClick={() => setActivePanel('console')}
        >
            <div className="editor-panel-header">
                <span>Console</span>
                <div className="panel-actions">
                    <div className="console-filters">
                        <button 
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setFilter('all'); }}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-btn info ${filter === 'info' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setFilter('info'); }}
                        >
                            Info
                        </button>
                        <button 
                            className={`filter-btn warn ${filter === 'warning' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setFilter('warning'); }}
                        >
                            Warn
                        </button>
                        <button 
                            className={`filter-btn error ${filter === 'error' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setFilter('error'); }}
                        >
                            Error
                        </button>
                        <button 
                            className={`filter-btn success ${filter === 'success' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setFilter('success'); }}
                        >
                            Success
                        </button>
                    </div>
                    <div className="v-separator" />
                    <button 
                        className="panel-action-btn" 
                        onClick={(e) => { e.stopPropagation(); clearLogs(); }} 
                        title="Clear"
                    >
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
