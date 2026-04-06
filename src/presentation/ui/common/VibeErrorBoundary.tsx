

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
                    
                    {}
                    <div style={{ 
                        fontSize: '10px', 
                        color: '#ef4444', 
                        background: 'rgba(0,0,0,0.5)', 
                        padding: '10px', 
                        borderRadius: '4px', 
                        textAlign: 'left',
                        maxWidth: '90%',
                        overflow: 'auto',
                        fontFamily: 'monospace'
                    }}>
                        {this.state.error?.message}
                    </div>

                    <VibeButton variant="primary" size="sm" onClick={this.handleReset}>
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
