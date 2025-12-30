import React, { useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { MenuItem } from '../types';
import { FALLBACK_IMAGE } from '../constants';

interface MenuCardProps {
    item: MenuItem;
    qty: number;
    onAdd: () => void;
    onRemove: () => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, qty, onAdd, onRemove }) => {

    // Using inline styles for the flip and floating animations to match the user's CSS request
    // We will use standard Tailwind for layout but inject the keyframes for the "floating element"

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="w-full h-[220px] perspective-[1000px] group mb-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <style>
                {`
                @keyframes floating {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(10px); }
                    100% { transform: translateY(0px); }
                }
                .floating-element { animation: floating 2600ms infinite linear; }
                `}
            </style>

            <div className={`relative w-full h-full text-center transition-transform duration-500 transform-style-3d ${isHovered ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transform: isHovered ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>

                {/* FRONT */}
                <div className="absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-between p-4 bg-[#151515] rounded-xl border border-white/5 shadow-xl overflow-hidden" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                    <div className="relative w-full h-32 rounded-lg overflow-hidden mb-2">
                        <img
                            src={item.imageUrl || FALLBACK_IMAGE}
                            className="w-full h-full object-cover"
                            alt={item.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <span className="absolute bottom-2 right-2 bg-primary-main text-black text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3" /> ADD
                        </span>
                    </div>

                    <div className="w-full text-left">
                        <div className="flex justify-between items-start">
                            <h4 className="text-white font-black text-sm italic uppercase leading-tight truncate pr-2">{item.name}</h4>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium line-clamp-2 mt-1 min-h-[2.5em]">
                            {item.description || "Delicioso e preparado na hora para você."}
                        </p>
                    </div>

                    <div className="w-full flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <span className="text-primary-main font-black text-lg">R$ {item.price.toFixed(2)}</span>
                        {qty > 0 && (
                            <span className="bg-white text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">
                                {qty}
                            </span>
                        )}
                    </div>
                </div>

                {/* BACK */}
                <div
                    className="absolute inset-0 w-full h-full backface-hidden bg-[#151515] rounded-xl overflow-hidden flex flex-col items-center justify-center p-4"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    {/* Animated Background Effect */}
                    <div className="absolute inset-0 z-0 opacity-20 bg-gradient-to-br from-orange-500/20 via-transparent to-purple-500/20"></div>

                    {/* Floating Element (Decoration) */}
                    <div className="absolute top-[-20px] right-[-20px] w-20 h-20 bg-primary-main/20 rounded-full blur-xl floating-element"></div>

                    <div className="relative z-10 w-full flex flex-col items-center gap-4">
                        <h4 className="text-white font-black text-lg italic uppercase">{item.name}</h4>

                        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                            <button
                                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white active:scale-90 transition-all hover:bg-red-500/20 hover:text-red-500"
                            >
                                <Minus className="w-5 h-5" />
                            </button>
                            <span className="text-2xl font-black text-white w-8 text-center">{qty}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                                className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center active:scale-90 transition-all hover:bg-primary-main"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">{qty === 0 ? 'Adicione ao pedido' : 'Item no carrinho'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
