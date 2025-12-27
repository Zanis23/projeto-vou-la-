
import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export interface ToastProps {
    id?: string;
    type?: 'success' | 'error' | 'info';
    message: string;
    duration?: number;
    onClose?: () => void;
}

export const Toast = ({
    type = 'info',
    message,
    duration = 3000,
    onClose
}: ToastProps) => {
    useEffect(() => {
        if (duration > 0 && onClose) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const variants = {
        success: 'bg-[var(--bg-card)] border-l-4 border-l-[var(--status-success)] text-[var(--text-primary)]',
        error: 'bg-[var(--bg-card)] border-l-4 border-l-[var(--status-error)] text-[var(--text-primary)]',
        info: 'bg-[var(--bg-card)] border-l-4 border-l-[var(--status-info)] text-[var(--text-primary)]',
    };

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-[var(--status-success)]" />,
        error: <XCircle className="w-5 h-5 text-[var(--status-error)]" />,
        info: <Info className="w-5 h-5 text-[var(--status-info)]" />,
    };

    return (
        <div className={`flex items-center gap-3 p-4 rounded-lg shadow-lg border border-[var(--border-default)] animate-slide-in-right min-w-[300px] ${variants[type]}`}>
            {icons[type]}
            <p className="flex-1 text-sm font-medium">{message}</p>
            {onClose && (
                <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
