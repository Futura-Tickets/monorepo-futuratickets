"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, WarningOutlined, CloseOutlined } from '@ant-design/icons';
import './Toast.scss';

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextType {
    showToast: (toast: Omit<Toast, 'id'>) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const generateId = () => `toast-${Date.now()}-${Math.random()}`;

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = generateId();
        const newToast: Toast = {
            id,
            ...toast,
            duration: toast.duration ?? 4000,
        };

        setToasts((prev) => [...prev, newToast]);

        // Auto-hide after duration
        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                hideToast(id);
            }, newToast.duration);
        }
    }, [hideToast]);

    const success = useCallback((message: string, duration?: number) => {
        showToast({ type: 'success', message, duration });
    }, [showToast]);

    const error = useCallback((message: string, duration?: number) => {
        showToast({ type: 'error', message, duration });
    }, [showToast]);

    const warning = useCallback((message: string, duration?: number) => {
        showToast({ type: 'warning', message, duration });
    }, [showToast]);

    const info = useCallback((message: string, duration?: number) => {
        showToast({ type: 'info', message, duration });
    }, [showToast]);

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <CheckCircleOutlined />;
            case 'error':
                return <CloseCircleOutlined />;
            case 'warning':
                return <WarningOutlined />;
            case 'info':
                return <InfoCircleOutlined />;
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info, hideToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        <div className="toast-icon">
                            {getIcon(toast.type)}
                        </div>
                        <div className="toast-content">
                            <div className="toast-message">{toast.message}</div>
                            {toast.action && (
                                <button
                                    className="toast-action"
                                    onClick={() => {
                                        toast.action!.onClick();
                                        hideToast(toast.id);
                                    }}
                                >
                                    {toast.action.label}
                                </button>
                            )}
                        </div>
                        <button
                            className="toast-close"
                            onClick={() => hideToast(toast.id)}
                            aria-label="Cerrar notificación"
                        >
                            <CloseOutlined />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
