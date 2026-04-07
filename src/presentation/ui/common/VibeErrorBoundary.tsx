

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { VibeIcons } from './VibeIcons';
import { VibeButton } from '@ui/atomic/atoms/VibeButton';
import { VibeTheme } from '@themes/VibeStyles';

interface Props {
    
    children: ReactNode;
    
    name?: string;
}

interface State {
    
    hasError: boolean;
    
    error: Error | null;
}

export class VibeErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[VibeEngine] Resilience Triggered in ${this.props.name || 'Component'}:`, error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div style={styles.errorContainer}>
                    <div style={styles.iconWrapper}>
                        <VibeIcons name="AlertCircle" size={40} style={{ color: VibeTheme.colors.accent }} />
                    </div>
                    <h3 style={styles.title}>Panel Encountered an issue</h3>
                    <p style={styles.desc}>
                        {this.props.name || 'This component'} experienced a temporary glitch. 
                        The rest of the engine is safe.
                    </p>
                    
                    {/* Error Detail with Copy Action */}
                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ 
                            fontSize: '11px', 
                            color: '#ef4444', 
                            background: 'rgba(5, 5, 8, 0.8)', 
                            padding: '12px', 
                            paddingRight: '36px',
                            borderRadius: '8px', 
                            textAlign: 'left',
                            maxWidth: '90%',
                            maxHeight: '120px',
                            overflow: 'auto',
                            fontFamily: '"Fira Code", monospace',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            position: 'relative'
                        }}>
                            <div style={{ fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase', fontSize: '9px', opacity: 0.6 }}>Diagnostics</div>
                            {this.state.error?.name}: {this.state.error?.message}
                            <VibeButton 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                    const fullError = `Panel: ${this.props.name}\nError: ${this.state.error?.name}\nMessage: ${this.state.error?.message}\nStack: ${this.state.error?.stack}`;
                                    navigator.clipboard.writeText(fullError);
                                    alert('Error details copied to clipboard!');
                                }}
                                style={{ 
                                    position: 'absolute', 
                                    top: '8px', 
                                    right: '8px', 
                                    padding: '4px', 
                                    height: '24px', 
                                    width: '24px',
                                    color: '#ef4444'
                                }}
                            >
                                <VibeIcons name="Copy" size={12} />
                            </VibeButton>
                        </div>
                    </div>

                    <VibeButton variant="primary" size="sm" onClick={this.handleReset} style={{ marginTop: '8px' }}>
                        <VibeIcons name="RefreshCcw" size={14} /> Restore Panel
                    </VibeButton>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    errorContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: '24px',
        background: 'rgba(5, 5, 8, 0.9)',
        color: '#fff',
        textAlign: 'center' as const,
        gap: '16px',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${VibeTheme.colors.glassBorder}`,
        borderRadius: '8px',
    },
    iconWrapper: {
        marginBottom: '8px',
        opacity: 0.8,
    },
    title: {
        fontSize: '14px',
        fontWeight: 700,
        margin: 0,
        letterSpacing: '1px',
    },
    desc: {
        fontSize: '12px',
        color: VibeTheme.colors.textSecondary,
        margin: 0,
        lineHeight: 1.5,
        maxWidth: '240px',
    }
};
