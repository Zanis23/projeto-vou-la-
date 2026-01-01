
import React from 'react';
import { motion } from 'framer-motion';
import { triggerHaptic } from '../../utils/haptics';

interface SocialLoginButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({ icon, label, onClick }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,0,0,0.02)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
                triggerHaptic('light');
                onClick();
            }}
            className="flex-1 flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl border border-gray-100 bg-white shadow-sm transition-all"
        >
            <span className="w-5 h-5 flex items-center justify-center">
                {icon}
            </span>
            <span className="text-sm font-bold text-gray-800 tracking-tight">
                {label}
            </span>
        </motion.button>
    );
};
