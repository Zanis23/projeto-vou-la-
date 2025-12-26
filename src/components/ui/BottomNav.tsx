
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
            onClick={(e) => {
                triggerHaptic('light');
                onClick?.();
            }}
            className={`flex flex-col items-center gap-1 p-2 transition-all active:scale-95 relative group ${active ? 'text-[var(--primary-main)]' : 'text-[var(--text-secondary)]'}`}
        >
            <div className={`transition-colors duration-300 ${active ? 'fill-current' : ''}`}>
                {icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider group-hover:text-[var(--text-primary)] transition-colors">{label}</span>

            {badge ? (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--status-error)] text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                    {badge > 9 ? '9+' : badge}
                </span>
            ) : null}
        </button>
    );
};
