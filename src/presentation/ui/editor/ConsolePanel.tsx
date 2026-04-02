/**
 * ConsolePanel - Terminal view (Sovereign Atomic Edition)
 * 🏛️⚛️💎🚀
 */

import React, { useState, useEffect, useRef } from 'react';
import { VibeIcons } from '@ui/common/VibeIcons';
import { useEditorStore, useConsoleStore, type LogLevel } from '@infrastructure/store';
import { SovereignHeader } from '@ui/atomic/molecules/SovereignHeader';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeTheme } from '@themes/VibeStyles';
import { consoleStyles as styles } from './ConsolePanel.styles';

// #region Components
interface LogEntryProps {
    log: { id: string; message: string; level: LogLevel; timestamp: number };
}

const LogEntry: React.FC<LogEntryProps> = ({ log }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const getIcon = () => {
        switch (log.level) {
            case 'error': return 'Trash';
            case 'warn': return 'Settings';
            case 'success': return 'Plus';
            default: return 'Search';
        }
    };

    const getIconColor = () => {
        switch (log.level) {
            case 'error': return '#f43f5e';
            case 'warn': return '#fbbf24';
            case 'success': return '#10b981';
            default: return '#60a5fa';
        }
    };

    return (
        <div 
            style={{ 
                ...styles.entry, 
                ...styles[log.level],
                ...(isHovered ? styles.entryHover : {})
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span style={styles.time}>{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <VibeIcons name={getIcon()} size={12} style={{ color: getIconColor(), marginTop: '2px' }} />
            <span style={{ 
                ...styles.message,
                color: log.level === 'error' ? VibeTheme.colors.error : 
                       log.level === 'warn' ? VibeTheme.colors.warning : 
                       VibeTheme.colors.textMain
            }}>
                {log.message}
            </span>
        </div>
    );
};
// #endregion

interface ConsolePanelProps {
    dragHandleProps?: any;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ dragHandleProps }) => {
    const { logs, clearLogs } = useConsoleStore();
    const { activePanelId, setActivePanel } = useEditorStore();
    const [filter, setFilter] = useState<LogLevel | 'all'>('all');
    const scrollRef = useRef<HTMLDivElement>(null);

    const filteredLogs = logs.filter(log => filter === 'all' || log.level === filter);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, filter]);

    const headerActions = (
        <>
            <VibeButton variant="ghost" size="sm" onClick={clearLogs} title="Clear Logs">
                <VibeIcons name="Trash" size={14} />
            </VibeButton>
        </>
    );

    return (
        <div 
            className={`editor-panel console-panel ${activePanelId === 'console' ? 'active-panel' : ''}`}
            onClick={() => setActivePanel('console')}
            style={styles.panel}
        >
            <SovereignHeader 
                title="CONSOLE" 
                icon="Activity" 
                dragHandleProps={dragHandleProps}
                actions={headerActions}
            />

            <div style={styles.toolbar}>
                <div style={styles.filters}>
                    {['all', 'info', 'warn', 'error', 'success'].map((l) => (
                        <VibeButton
                            key={l}
                            variant={filter === l ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter(l as any)}
                            style={{ borderRadius: '20px', fontSize: '10px', height: '24px' }}
                        >
                            {l.toUpperCase()}
                        </VibeButton>
                    ))}
                </div>
            </div>

            <div ref={scrollRef} style={styles.content}>
                {filteredLogs.length === 0 ? (
                    <div style={styles.empty}>
                        <VibeIcons name="Activity" size={40} style={{ opacity: 0.1, color: VibeTheme.colors.accent }} />
                        <span>No logs to display</span>
                    </div>
                ) : (
                    filteredLogs.map(log => <LogEntry key={log.id} log={log} />)
                )}
            </div>
        </div>
    );
};
