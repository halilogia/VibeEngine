import React from 'react';
import { useToastStore, type ToastType } from '../stores/toastStore';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import './ToastContainer.css';

const getIcon = (type: ToastType) => {
    switch (type) {
        case 'success': return <CheckCircle size={16} />;
        case 'error': return <AlertCircle size={16} />;
        case 'warning': return <AlertTriangle size={16} />;
        default: return <Info size={16} />;
    }
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast-item ${toast.type}`}>
                    <div className="toast-icon">{getIcon(toast.type)}</div>
                    <div className="toast-message">{toast.message}</div>
                    <button 
                        className="toast-close" 
                        onClick={() => removeToast(toast.id)}
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
};
