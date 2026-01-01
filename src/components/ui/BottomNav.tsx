import { motion } from 'framer-motion';
import { triggerHaptic } from '@/utils/haptics';

export const BottomNav = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
    return (
        <nav className={`fixed bottom-0 left-0 right-0 bg-bg-card/80 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center px-4 z-50 pb-safe pt-2 min-h-[80px] xs:min-h-[90px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] ${className}`}>
            {children}
        </nav>
    );
};

export const BottomNavItem = ({
    active,
    onClick,
    icon,
    label,
    badge
}: {
    active?: boolean;
    onClick?: () => void;
    icon: React.ReactNode;
    label: string;
    badge?: number;
}) => {
    return (
        <button
            onClick={() => {
                triggerHaptic('light');
                onClick?.();
            }}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all relative group flex-1 ${active ? 'text-primary-main' : 'text-text-tertiary'}`}
        >
            <motion.div
                animate={active ? {
                    y: -4,
                    scale: 1.2,
                    filter: 'drop-shadow(0 0 8px var(--primary-glow))'
                } : {
                    y: 0,
                    scale: 1,
                    filter: 'drop-shadow(0 0 0px transparent)'
                }}
                className={`transition-all duration-300 ${active ? 'text-primary-main' : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'}`}
            >
                {icon}
            </motion.div>

            <span className={`text-[8px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${active ? 'text-primary-main opacity-100 translate-y-0.5' : 'opacity-40 group-hover:opacity-80'}`}>
                {label}
            </span>

            {active && (
                <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -top-2 w-6 h-1 bg-primary-main rounded-full shadow-[0_0_15px_var(--primary-glow)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
            )}

            {badge ? (
                <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-1 right-1/4 min-w-[16px] h-4 bg-status-error text-[10px] text-white rounded-full flex items-center justify-center font-black border-2 border-bg-card shadow-lg"
                >
                    {badge > 9 ? '9+' : badge}
                </motion.span>
            ) : null}
        </button>
    );
};
