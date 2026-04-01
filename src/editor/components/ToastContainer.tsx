import React from 'react';
import { useToastStore, type ToastType } from '../stores/toastStore';
import { VibeIcons } from '../../presentation/components/VibeIcons';
import { VibeMotion } from '../../lib/vibe-motion/VibeMotion';
import './ToastContainer.css';


const getIcon = (type: ToastType) => {
    switch (type) {
        case 'success': return <VibeIcons name="CheckCircle" size={16} />;
        case 'error': return <VibeIcons name="AlertCircle" size={16} />;
        case 'warning': return <VibeIcons name="AlertTriangle" size={16} />;
        default: return <VibeIcons name="Sparkles" size={16} />;
    }
};


export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <VibeMotion 
                    key={toast.id} 
                    id={toast.id}
                    className={`toast-item ${toast.type}`}
                    initial={{ x: 300, opacity: 0, scale: 0.8 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    transition={{ tension: 200, friction: 15 }}
                >
                    <div className="toast-icon">{getIcon(toast.type)}</div>
                    <div className="toast-message">{toast.message}</div>
                    <button 
                        className="toast-close" 
                        onClick={() => removeToast(toast.id)}
                    >
                        <VibeIcons name="X" size={14} />
                    </button>

                </VibeMotion>
            ))}
        </div>
    );
};
