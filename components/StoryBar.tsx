import React from 'react';
import { Moment } from '../types';
import { Plus, Camera } from 'lucide-react';

interface StoryBarProps {
    moments: Moment[];
    onShowMoment: (moment: Moment) => void;
    onAddMoment: () => void;
    hasCheckedIn: boolean;
}

export const StoryBar: React.FC<StoryBarProps> = ({ moments, onShowMoment, onAddMoment, hasCheckedIn }) => {
    // Group moments by user to show only one entry per user with multiple stories
    const uniqueMoments: Moment[] = Array.from(
        moments.reduce((map, moment) => map.set(moment.userId, moment), new Map<string, Moment>()).values()
    );

    return (
        <div className="flex gap-4 overflow-x-auto hide-scrollbar px-1 py-1">
            {/* Add Moment Button */}
            <div
                onClick={onAddMoment}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300 relative overflow-hidden
          ${hasCheckedIn
                        ? 'bg-gradient-to-br from-[var(--primary)] to-fuchsia-600 shadow-[0_8px_20px_-5px_var(--primary-glow)]'
                        : 'bg-slate-800/50 border border-slate-700'}`}
                >
                    <Camera className={`w-7 h-7 ${hasCheckedIn ? 'text-white' : 'text-slate-500'}`} />
                    {!hasCheckedIn && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-slate-900/80 p-1 rounded-lg">
                                <Plus className="w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                    )}
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ao Vivo</span>
            </div>

            {uniqueMoments.map((moment) => (
                <div
                    key={moment.id}
                    onClick={() => onShowMoment(moment)}
                    className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group active:scale-95 transition-all duration-300"
                >
                    <div className="w-16 h-16 rounded-3xl p-[2.5px] bg-gradient-to-tr from-[#ccff00] via-[#00ffcc] to-[#3b82f6] shadow-[0_8px_20px_-5px_rgba(204,255,0,0.3)] animate-[glow_3s_infinite]">
                        <div className="w-full h-full rounded-[1.4rem] border-2 border-[var(--background)] overflow-hidden bg-slate-900">
                            <img
                                src={moment.userAvatar}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                alt={moment.userName}
                            />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter truncate w-16 text-center">
                        {moment.userName.split(' ')[0]}
                    </span>
                </div>
            ))}

            <style>{`
        @keyframes glow {
          0%, 100% { filter: hue-rotate(0deg) brightness(1); }
          50% { filter: hue-rotate(15deg) brightness(1.2); }
        }
      `}</style>
        </div>
    );
};
