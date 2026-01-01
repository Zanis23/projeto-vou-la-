
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
            whileHover={{ y: -1, backgroundColor: 'rgba(217, 255, 0, 0.05)', borderColor: 'rgba(217, 255, 0, 0.2)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
                triggerHaptic('light');
                onClick();
            }}
            className="group flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl border border-gray-100 bg-white/50 backdrop-blur-sm shadow-sm transition-all duration-300"
        >
            <div className="w-5 h-5 flex items-center justify-center text-gray-900">
                {icon}
            </div>
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                {label}
            </span>
        </motion.button>
    );
};
