import { motion } from 'framer-motion';
import { triggerHaptic } from '../../utils/haptics';

export const BottomNav = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
    return (
        <nav className={`fixed bottom-0 left-0 right-0 bg-[var(--bg-card)]/95 backdrop-blur-xl border-t border-[var(--border-default)] flex justify-around items-center px-2 z-50 pb-safe pt-2 min-h-[75px] xs:min-h-[85px] ${className}`}>
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
            className={`flex flex-col items-center gap-1 p-2 transition-all relative group flex-1 ${active ? 'text-[var(--primary-main)]' : 'text-[var(--text-secondary)]'}`}
        >
            <motion.div
                animate={active ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                className={`transition-colors duration-300 ${active ? 'fill-current' : ''}`}
            >
                {icon}
            </motion.div>

            <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${active ? 'text-[var(--primary-main)] opacity-100' : 'text-[var(--text-tertiary)] opacity-70 group-hover:opacity-100'}`}>
                {label}
            </span>

            {active && (
                <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -top-2 w-8 h-1 bg-[var(--primary-main)] rounded-full shadow-[0_0_10px_var(--primary-main)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
            )}

            {badge ? (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1/4 w-4 h-4 bg-[var(--status-error)] text-white rounded-full text-[9px] flex items-center justify-center font-bold border-2 border-[var(--bg-card)]"
                >
                    {badge > 9 ? '9+' : badge}
                </motion.span>
            ) : null}
        </button>
    );
};
