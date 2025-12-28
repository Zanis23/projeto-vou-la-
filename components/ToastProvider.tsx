import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toast, ToastProps } from '../src/components/ui/Toast';

interface ToastContextType {
    showToast: (props: Omit<ToastProps, 'onClose'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Debug log to confirm provider mounting
    React.useEffect(() => {
        console.log('[ToastProvider] Mounted');
    }, []);

    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const showToast = useCallback((props: Omit<ToastProps, 'onClose'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = { ...props, id };
        setToasts((prev) => [...prev, newToast]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-24 left-0 right-0 z-[1000] flex flex-col items-center gap-2 pointer-events-none px-4">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="pointer-events-auto"
                        >
                            <Toast
                                {...toast}
                                onClose={() => removeToast(toast.id!)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
