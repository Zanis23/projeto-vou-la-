
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AddMenuItemModal } from './AddMenuItemModal';
import { Place, MenuItem, StaffCall, PlaceType, BusinessEvent, FlashPromo, CrowdInsight } from '../types';
import { db } from '../utils/storage';
import { useHaptic } from '../hooks/useHaptic';
import { getBusinessInsights } from '../services/geminiService';
import {
    BarChart3, Users, Music, Zap, Settings,
    Save, BellRing, TrendingUp, ShieldCheck,
    CheckCircle2, Utensils, Ticket,
    Sparkles, Plus, ClipboardList,
    Clock, Megaphone, Loader2, X,
    DollarSign, UsersRound, Activity,
    Camera, Edit3, Trash2, RefreshCw, HelpCircle, Calendar,
    ChevronRight, ArrowUpRight, Eye, Layout, ScanLine,
    Layers, Power, Flame, History, PieChart, ShoppingBag,
    TrendingDown, Star, Filter, Share2, Disc, Mic2, Heart
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BusinessDashboardProps {
    placeId: string;
    placeData?: Place; // Received from App > Profile parent
    onClose?: () => void;
}

type AdminModule = 'metrics' | 'ops' | 'growth' | 'admin';

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ placeId, placeData, onClose }) => {
    const { trigger } = useHaptic();
    // If placeData is provided (Realtime), use it. Otherwise fallback to local state (will be null initially)
    const [localPlace, setLocalPlace] = useState<Place | null>(placeData || null);
    const place = localPlace;

    useEffect(() => {
        if (placeData) {
            setLocalPlace(placeData);
        }
    }, [placeData]);

    const items = place?.menu || [];
    const menuTotals = useMemo(() => ({
        food: items.filter(i => i.category === 'food').length,
        drinks: items.filter(i => i.category === 'drink').length,
        available: items.filter(i => i.available).length
    }), [items]);

    const activeCalls = useMemo(() => (place?.activeCalls || []).sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [place]);

    const [activeModule, setActiveModule] = useState<AdminModule>('metrics');

    // -- STATE MGMT --
    const [capacity, setCapacity] = useState(0);
    const [insight, setInsight] = useState<string>("Analisando movimentação da casa...");
    const [loadingInsight, setLoadingInsight] = useState(false);
    const [activeOpsTab, setActiveOpsTab] = useState<'orders' | 'menu' | 'live'>('orders');
    const [isFiringHype, setIsFiringHype] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | undefined>(undefined);

    // Local insights and form state
    const [insights, setInsights] = useState<CrowdInsight | null>(place?.crowdInsights || null);
    const [editForm, setEditForm] = useState<Partial<Place>>({
        name: place?.name || '',
        description: place?.description || '',
        currentMusic: place?.currentMusic || '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEditingRef = useRef(false);

    // Update form when place changes
    useEffect(() => {
        if (place) {
            setEditForm({
                name: place.name,
                description: place.description,
                currentMusic: place.currentMusic,
            });
            setCapacity(place.capacityPercentage);
        }
    }, [place]);

    const updateCallStatus = async (id: string, status: StaffCall['status']) => {
        if (!place) return;
        trigger('medium');

        // Optimistic update
        const oldCalls = place.activeCalls || [];
        const newCalls = oldCalls.map(c => c.id === id ? { ...c, status } : c);
        setLocalPlace({ ...place, activeCalls: newCalls });

        try {
            const updated = await db.places.update({ id: place.id, activeCalls: newCalls });
            if (!updated) throw new Error("Update failed");
            trigger('success');
        } catch (e) {
            console.error("Erro ao atualizar status do pedido:", e);
            setLocalPlace({ ...place, activeCalls: oldCalls }); // Rollback
            alert("Erro ao atualizar pedido. Tente novamente.");
        }
    };

    const deleteCall = async (id: string) => {
        if (!place) return;
        trigger('heavy');

        // Optimistic update
        const oldCalls = place.activeCalls || [];
        const newCalls = oldCalls.filter(c => c.id !== id);
        setLocalPlace({ ...place, activeCalls: newCalls });

        try {
            const updated = await db.places.update({ id: place.id, activeCalls: newCalls });
            if (!updated) throw new Error("Delete failed");
            trigger('success');
        } catch (e) {
            setLocalPlace({ ...place, activeCalls: oldCalls }); // Rollback
            alert("Erro ao remover pedido.");
        }
    };

    const toggleMenuItem = async (itemId: string) => {
        if (!place || !place.menu) return;
        trigger('light');

        // Optimistic update
        const oldMenu = [...place.menu];
        const newMenu = oldMenu.map(item => item.id === itemId ? { ...item, available: !item.available } : item);
        setLocalPlace({ ...place, menu: newMenu });

        try {
            const updated = await db.places.update({ id: place.id, menu: newMenu });
            if (!updated) throw new Error("Toggle failed");
        } catch (e) {
            setLocalPlace({ ...place, menu: oldMenu }); // Rollback
        }
    };

    const handleSaveMenuItem = async (item: MenuItem) => {
        if (!place) return;
        trigger('medium');

        // Optimistic update
        const oldMenu = place.menu || [];
        let newMenu = [...oldMenu];
        const existingIndex = newMenu.findIndex(m => m.id === item.id);

        if (existingIndex >= 0) {
            newMenu[existingIndex] = item;
        } else {
            newMenu.push(item);
        }

        setLocalPlace({ ...place, menu: newMenu });
        setShowAddModal(false);
        setEditingItem(undefined);

        try {
            const updated = await db.places.update({ id: place.id, menu: newMenu });
            if (!updated) throw new Error("Save failed");
            trigger('success');
        } catch (e) {
            setLocalPlace({ ...place, menu: oldMenu }); // Rollback
            alert("Erro ao salvar item.");
        }
    };

    const handleDeleteMenuItem = async (itemId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!place || !confirm("Remover este item definitivamente?")) return;
        trigger('heavy');

        const oldMenu = place.menu || [];
        const newMenu = oldMenu.filter(m => m.id !== itemId);
        setLocalPlace({ ...place, menu: newMenu });

        try {
            const updated = await db.places.update({ id: place.id, menu: newMenu });
            if (!updated) throw new Error("Delete failed");
        } catch (e) {
            setLocalPlace({ ...place, menu: oldMenu }); // Rollback
        }
    };

    // Fix: handleSaveConfig now awaits db.places.update
    const handleSaveConfig = async () => {
        if (!place) return;
        setIsSaving(true);
        trigger('medium');

        const oldState = { ...place };
        const newState = { ...place, ...editForm, capacityPercentage: capacity };
        setLocalPlace(newState);

        try {
            const updated = await db.places.update(newState);
            if (!updated) throw new Error("Save failed");
            setIsSaving(false);
            trigger('success');
            alert("Perfil Business atualizado!");
        } catch (e) {
            setIsSaving(false);
            setLocalPlace(oldState); // Rollback
            alert("Erro ao salvar configurações.");
        }
    };

    const handleHypeAlert = () => {
        trigger('heavy');
        setIsFiringHype(true);
        setTimeout(() => {
            setIsFiringHype(false);
            alert("HYPE ALERT disparado com sucesso!");
        }, 2000);
    };

    const generateNewInsight = async () => {
        if (!place) return;
        setLoadingInsight(true);
        trigger('medium');
        const stats = { occupancy: capacity, people: place.peopleCount, pendingCalls: place.activeCalls?.filter(c => c.status === 'pending').length || 0 };
        const newInsight = await getBusinessInsights(place.name, stats);
        setInsight(newInsight);
        setLoadingInsight(false);
    };

    const totals = useMemo(() => {
        if (!place) return { revenue: 0, orders: 0, male: 45, female: 52, others: 3 };
        const revenue = (place.peopleCount * 62.50) + (place.activeCalls?.length || 0) * 18.20;
        const pending = place.activeCalls?.filter(c => c.status === 'pending').length || 0;
        return { revenue, orders: pending, male: 42, female: 55, others: 3 };
    }, [place]);

    if (!place) {
        return (
            <div className="flex-1 bg-[#0B0F19] flex flex-col items-center justify-center p-8 text-center">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <h3 className="text-xl font-black text-white italic mb-2 uppercase tracking-tight">Carregando Painel...</h3>
                <p className="text-slate-500 text-xs font-bold leading-relaxed max-w-xs uppercase">
                    Sincronizando dados com o servidor. Se demorar muito, tente atualizar a página ou verificar o seu cadastro.
                </p>
                {onClose && (
                    <button onClick={onClose} className="mt-8 px-6 py-2 bg-slate-800 rounded-xl text-slate-400 font-bold uppercase text-[10px] border border-slate-700">
                        Voltar
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-[#0B0F19] h-full flex flex-col animate-[fadeIn_0.3s_ease-out] overflow-hidden">

            {/* PRO HEADER */}
            <div className="bg-[#1F2937] p-4 border-b border-slate-700 shadow-2xl shrink-0 flex items-center justify-between z-40">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 border border-white/10 overflow-hidden shadow-inner shrink-0">
                        <img src={place.imageUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-base font-black text-white italic truncate uppercase leading-none tracking-tight">{place.name}</h2>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="flex items-center gap-1 text-cyan-400 text-[9px] font-black uppercase bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 tracking-widest">
                                <Activity className="w-2.5 h-2.5" /> LIVE DASHBOARD
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleHypeAlert} className={`p-2.5 rounded-xl text-white shadow-lg transition-all active:scale-90 ${isFiringHype ? 'bg-fuchsia-500 animate-pulse' : 'bg-slate-800 border border-slate-700 text-fuchsia-500'}`}>
                        <Megaphone className="w-5 h-5" />
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 border border-slate-700 active:scale-90">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* PRO NAV */}
            <div className="flex bg-[#1F2937]/90 backdrop-blur-md border-b border-slate-800 overflow-x-auto hide-scrollbar shrink-0 z-30">
                <NavTab active={activeModule === 'metrics'} label="Estatísticas" icon={<BarChart3 className="w-4 h-4" />} onClick={() => setActiveModule('metrics')} />
                <NavTab active={activeModule === 'ops'} label="Serviço" icon={<Utensils className="w-4 h-4" />} onClick={() => setActiveModule('ops')} badge={totals.orders} />
                <NavTab active={activeModule === 'growth'} label="Promoções" icon={<Zap className="w-4 h-4" />} onClick={() => setActiveModule('growth')} />
                <NavTab active={activeModule === 'admin'} label="Perfil" icon={<Settings className="w-4 h-4" />} onClick={() => setActiveModule('admin')} />
            </div>

            <div className="flex-1 overflow-y-auto scroll-container p-4 pb-32">

                {/* 1. MÉTTRICAS AVANÇADAS */}
                {activeModule === 'metrics' && (
                    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                        <div className="grid grid-cols-2 gap-3">
                            <KPICard label="Faturamento" value={`R$ ${totals.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} trend="+22%" icon={<DollarSign className="w-4 h-4 text-emerald-500" />} />
                            <KPICard label="Check-ins" value={`${place.peopleCount}`} trend="+14%" icon={<Users className="w-4 h-4 text-indigo-400" />} />
                        </div>

                        <div className="bg-[#1F2937] p-6 rounded-[2rem] border border-slate-700 shadow-xl">
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <PieChart className="w-4 h-4 text-fuchsia-500" /> Perfil do Público
                            </h3>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex-1 h-32 relative">
                                    {/* SVG Donut Chart Mock */}
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="16" fill="none" stroke="#334155" strokeWidth="4" />
                                        <circle cx="18" cy="18" r="16" fill="none" stroke="#ec4899" strokeWidth="4" strokeDasharray="55 100" />
                                        <circle cx="18" cy="18" r="16" fill="none" stroke="#06b6d4" strokeWidth="4" strokeDasharray="42 100" strokeDashoffset="-55" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-black text-white leading-none">24</span>
                                        <span className="text-[8px] font-bold text-slate-500 uppercase">Anos (Média)</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-3 pl-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500"></div><span className="text-[10px] text-slate-300 font-bold uppercase">Mulheres</span></div>
                                        <span className="text-xs font-black text-white">{totals.female}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500"></div><span className="text-[10px] text-slate-300 font-bold uppercase">Homens</span></div>
                                        <span className="text-xs font-black text-white">{totals.male}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-500"></div><span className="text-[10px] text-slate-300 font-bold uppercase">Outros</span></div>
                                        <span className="text-xs font-black text-white">{totals.others}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[10px] font-black text-indigo-100 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> IA Business Insight
                                    </h3>
                                    <button onClick={generateNewInsight} disabled={loadingInsight} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20">
                                        {loadingInsight ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-white font-bold leading-relaxed italic text-sm">"{insight}"</p>
                            </div>
                            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                )}

                {/* 2. OPERAÇÕES (KDS & DJ) */}
                {activeModule === 'ops' && (
                    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-slate-700">
                            <button onClick={() => setActiveOpsTab('orders')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activeOpsTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                                <ClipboardList className="w-4 h-4" /> Pedidos
                            </button>
                            <button onClick={() => setActiveOpsTab('menu')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activeOpsTab === 'menu' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                                <Utensils className="w-4 h-4" /> Cardápio
                            </button>
                            <button onClick={() => setActiveOpsTab('live')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activeOpsTab === 'live' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                                <Disc className="w-4 h-4" /> Palco
                            </button>
                        </div>

                        {activeOpsTab === 'menu' && (
                            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Utensils className="w-4 h-4 text-cyan-400" /> Gestão do Cardápio
                                    </h3>
                                    <button
                                        onClick={() => { setEditingItem(undefined); setShowAddModal(true); }}
                                        className="p-2 bg-indigo-600 rounded-xl text-white active:scale-95 transition-all flex items-center gap-2 text-[9px] font-black uppercase"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Adicionar
                                    </button>
                                </div>
                                {(place.menu || []).length === 0 ? (
                                    <div className="p-8 text-center border border-slate-700 border-dashed rounded-3xl opacity-50">
                                        <p className="text-xs font-bold text-slate-400">Nenhum item cadastrado no cardápio.</p>
                                    </div>
                                ) : (
                                    place.menu?.map(item => (
                                        <div key={item.id} className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all">
                                            <div className="flex items-center justify-between p-4">
                                                {/* Left side: Info (Toggles status on click) */}
                                                <div
                                                    onClick={() => toggleMenuItem(item.id)}
                                                    className="flex items-center gap-4 flex-1 cursor-pointer select-none active:opacity-70 transition-opacity"
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 overflow-hidden shrink-0">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} className={`w-full h-full object-cover ${item.available ? '' : 'grayscale opacity-50'}`} alt="" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                                                <Utensils className="w-5 h-5 text-slate-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`text-sm font-black uppercase tracking-tight truncate ${item.available ? 'text-white' : 'text-slate-500 line-through'}`}>{item.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                                            R$ {item.price.toFixed(2)} • {item.category}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Right side: Actions */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEditingItem(item); setShowAddModal(true); }}
                                                        className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all active:scale-90"
                                                        title="Editar"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteMenuItem(item.id, e)}
                                                        className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-all active:scale-90"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleMenuItem(item.id); }}
                                                        className={`w-12 h-6 rounded-full p-1 transition-all flex items-center shadow-inner ${item.available ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                                    >
                                                        <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-300 ${item.available ? 'translate-x-6' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeOpsTab === 'orders' && (
                            <div className="space-y-3">
                                {(place.activeCalls || []).length === 0 ? (
                                    <div className="py-24 text-center opacity-30 flex flex-col items-center">
                                        <BellRing className="w-16 h-16 mb-4 stroke-[1]" />
                                        <p className="text-sm font-black uppercase tracking-widest italic">Bar tranquilo por enquanto</p>
                                    </div>
                                ) : (
                                    place.activeCalls?.map(call => (
                                        <div key={call.id} className={`p-5 rounded-3xl border transition-all ${call.status === 'pending' ? 'bg-slate-800 border-indigo-500/40 shadow-xl' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-2xl ${call.type === 'Pedido' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                        {call.type === 'Pedido' ? <Utensils className="w-6 h-6" /> : <DollarSign className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-black text-base italic leading-tight">{call.userName}</p>
                                                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 flex items-center gap-2">
                                                            <Clock className="w-3 h-3" /> {call.timestamp} • {call.type}
                                                            {call.status === 'preparing' && <span className="text-amber-500 font-extrabold ml-1 animate-pulse">● Preparando</span>}
                                                            {call.status === 'ready' && <span className="text-emerald-400 font-extrabold ml-1">● Pronto</span>}
                                                            {call.status === 'done' && <span className="text-slate-400 font-extrabold ml-1">● Finalizado</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {call.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateCallStatus(call.id, 'preparing')}
                                                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all"
                                                        >
                                                            Atender Pedido
                                                        </button>
                                                    )}
                                                    {call.status === 'preparing' && (
                                                        <button
                                                            onClick={() => updateCallStatus(call.id, 'ready')}
                                                            className="bg-amber-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all"
                                                        >
                                                            Pedido Pronto
                                                        </button>
                                                    )}
                                                    {call.status === 'ready' && (
                                                        <button
                                                            onClick={() => updateCallStatus(call.id, 'done')}
                                                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all"
                                                        >
                                                            Entregar / Finalizar
                                                        </button>
                                                    )}
                                                    {call.status === 'done' && (
                                                        <button
                                                            onClick={() => deleteCall(call.id)}
                                                            className="p-2.5 text-slate-600 hover:text-white transition-colors"
                                                            title="Remover"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeOpsTab === 'live' && (
                            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                                <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 shadow-xl">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Mic2 className="w-4 h-4 text-indigo-400" /> Ao Vivo Agora
                                    </h3>
                                    <div className="space-y-4">
                                        <AdminInput label="Artista / Banda" value={editForm.currentMusic} onChange={v => setEditForm({ ...editForm, currentMusic: v })} />
                                        <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Disparar Banner Pro Público</button>
                                    </div>
                                </div>

                                <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 shadow-xl">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Disc className="w-4 h-4 text-fuchsia-500" /> Pedidos de Música (TOP 3)
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { song: 'Solteiro Forçado', artist: 'Ana Castela', votes: 24 },
                                            { song: 'Erro Gostoso', artist: 'Simone Mendes', votes: 18 },
                                            { song: 'Canudinho', artist: 'Gusttavo Lima', votes: 12 }
                                        ].map((m, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                                                <div>
                                                    <p className="text-sm font-black text-white">{m.song}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{m.artist}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-fuchsia-500/10 px-2 py-1 rounded-lg">
                                                    <Heart className="w-3 h-3 text-fuchsia-500 fill-current" />
                                                    <span className="text-[10px] font-black text-white">{m.votes}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. GROWTH (PROMOS & TICKETS) */}
                {
                    activeModule === 'growth' && (
                        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                            <div className="bg-gradient-to-br from-fuchsia-600 to-indigo-700 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    {!isScanning ? (
                                        <>
                                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
                                                <ScanLine className="w-8 h-8 text-white" />
                                            </div>
                                            <h3 className="text-xl font-black text-white italic tracking-tight mb-2 uppercase">Validar Portaria</h3>
                                            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-6">Scanner de Ingressos & Vouchers</p>
                                            <button onClick={() => setIsScanning(true)} className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">
                                                ABRIR CÂMERA
                                            </button>
                                        </>
                                    ) : (
                                        <div className="w-full">
                                            <div id="reader" className="w-full rounded-2xl overflow-hidden mb-4 bg-black"></div>
                                            <button onClick={() => setIsScanning(false)} className="px-6 py-2 bg-white/20 text-white rounded-xl text-xs font-bold uppercase">
                                                Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                            </div>

                            {/* Scanner Configuration Effect */}
                            {isScanning && (
                                <ScannerController
                                    onScanSuccess={(decodedText) => {
                                        trigger('success');
                                        setIsScanning(false);
                                        alert(`Ingresso Válido! Cód: ${decodedText}`);
                                    }}
                                    onScanFailure={(error) => {
                                        // console.warn(error);
                                    }}
                                />
                            )}

                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 ml-2">
                                    <Flame className="w-4 h-4 text-orange-500" /> Promoções Instantâneas
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <button className="bg-[#1F2937] p-5 rounded-[2rem] border border-slate-700 flex items-center justify-between active:scale-[0.98] transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20 group-hover:bg-orange-500 transition-all"><Beer className="w-6 h-6 text-orange-500 group-hover:text-white" /></div>
                                            <div className="text-left">
                                                <h4 className="text-sm font-black text-white italic uppercase leading-none">Flash Happy Hour</h4>
                                                <p className="text-[10px] text-slate-500 font-bold mt-1.5 uppercase">Dobro de Chopp por 30min</p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 transition-colors group-hover:text-white"><Plus className="w-5 h-5" /></div>
                                    </button>
                                    <button className="bg-[#1F2937] p-5 rounded-[2rem] border border-slate-700 flex items-center justify-between active:scale-[0.98] transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-fuchsia-500/10 rounded-2xl border border-fuchsia-500/20 group-hover:bg-fuchsia-500 transition-all"><Users className="w-6 h-6 text-fuchsia-500 group-hover:text-white" /></div>
                                            <div className="text-left">
                                                <h4 className="text-sm font-black text-white italic uppercase leading-none">Bonde Free</h4>
                                                <p className="text-[10px] text-slate-500 font-bold mt-1.5 uppercase">Free p/ Grupos de 5+ pessoas</p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 transition-colors group-hover:text-white"><Plus className="w-5 h-5" /></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* 4. ADMIN (CONFIG) */}
                {
                    activeModule === 'admin' && (
                        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                            <div className="space-y-5">
                                <div className="flex justify-between items-center px-1">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-amber-500" /> Perfil Business
                                    </h3>
                                    {isSaving && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}
                                </div>

                                <div className="relative h-52 rounded-[2.5rem] overflow-hidden border-2 border-slate-700 group shadow-2xl">
                                    <img src={editForm.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" alt="" />
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer backdrop-blur-md" onClick={() => fileInputRef.current?.click()}>
                                        <div className="p-4 bg-white/10 rounded-full border border-white/20 mb-3"><Camera className="w-8 h-8 text-white" /></div>
                                        <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Alterar Foto de Capa</span>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setEditForm(prev => ({ ...prev, imageUrl: reader.result as string }));
                                            reader.readAsDataURL(file);
                                        }
                                    }} />
                                </div>

                                <div className="space-y-4 pt-2">
                                    <AdminInput label="Nome Fantasia" value={editForm.name} onChange={v => setEditForm({ ...editForm, name: v })} onFocus={() => { isEditingRef.current = true; }} onBlur={() => { isEditingRef.current = false; }} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <AdminInput label="Gênero Musical" value={editForm.currentMusic} onChange={v => setEditForm({ ...editForm, currentMusic: v })} onFocus={() => { isEditingRef.current = true; }} onBlur={() => { isEditingRef.current = false; }} />
                                        <AdminInput label="Lotação Máx" value={500} type="number" readOnly />
                                    </div>
                                    <AdminInput label="Horário de Atendimento" value={editForm.openingHours} onChange={v => setEditForm({ ...editForm, openingHours: v })} onFocus={() => { isEditingRef.current = true; }} onBlur={() => { isEditingRef.current = false; }} />
                                    <AdminInput label="Bio do Local" value={editForm.description} onChange={v => setEditForm({ ...editForm, description: v })} onFocus={() => { isEditingRef.current = true; }} onBlur={() => { isEditingRef.current = false; }} isTextArea />
                                </div>

                                <button onClick={handleSaveConfig} disabled={isSaving} className="w-full py-5 bg-[var(--primary)] text-black rounded-[1.5rem] font-black uppercase text-xs tracking-[0.25em] shadow-xl active:scale-98 transition-all flex items-center justify-center gap-3 mt-4">
                                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                    ATUALIZAR PERFIL PRO
                                </button>
                            </div>

                            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2.5rem] flex items-center justify-between mt-12 mb-10 shadow-lg">
                                <div className="min-w-0">
                                    <h4 className="text-red-500 font-black uppercase text-xs tracking-widest italic mb-1">Encerrar Noite</h4>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase leading-tight">Limpa o mapa e arquiva faturamento</p>
                                </div>
                                <button onClick={async () => { if (confirm("Deseja fechar a casa?")) { await db.places.update({ id: placeId, peopleCount: 0, capacityPercentage: 0, activeCalls: [] }); alert("Noite encerrada!"); onClose?.(); } }} className="bg-red-500 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase active:scale-95 transition-all shadow-lg shadow-red-500/20">FECHAR CASA</button>
                            </div>
                        </div>
                    )
                }
            </div >

            {
                showAddModal && (
                    <AddMenuItemModal
                        onClose={() => { setShowAddModal(false); setEditingItem(undefined); }}
                        onSave={handleSaveMenuItem}
                        editingItem={editingItem}
                    />
                )
            }

            <style>{`
            .scroll-container::-webkit-scrollbar { display: none; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 22px;
                width: 22px;
                border-radius: 50%;
                background: var(--primary);
                cursor: pointer;
                box-shadow: 0 0 15px var(--primary-glow);
                border: 3px solid white;
                margin-top: -8px;
            }
        `}</style>
        </div >
    );
};

const NavTab = ({ active, label, icon, onClick, badge }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void, badge?: number }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-2 px-6 py-4 transition-all min-w-[25%] relative border-b-4 ${active ? 'text-[var(--primary)] bg-[var(--primary)]/5 border-[var(--primary)]' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
        <div className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
            {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{label}</span>
        {badge !== undefined && badge > 0 && (
            <div className="absolute top-2 right-4 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[8px] font-black text-white border-2 border-[#1F2937] animate-pulse shadow-lg">
                {badge}
            </div>
        )}
    </button>
);

const KPICard = ({ label, value, trend, icon }: any) => (
    <div className="bg-[#1F2937] p-5 rounded-[2rem] border border-slate-700 shadow-xl group hover:border-[var(--primary)]/30 transition-colors">
        <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-slate-800 rounded-xl group-hover:bg-[var(--primary)]/10 transition-colors">{icon}</div>
            <div className="flex items-center gap-1 text-[9px] font-black uppercase text-green-500">
                <TrendingUp className="w-3 h-3" /> {trend}
            </div>
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-white italic tracking-tighter group-hover:scale-105 transition-transform origin-left">{value}</p>
    </div>
);

const AdminInput = ({ label, value, onChange, isTextArea, type = "text", readOnly = false, onFocus, onBlur }: any) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-500 uppercase ml-3 tracking-[0.2em]">{label}</label>
        {isTextArea ? (
            <textarea value={value || ''} onChange={e => onChange?.(e.target.value)} onFocus={onFocus} onBlur={onBlur} rows={3} readOnly={readOnly} className="w-full bg-slate-800/80 border border-slate-700 rounded-[1.5rem] px-5 py-4 text-white focus:border-[var(--primary)] focus:outline-none font-medium resize-none shadow-inner transition-all focus:bg-slate-800" />
        ) : (
            <input type={type} value={value || ''} onChange={e => onChange?.(e.target.value)} onFocus={onFocus} onBlur={onBlur} readOnly={readOnly} className="w-full bg-slate-800/80 border border-slate-700 rounded-[1.5rem] px-5 py-4 text-white focus:border-[var(--primary)] focus:outline-none font-black italic shadow-inner transition-all focus:bg-slate-800 disabled:opacity-50" />
        )}
    </div>
);

const Beer = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 11h1a3 3 0 0 1 0 6h-1" />
        <path d="M9 12v6" />
        <path d="M13 12v6" />
        <path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.5.5 2.5.5s1.44-.5 3-.5 2 .5 3 .5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z" />
        <path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
    </svg>
);

const ScannerController = ({ onScanSuccess, onScanFailure }: { onScanSuccess: (t: string) => void, onScanFailure: (e: any) => void }) => {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );
        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            scanner.clear().catch(console.error);
        };
    }, []);
    return null;
};
