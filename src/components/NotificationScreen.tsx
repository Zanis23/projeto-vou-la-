
import React from 'react';
import { AppNotification } from '@/types';
import { X, Bell, Trash2, Siren, Flame, Mail } from 'lucide-react';

interface NotificationScreenProps {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onNotificationClick: (placeId?: string) => void;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({
  notifications,
  onClose,
  onMarkAsRead,
  onClearAll,
  onNotificationClick
}) => {
  return (
    <div className="fixed inset-0 z-[80] bg-[#0E1121] flex flex-col animate-[fadeIn_0.2s_ease-out]">
      {/* Header */}
      <div className="pt-safe px-4 pb-4 bg-[#0E1121] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-full active:bg-slate-800">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-black text-white italic tracking-tight">NOTIFICAÇÕES</h2>
        </div>

        {notifications.length > 0 && (
          <button onClick={onClearAll} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
            <Bell className="w-16 h-16 mb-4 stroke-1" />
            <p className="text-sm font-bold uppercase tracking-widest">Nada por aqui</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                onMarkAsRead(notif.id);
                if (notif.placeId) onNotificationClick(notif.placeId);
              }}
              className={`relative p-4 rounded-2xl border transition-all active:scale-[0.98] cursor-pointer flex gap-4
                ${notif.read
                  ? 'bg-slate-900 border-slate-800 opacity-60'
                  : 'bg-slate-800/50 border-slate-700 shadow-lg'
                }`}
            >
              {/* Icon Type */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border
                ${notif.type === 'alert' ? 'bg-red-500/10 border-red-500 text-red-500' :
                  notif.type === 'hype' ? 'bg-[#ccff00]/10 border-[#ccff00] text-[#ccff00]' :
                    'bg-cyan-500/10 border-cyan-500 text-cyan-500'
                }`}>
                {notif.type === 'alert' && <Siren className="w-6 h-6" />}
                {notif.type === 'hype' && <Flame className="w-6 h-6" />}
                {notif.type === 'invite' && <Mail className="w-6 h-6" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm font-bold uppercase tracking-wide truncate pr-2 ${notif.read ? 'text-slate-400' : 'text-white'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">{notif.time}</span>
                </div>
                <p className={`text-sm leading-tight ${notif.read ? 'text-slate-500' : 'text-slate-300'}`}>
                  {notif.message}
                </p>
              </div>

              {!notif.read && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#ccff00] shadow-[0_0_5px_#ccff00]"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
