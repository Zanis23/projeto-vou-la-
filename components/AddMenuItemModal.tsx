
import React, { useState } from 'react';
import { X, Camera, Plus, Loader2 } from 'lucide-react';
import { MenuItem } from '../types';

interface AddMenuItemModalProps {
    onClose: () => void;
    onSave: (item: MenuItem) => void;
    editingItem?: MenuItem;
}

export const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({ onClose, onSave, editingItem }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<MenuItem>>(
        editingItem || {
            name: '',
            price: 0,
            category: 'food',
            available: true,
            imageUrl: ''
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || formData.price === undefined) return;

        setLoading(true);
        // Simular delay ou chamar onSave direto se não houver upload de imagem agora
        const newItem: MenuItem = {
            id: editingItem?.id || `m_${Date.now()}`,
            name: formData.name!,
            price: Number(formData.price),
            category: formData.category as any,
            available: formData.available ?? true,
            imageUrl: formData.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.name!)}&backgroundColor=1e293b`
        };

        setTimeout(() => {
            onSave(newItem);
            setLoading(false);
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="w-full max-w-md bg-[#0B0F19] rounded-[2.5rem] border border-white/10 overflow-hidden relative shadow-2xl">
                <div className="p-6 pb-0 flex justify-between items-center">
                    <h2 className="text-xl font-black text-white italic truncate uppercase tracking-tight">
                        {editingItem ? 'Editar Item' : 'Novo Produto'}
                    </h2>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Nome */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Produto</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/20 focus:border-indigo-500 transition-colors"
                            placeholder="Ex: Hambúrguer Artesanal"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Preço */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preço (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.price || ''}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/20 focus:border-indigo-500 transition-colors"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Categoria */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-indigo-500 transition-colors appearance-none"
                            >
                                <option value="food">🍽️ Prato/Comida</option>
                                <option value="drink">🍹 Bebida</option>
                                <option value="other">📦 Outro</option>
                            </select>
                        </div>
                    </div>

                    {/* Imagem Placeholder / Upload */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Imagem do Produto</label>
                        <div className="flex gap-4 items-center">
                            <div className="relative group">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-indigo-500/50 transition-colors">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <Camera className="w-8 h-8 text-white/20" />
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('menu-image-upload')?.click()}
                                    className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 rounded-xl text-white shadow-lg active:scale-90 transition-all border-4 border-[#0B0F19]"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                                <input
                                    id="menu-image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, imageUrl: reader.result as string });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <p className="text-[10px] text-slate-400 font-bold leading-tight">Escolha uma foto da galeria ou cole uma URL abaixo.</p>
                                <input
                                    type="text"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px] placeholder:text-white/10 focus:border-indigo-500 transition-colors"
                                    placeholder="https://imagem.com/foto.jpg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    {editingItem ? 'Salvar Alterações' : 'Adicionar ao Cardápio'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
