
import React from 'react';
import { X, QrCode, Ticket as TicketIcon, Clock, MapPin } from 'lucide-react';
import { Ticket } from '../types';

interface WalletModalProps {
  tickets: Ticket[];
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ tickets, onClose }) => {
  return (
    <div className="fixed inset-0 z-[80] bg-[#0E1121] flex flex-col animate-[slideUp_0.3s_ease-out]">
      <div className="pt-safe px-4 pb-4 bg-[#0E1121] border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
        <h2 className="text-xl font-black text-white italic tracking-tight flex items-center gap-2">
           <TicketIcon className="w-6 h-6 text-[#ccff00]" /> CARTEIRA
        </h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tickets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-50">
             <TicketIcon className="w-20 h-20 text-slate-600 mb-4 stroke-1" />
             <p className="text-slate-400 font-bold uppercase tracking-widest">Carteira Vazia</p>
             <p className="text-xs text-slate-600 mt-2">Compre itens na loja para vê-los aqui.</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-3xl overflow-hidden relative">
               {/* Left Cutout */}
               <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#0E1121] rounded-full"></div>
               {/* Right Cutout */}
               <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#0E1121] rounded-full"></div>
               {/* Dashed Line */}
               <div className="absolute top-1/2 left-4 right-4 border-t-2 border-dashed border-gray-300"></div>

               <div className="p-6 pb-8">
                  <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-black text-black uppercase leading-none">{ticket.title}</h3>
                      <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{ticket.type}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs font-bold uppercase tracking-wide mb-1">
                      <MapPin className="w-3 h-3" /> {ticket.placeName}
                  </div>
                  {ticket.date && (
                    <div className="flex items-center gap-1 text-gray-500 text-xs font-bold uppercase tracking-wide">
                        <Clock className="w-3 h-3" /> {ticket.date}
                    </div>
                  )}
               </div>

               <div className="bg-gray-100 p-6 flex flex-col items-center justify-center gap-2">
                   <QrCode className="w-24 h-24 text-black" />
                   <p className="text-[10px] text-gray-400 font-mono tracking-widest">{ticket.id.toUpperCase()}</p>
                   {ticket.status === 'used' && (
                       <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                           <span className="text-red-500 font-black border-4 border-red-500 px-4 py-2 rounded-xl rotate-[-15deg] text-xl">UTILIZADO</span>
                       </div>
                   )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
