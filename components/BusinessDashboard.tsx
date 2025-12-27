import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddMenuItemModal } from './AddMenuItemModal';
import { Place, MenuItem, StaffCall } from '../types';
import { db } from '../utils/storage';
import { useHaptic } from '../hooks/useHaptic';
import { getBusinessInsights } from '../services/geminiService';
import { fadeIn, slideUp, scaleIn } from '../src/styles/animations';
import {
    BarChart3, Users, Zap, Settings,
    Save, BellRing, TrendingUp,
    Utensils,
    Sparkles, Plus, ClipboardList,
    Clock, Megaphone, Loader2, X,
    DollarSign, Activity,
    Camera, Edit3, Trash2, RefreshCw,
    Flame, Disc, Heart, Mic2, ScanLine, Layers
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeModule } from './QRCodeModule';

interface BusinessDashboardProps {
    placeId: string;
    placeData?: Place; // Received from App > Profile parent
    onClose?: () => void;
}

type AdminModule = 'metrics' | 'ops' | 'growth' | 'admin';

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ placeId, placeData, onClose }) => {
    const { trigger } = useHaptic();
    const [localPlace, setLocalPlace] = useState<Place | null>(placeData || null);
    const place = localPlace;

    useEffect(() => {
        if (placeData) {
            setLocalPlace(placeData);
        }
    }, [placeData]);


    const [activeModule, setActiveModule] = useState<AdminModule>('metrics');

    const [capacity, setCapacity] = useState(0);
    const [insight, setInsight] = useState<string>("Analisando movimentação da casa...");
    const [loadingInsight, setLoadingInsight] = useState(false);
    const [activeOpsTab, setActiveOpsTab] = useState<'orders' | 'menu' | 'live'>('orders');
    const [isFiringHype, setIsFiringHype] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | undefined>(undefined);
    const [visitsByHour, setVisitsByHour] = useState<Record<number, number>>({});

    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Place>>({
        name: place?.name || '',
        description: place?.description || '',
        currentMusic: place?.currentMusic || '',
        openingHours: place?.openingHours || ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (place) {
            setEditForm({
                name: place.name,
                description: place.description,
                currentMusic: place.currentMusic,
                openingHours: place.openingHours
            });
            setCapacity(place.capacityPercentage);

            // Fetch real metrics
            db.metrics.getVisitsByHour(place.id).then(setVisitsByHour);
        }
    }, [place]);

    const updateCallStatus = async (id: string, status: StaffCall['status']) => {
        if (!place) return;
        trigger('medium');

        const oldCalls = place.activeCalls || [];
        const newCalls = oldCalls.map(c => c.id === id ? { ...c, status } : c);
        setLocalPlace({ ...place, activeCalls: newCalls });

        try {
            const updated = await db.places.update({ id: place.id, activeCalls: newCalls });
            if (!updated) throw new Error("Update failed");
            trigger('success');
        } catch (e) {
            console.error("Erro ao atualizar status do pedido:", e);
            setLocalPlace({ ...place, activeCalls: oldCalls });
            alert("Erro ao atualizar pedido. Tente novamente.");
        }
    };

    const deleteCall = async (id: string) => {
        if (!place) return;
        trigger('heavy');

        const oldCalls = place.activeCalls || [];
        const newCalls = oldCalls.filter(c => c.id !== id);
        setLocalPlace({ ...place, activeCalls: newCalls });

        try {
            const updated = await db.places.update({ id: place.id, activeCalls: newCalls });
            if (!updated) throw new Error("Delete failed");
            trigger('success');
        } catch (e) {
            setLocalPlace({ ...place, activeCalls: oldCalls });
            alert("Erro ao remover pedido.");
        }
    };

    const toggleMenuItem = async (itemId: string) => {
        if (!place || !place.menu) return;
        trigger('light');

        const oldMenu = [...place.menu];
        const newMenu = oldMenu.map(item => item.id === itemId ? { ...item, available: !item.available } : item);
        setLocalPlace({ ...place, menu: newMenu });

        try {
            const updated = await db.places.update({ id: place.id, menu: newMenu });
            if (!updated) throw new Error("Toggle failed");
        } catch (e) {
            setLocalPlace({ ...place, menu: oldMenu });
        }
    };

    const handleSaveMenuItem = async (item: MenuItem) => {
        if (!place) return;
        trigger('medium');

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
            setLocalPlace({ ...place, menu: oldMenu });
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
            setLocalPlace({ ...place, menu: oldMenu });
        }
    };

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
            setLocalPlace(oldState);
            alert("Erro ao salvar configurações.");
        }
    };

    const handleHypeAlert = async () => {
        if (!place) return;
        trigger('heavy');
        setIsFiringHype(true);

        try {
            await db.metrics.broadcastHype(place, "PISTA LOTADA E SOM NO TALO! 🔥");
            setTimeout(() => {
                setIsFiringHype(false);
                alert("HYPE ALERT disparado com sucesso!");
            }, 1000);
        } catch (e) {
            setIsFiringHype(false);
        }
    };

    const generateNewInsight = async () => {
        if (!place) return;
        setLoadingInsight(true);
        trigger('medium');
        try {
            const stats = { occupancy: capacity, people: place.peopleCount, pendingCalls: place.activeCalls?.filter(c => c.status === 'pending').length || 0 };
            const newInsight = await getBusinessInsights(place.name, stats);
            setInsight(newInsight);
        } catch (e) {
            console.error("Erro insight:", e);
        } finally {
            setLoadingInsight(false);
        }
    };

    const totals = useMemo(() => {
        if (!place) return { revenue: 0, orders: 0, male: 45, female: 52, others: 3 };
        const revenue = (place.peopleCount * 62.50) + (place.activeCalls?.length || 0) * 18.20;
        const pending = place.activeCalls?.filter(c => c.status === 'pending').length || 0;
        return { revenue, orders: pending, male: 42, female: 55, others: 3 };
    }, [place]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    if (!place) {
        return (
            <div className="flex-1 bg-[#0B0F19] flex flex-col p-8 space-y-6">
                <div className="h-12 w-48 bg-slate-800 rounded-xl animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-slate-800 rounded-3xl animate-pulse" />
                    <div className="h-32 bg-slate-800 rounded-3xl animate-pulse" />
                </div>
                <div className="h-64 bg-slate-800 rounded-[2rem] animate-pulse" />
                <div className="flex flex-col items-center justify-center pt-10 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Sincronizando Dados Pro...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0B0F19] h-full flex flex-col overflow-hidden">

            {/* PRO HEADER */}
            <div className="bg-[#1F2937] p-4 border-b border-slate-700 shadow-2xl shrink-0 flex items-center justify-between z-40">
                <div className="flex items-center gap-3">
                    <motion.div variants={scaleIn} initial="initial" animate="animate" className="w-12 h-12 rounded-2xl bg-indigo-600 border border-white/10 overflow-hidden shadow-inner shrink-0">
                        <img src={place.imageUrl} className="w-full h-full object-cover" alt="" />
                    </motion.div>
                    <div className="min-w-0">
                        <motion.h2 variants={fadeIn} initial="initial" animate="animate" className="text-base font-black text-white italic truncate uppercase leading-none tracking-tight">{place.name}</motion.h2>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="flex items-center gap-1 text-cyan-400 text-[9px] font-black uppercase bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 tracking-widest">
                                <Activity className="w-2.5 h-2.5" /> LIVE DASHBOARD
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={handleHypeAlert} className={`p-2.5 rounded-xl text-white shadow-lg transition-all ${isFiringHype ? 'bg-fuchsia-500 animate-pulse' : 'bg-slate-800 border border-slate-700 text-fuchsia-500'}`}>
                        <Megaphone className="w-5 h-5" />
                    </motion.button>
                    {onClose && (
                        <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 border border-slate-700">
                            <X className="w-5 h-5" />
                        </motion.button>
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
                <AnimatePresence mode="wait">
                    {/* 1. MÉTTRICAS AVANÇADAS */}
                    {activeModule === 'metrics' && (
                        <motion.div
                            key="metrics"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <motion.div variants={slideUp}><KPICard label="Receita Estimada" value={`R$ ${totals.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} trend="+22%" icon={<DollarSign className="w-4 h-4 text-emerald-500" />} /></motion.div>
                                <motion.div variants={slideUp}><KPICard label="Pessoas na Casa" value={`${place.peopleCount}`} trend="+14%" icon={<Users className="w-4 h-4 text-indigo-400" />} /></motion.div>
                            </div>

                            <motion.div variants={slideUp} className="bg-[#1F2937] p-6 rounded-[2rem] border border-slate-700 shadow-xl">
                                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                                    <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-fuchsia-500" /> Fluxo de Pessoas</span>
                                    <span className="text-[9px] text-slate-500">Últimas 24h</span>
                                </h3>

                                <div className="h-40 flex items-end gap-1 px-2 mb-2">
                                    {Array.from({ length: 24 }).map((_, i) => {
                                        const hour = (new Date().getHours() - (23 - i) + 24) % 24;
                                        const count = visitsByHour[hour] || 0;
                                        const max = Math.max(...Object.values(visitsByHour), 1);
                                        const height = (count / max) * 100;

                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                                <div className="w-full relative flex items-end justify-center min-h-[4px]">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${Math.max(4, height)}%` }}
                                                        className={`w-full rounded-t-sm transition-colors ${count === max ? 'bg-[var(--primary-main)]' : 'bg-slate-700 group-hover:bg-slate-600'}`}
                                                    />
                                                </div>
                                                <span className="text-[7px] font-bold text-slate-600 group-hover:text-slate-400">{hour}h</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            <motion.div variants={slideUp} className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-[10px] font-black text-indigo-100 uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" /> IA Business Insight
                                        </h3>
                                        <button onClick={generateNewInsight} disabled={loadingInsight} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 active:scale-90 transition-all">
                                            {loadingInsight ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <AnimatePresence mode="wait">
                                        <motion.p key={insight} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-white font-bold leading-relaxed italic text-sm">"{insight}"</motion.p>
                                    </AnimatePresence>
                                </div>
                                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* 2. OPERAÇÕES (KDS & DJ) */}
                    {activeModule === 'ops' && (
                        <motion.div
                            key="ops"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            className="space-y-6"
                        >
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

                            <AnimatePresence mode="wait">
                                {activeOpsTab === 'menu' && (
                                    <motion.div key="tab_menu" variants={fadeIn} initial="initial" animate="animate" exit="exit" className="space-y-4">
                                        <div className="flex justify-between items-center mb-2 px-1">
                                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                <Utensils className="w-4 h-4 text-cyan-400" /> Gestão do Cardápio
                                            </h3>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => { setEditingItem(undefined); setShowAddModal(true); }}
                                                className="p-2 bg-indigo-600 rounded-xl text-white flex items-center gap-2 text-[9px] font-black uppercase shadow-lg"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> Adicionar
                                            </motion.button>
                                        </div>
                                        {(place.menu || []).length === 0 ? (
                                            <div className="p-8 text-center border border-slate-700 border-dashed rounded-3xl opacity-50">
                                                <p className="text-xs font-bold text-slate-400">Nenhum item cadastrado no cardápio.</p>
                                            </div>
                                        ) : (
                                            place.menu?.map(item => (
                                                <motion.div key={item.id} variants={slideUp} className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all">
                                                    <div className="flex items-center justify-between p-4">
                                                        <div onClick={() => toggleMenuItem(item.id)} className="flex items-center gap-4 flex-1 cursor-pointer select-none active:opacity-70 transition-opacity">
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
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">R$ {item.price.toFixed(2)} • {item.category}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setEditingItem(item); setShowAddModal(true); }} className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"><Edit3 className="w-4 h-4" /></motion.button>
                                                            <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => handleDeleteMenuItem(item.id, e)} className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></motion.button>
                                                            <button onClick={(e) => { e.stopPropagation(); toggleMenuItem(item.id); }} className={`w-12 h-6 rounded-full p-1 transition-all flex items-center shadow-inner ${item.available ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                                                <motion.div animate={{ x: item.available ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-lg" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </motion.div>
                                )}

                                {activeOpsTab === 'orders' && (
                                    <motion.div key="tab_orders" variants={fadeIn} initial="initial" animate="animate" exit="exit" className="space-y-3">
                                        {(place.activeCalls || []).length === 0 ? (
                                            <div className="py-24 text-center opacity-30 flex flex-col items-center">
                                                <BellRing className="w-16 h-16 mb-4 stroke-[1]" />
                                                <p className="text-sm font-black uppercase tracking-widest italic">Bar tranquilo por enquanto</p>
                                            </div>
                                        ) : (
                                            place.activeCalls?.map(call => (
                                                <motion.div key={call.id} variants={slideUp} className={`p-5 rounded-3xl border transition-all ${call.status === 'pending' ? 'bg-slate-800 border-indigo-500/40 shadow-xl' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-3 rounded-2xl ${call.type === 'Pedido' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                                {call.type === 'Pedido' ? <Utensils className="w-6 h-6" /> : <DollarSign className="w-6 h-6" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-black text-base italic leading-tight">{call.userName}</p>
                                                                <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 flex items-center gap-2">
                                                                    <Clock className="w-3 h-3" /> {call.timestamp}
                                                                    {call.status === 'preparing' && <span className="text-amber-500 font-extrabold ml-1 animate-pulse">● Preparando</span>}
                                                                    {call.status === 'ready' && <span className="text-emerald-400 font-extrabold ml-1">● Pronto</span>}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {call.status === 'pending' && <motion.button whileTap={{ scale: 0.95 }} onClick={() => updateCallStatus(call.id, 'preparing')} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg">Atender</motion.button>}
                                                            {call.status === 'preparing' && <motion.button whileTap={{ scale: 0.95 }} onClick={() => updateCallStatus(call.id, 'ready')} className="bg-amber-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg">Pronto</motion.button>}
                                                            {call.status === 'ready' && <motion.button whileTap={{ scale: 0.95 }} onClick={() => updateCallStatus(call.id, 'done')} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg">Entregar</motion.button>}
                                                            {call.status === 'done' && <motion.button whileTap={{ scale: 0.9 }} onClick={() => deleteCall(call.id)} className="p-2.5 text-slate-600 hover:text-white"><Trash2 className="w-5 h-5" /></motion.button>}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </motion.div>
                                )}

                                {activeOpsTab === 'live' && (
                                    <motion.div key="tab_live" variants={fadeIn} initial="initial" animate="animate" exit="exit" className="space-y-6">
                                        <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 shadow-xl">
                                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2"><Mic2 className="w-4 h-4 text-indigo-400" /> Ao Vivo Agora</h3>
                                            <div className="space-y-4">
                                                <AdminInput label="Artista / Banda" value={editForm.currentMusic} onChange={(v: string) => setEditForm({ ...editForm, currentMusic: v })} />
                                                <motion.button whileTap={{ scale: 0.98 }} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Banner Pro Público</motion.button>
                                            </div>
                                        </div>

                                        <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 shadow-xl">
                                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2"><Disc className="w-4 h-4 text-fuchsia-500" /> Pedidos de Música</h3>
                                            <div className="space-y-3">
                                                {[
                                                    { song: 'Solteiro Forçado', artist: 'Ana Castela', votes: 24 },
                                                    { song: 'Erro Gostoso', artist: 'Simone Mendes', votes: 18 }
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
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* 3. GROWTH (PROMOS & TICKETS) */}
                    {activeModule === 'growth' && (
                        <motion.div
                            key="growth"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            className="space-y-6"
                        >
                            <motion.div variants={slideUp} className="bg-gradient-to-br from-fuchsia-600 to-indigo-700 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    {!isScanning ? (
                                        <>
                                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
                                                <ScanLine className="w-8 h-8 text-white" />
                                            </div>
                                            <h3 className="text-xl font-black text-white italic tracking-tight mb-2 uppercase">Validar Portaria</h3>
                                            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-6">Scanner de Ingressos</p>
                                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsScanning(true)} className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black uppercase text-xs shadow-xl">
                                                ABRIR CÂMERA
                                            </motion.button>
                                        </>
                                    ) : (
                                        <div className="w-full">
                                            <div id="reader" className="w-full rounded-2xl overflow-hidden mb-4 bg-black"></div>
                                            <button onClick={() => setIsScanning(false)} className="px-6 py-2 bg-white/20 text-white rounded-xl text-xs font-bold uppercase">Cancelar</button>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                            </motion.div>

                            {isScanning && (
                                <ScannerController
                                    onScanSuccess={(decodedText) => {
                                        trigger('success');
                                        setIsScanning(false);
                                        alert(`Ingresso Válido! Cód: ${decodedText}`);
                                    }}
                                    onScanFailure={() => { }}
                                />
                            )}

                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 ml-2"><Flame className="w-4 h-4 text-orange-500" /> Promoções</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <motion.button variants={slideUp} className="bg-[#1F2937] p-5 rounded-[2rem] border border-slate-700 flex items-center justify-between active:scale-[0.98] transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20 group-hover:bg-orange-500 transition-all text-orange-500 group-hover:text-white"><Zap className="w-6 h-6" /></div>
                                            <div className="text-left">
                                                <h4 className="text-sm font-black text-white italic uppercase leading-none">Flash Happy Hour</h4>
                                                <p className="text-[10px] text-slate-500 font-bold mt-1.5 uppercase">Dobro de Chopp por 30min</p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-white"><Plus className="w-5 h-5" /></div>
                                    </motion.button>
                                </div>
                            </div>

                            <motion.div variants={slideUp} className="mt-8">
                                <QRCodeModule placeId={place.id} placeName={place.name} />
                            </motion.div>
                        </motion.div>
                    )}

                    {/* 4. ADMIN (CONFIG) */}
                    {activeModule === 'admin' && (
                        <motion.div
                            key="admin"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            className="space-y-6"
                        >
                            <div className="space-y-5">
                                <div className="flex justify-between items-center px-1">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2"><Layers className="w-4 h-4 text-amber-500" /> Perfil Business</h3>
                                    {isSaving && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}
                                </div>

                                <motion.div variants={slideUp} className="relative h-52 rounded-[2.5rem] overflow-hidden border-2 border-slate-700 group shadow-2xl">
                                    <img src={editForm.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" alt="" />
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer backdrop-blur-md" onClick={() => fileInputRef.current?.click()}>
                                        <div className="p-4 bg-white/10 rounded-full border border-white/20 mb-3"><Camera className="w-8 h-8 text-white" /></div>
                                        <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Alterar Foto</span>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setEditForm((prev: any) => ({ ...prev, imageUrl: reader.result as string }));
                                            reader.readAsDataURL(file);
                                        }
                                    }} />
                                </motion.div>

                                <motion.div variants={slideUp} className="space-y-4 pt-2">
                                    <AdminInput label="Nome Fantasia" value={editForm.name} onChange={(v: string) => setEditForm({ ...editForm, name: v })} />
                                    <AdminInput label="Gênero Musical" value={editForm.currentMusic} onChange={(v: string) => setEditForm({ ...editForm, currentMusic: v })} />
                                    <AdminInput label="Horário" value={editForm.openingHours} onChange={(v: string) => setEditForm({ ...editForm, openingHours: v })} />
                                    <AdminInput label="Bio" value={editForm.description} onChange={(v: string) => setEditForm({ ...editForm, description: v })} isTextArea />
                                </motion.div>

                                <motion.button variants={slideUp} onClick={handleSaveConfig} disabled={isSaving} className="w-full py-5 bg-[var(--primary)] text-black rounded-[1.5rem] font-black uppercase text-xs tracking-[0.25em] shadow-xl active:scale-98 transition-all flex items-center justify-center gap-3 mt-4">
                                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                    ATUALIZAR PERFIL PRO
                                </motion.button>
                            </div>

                            <motion.div variants={fadeIn} className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2.5rem] flex items-center justify-between mt-12 mb-10 shadow-lg">
                                <div className="min-w-0">
                                    <h4 className="text-red-500 font-black uppercase text-xs tracking-widest italic mb-1">Encerrar Noite</h4>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase leading-tight">Limpa o mapa e arquiva</p>
                                </div>
                                <button onClick={async () => { if (confirm("Deseja fechar a casa?")) { await db.places.update({ id: placeId, peopleCount: 0, capacityPercentage: 0, activeCalls: [] }); alert("Noite encerrada!"); onClose?.(); } }} className="bg-red-500 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase active:scale-95 transition-all shadow-lg">FECHAR</button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >

            <AnimatePresence>
                {showAddModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200]">
                        <AddMenuItemModal
                            onClose={() => { setShowAddModal(false); setEditingItem(undefined); }}
                            onSave={handleSaveMenuItem}
                            editingItem={editingItem}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

const NavTab = ({ active, label, icon, onClick, badge }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void, badge?: number }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-2 px-6 py-4 transition-all min-w-[25%] relative border-b-4 ${active ? 'text-[var(--primary)] bg-[var(--primary)]/5 border-[var(--primary)]' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
        <div className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
            {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{label}</span>
        <AnimatePresence>
            {badge !== undefined && badge > 0 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-2 right-4 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[8px] font-black text-white border-2 border-[#1F2937] shadow-lg"
                >
                    {badge}
                </motion.div>
            )}
        </AnimatePresence>
    </button>
);

const KPICard = ({ label, value, trend, icon }: any) => (
    <div className="bg-[#1F2937] p-5 rounded-[2rem] border border-slate-700 shadow-xl group hover:border-[var(--primary)]/30 transition-colors">
        <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-slate-800 rounded-xl group-hover:bg-[var(--primary)]/10 transition-colors">{icon}</div>
            <div className="flex items-center gap-1 text-[9px] font-black uppercase text-green-500">
                <TrendingUp className="w-3 h-3" /> {trend}Trend
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
