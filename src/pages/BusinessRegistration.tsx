
import React, { useState } from 'react';
import {
    ArrowLeft, Store, Ticket, Zap, CheckCircle2,
    Users, DollarSign, Clock, Music, Instagram, Camera, FileText, ChevronRight, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { PlaceType, Place, User } from '@/types';
import { triggerHaptic } from '@/utils/haptics';
import { db } from '@/utils/storage';
import { motion, AnimatePresence } from 'framer-motion';

interface BusinessRegistrationProps {
    onBack: () => void;
    onRegisterSuccess?: (user: User) => void;
}

export const BusinessRegistration: React.FC<BusinessRegistrationProps> = ({ onBack, onRegisterSuccess }) => {
    const [step, setStep] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        businessName: '',
        cnpj: '',
        category: PlaceType.BAR,
        capacity: '',
        address: '',
        openingHours: '',
        musicStyle: '',
        description: '',
        instagram: '',
        ownerName: '',
        email: '',
        phone: '',
        password: '',
        imagePreview: null as string | null
    });

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('imagePreview', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const [registeredUser, setRegisteredUser] = useState<User | null>(null);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = (e?: React.FormEvent) => {
        e?.preventDefault();
        triggerHaptic('medium');
        setStep(prev => prev + 1);
    };

    const handleBackStep = () => {
        triggerHaptic('light');
        if (step === 0) onBack();
        else setStep(prev => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        triggerHaptic('medium');

        try {
            const pass = formData.password || '123456';
            const placeId = `p_${Date.now()}`;

            const newOwnerPartial: User = {
                id: '',
                name: formData.ownerName,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.ownerName}`,
                email: formData.email,
                level: 10,
                points: 1000,
                badges: ['Dono de Rolê'],
                memberSince: new Date().toISOString(),
                history: [],
                savedPlaces: [],
                ownedPlaceId: placeId,
                appMode: 'light',
                accentColor: 'neon'
            };

            let resReg = await db.auth.register(newOwnerPartial, pass);

            if (!resReg.success && resReg.message?.includes("already registered")) {
                const recoveryLogin = await db.auth.login(formData.email, pass);
                if (recoveryLogin.success && recoveryLogin.user) {
                    resReg = { success: true, data: { user: { id: recoveryLogin.user.id } } };
                } else {
                    alert("Este email já está cadastrado.");
                    setIsLoading(false);
                    return;
                }
            }

            if (!resReg.success || !resReg.data?.user?.id) {
                alert("Erro ao criar conta: " + (resReg.message || "Erro desconhecido"));
                setIsLoading(false);
                return;
            }

            const realOwnerId = resReg.data.user.id;
            await db.auth.login(formData.email, pass);

            const newPlace: Place = {
                id: placeId,
                name: formData.businessName,
                type: formData.category,
                distance: '0.1km',
                peopleCount: 0,
                capacityPercentage: 0,
                imageUrl: formData.imagePreview ? formData.imagePreview : `/placeholder-place.jpg`,
                isTrending: false,
                description: formData.description,
                coordinates: { x: 50, y: 50 },
                phoneNumber: formData.phone,
                openingHours: formData.openingHours,
                currentMusic: formData.musicStyle,
                ownerId: realOwnerId,
                friendsPresent: [],
                history: []
            } as any;

            const fullOwner: User = {
                ...newOwnerPartial,
                id: realOwnerId,
                ownedPlaceId: placeId
            };

            await Promise.all([
                db.user.save(fullOwner),
                db.places.add(newPlace)
            ]);

            setRegisteredUser(fullOwner);
            setIsLoading(false);
            triggerHaptic('success');
            setStep(5);

        } catch (error: any) {
            alert("Erro no processo: " + (error.message || "Tente novamente"));
            setIsLoading(false);
        }
    };

    const handleFinish = () => {
        localStorage.removeItem('voula_tutorial_seen_v1');
        if (onRegisterSuccess && registeredUser) {
            onRegisterSuccess(registeredUser);
        } else {
            onBack();
        }
    };

    const ProgressBar = () => (
        <div className="flex gap-1.5 mb-8 px-1">
            {[1, 2, 3, 4].map((s) => (
                <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#D9FF00] shadow-[0_0_10px_rgba(217,255,0,0.3)]' : 'bg-gray-100'}`}
                />
            ))}
        </div>
    );

    if (step === 5) {
        return (
            <div className="min-h-[100dvh] bg-[#FDFDFE] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                <AnimatedBackground />
                <div className="w-24 h-24 bg-[#D9FF00]/10 rounded-full flex items-center justify-center mb-8 border border-[#D9FF00]/30 relative">
                    <CheckCircle2 className="w-12 h-12 text-[#D9FF00]" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase italic">Tudo Pronto!</h2>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-10 max-w-xs leading-relaxed">
                    O <strong>{formData.businessName}</strong> foi cadastrado com sucesso. <br />
                    Seu painel já está disponível.
                </p>
                <Button variant="primary" size="lg" fullWidth onClick={handleFinish} className="bg-[#D9FF00] text-black shadow-xl shadow-[#D9FF00]/20 h-14 rounded-2xl font-black italic uppercase">
                    ACESSAR PAINEL
                </Button>
            </div>
        );
    }

    if (step === 0) {
        return (
            <div className="min-h-[100dvh] bg-[#FDFDFE] flex flex-col p-6 pt-safe relative overflow-hidden">
                <AnimatedBackground />
                <button onClick={onBack} className="w-11 h-11 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-full text-gray-800 shadow-sm border border-gray-100 mb-8 active:scale-95 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-[#D9FF00]/10 text-[#D9FF00] text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-[#D9FF00]/20 backdrop-blur-sm">
                            Vou Lá Business
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 leading-[0.9] tracking-tighter mb-4 uppercase italic">
                        SEU ROLÊ <br />
                        <span className="text-[#D9FF00] drop-shadow-sm">NO MAPA.</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-10 max-w-[280px]">
                        Cadastre seu estabelecimento, controle a lotação e venda ingressos.
                    </p>

                    <div className="space-y-3">
                        <Card className="rounded-[32px] border-gray-100 shadow-xl p-5 bg-white/80 backdrop-blur-xl flex items-center gap-4 group hover:border-[#D9FF00]/30 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-[#D9FF00]/5 flex items-center justify-center group-hover:bg-[#D9FF00]/10 transition-colors">
                                <Zap className="w-6 h-6 text-gray-900" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Radar de Hype</h3>
                                <p className="text-[10px] text-gray-400 font-medium">Destaque quando a casa encher.</p>
                            </div>
                        </Card>
                        <Card className="rounded-[32px] border-gray-100 shadow-xl p-5 bg-white/80 backdrop-blur-xl flex items-center gap-4 group hover:border-blue-100 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100/50 transition-colors">
                                <Ticket className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Ingressos & Listas</h3>
                                <p className="text-[10px] text-gray-400 font-medium">Gestão completa de entrada.</p>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="mt-8 pb-safe">
                    <Button fullWidth size="lg" onClick={() => setStep(1)} className="bg-[#D9FF00] text-black shadow-xl shadow-[#D9FF00]/20 h-15 rounded-2xl font-black italic uppercase tracking-tighter" rightIcon={<ChevronRight className="w-5 h-5" />}>
                        QUERO SER PARCEIRO
                    </Button>
                    <p className="text-center text-[9px] text-gray-300 mt-4 font-black uppercase tracking-widest">
                        Avaliação gratuita • Sem compromisso
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-[#FDFDFE] flex flex-col p-6 pt-safe relative overflow-hidden">
            <AnimatedBackground />

            <div className="flex items-center gap-4 mb-8">
                <button onClick={handleBackStep} className="w-10 h-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-full text-gray-800 shadow-sm border border-gray-100 active:scale-95 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">Novo Parceiro</h2>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Passo {step} de 4</p>
                </div>
            </div>

            <ProgressBar />

            <form onSubmit={step === 4 ? handleSubmit : handleNext} className="flex-1 flex flex-col">
                <div className="flex-1 space-y-8 overflow-y-auto hide-scrollbar pb-32">
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nome Fantasia</label>
                                <div className="relative">
                                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    <input required placeholder="Ex: Bar do Zé" value={formData.businessName} onChange={e => handleChange('businessName', e.target.value)} className="w-full h-14 bg-gray-50/30 border border-gray-100 rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-[#D9FF00]/40 focus:outline-none focus:bg-white transition-all" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">CNPJ</label>
                                <input required placeholder="00.000.000/0001-00" value={formData.cnpj} onChange={e => handleChange('cnpj', e.target.value)} className="w-full h-14 bg-gray-50/30 border border-gray-100 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#D9FF00]/40 focus:outline-none focus:bg-white transition-all" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Categoria</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.values(PlaceType).map(type => (
                                        <button key={type} type="button" onClick={() => handleChange('category', type)} className={`h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.category === type ? 'bg-[#D9FF00] border-[#D9FF00] text-black shadow-md' : 'bg-white/50 border-gray-100 text-gray-400'}`}>
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Endereço</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    <input required placeholder="Rua, Número, Bairro" value={formData.address} onChange={e => handleChange('address', e.target.value)} className="w-full h-14 bg-gray-50/30 border border-gray-100 rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-[#D9FF00]/40 focus:outline-none focus:bg-white transition-all" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Lotação</label>
                                    <input required type="number" placeholder="500" value={formData.capacity} onChange={e => handleChange('capacity', e.target.value)} className="w-full h-14 bg-gray-50/30 border border-gray-100 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#D9FF00]/40 focus:outline-none focus:bg-white transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Horário</label>
                                    <input required placeholder="22h - 05h" value={formData.openingHours} onChange={e => handleChange('openingHours', e.target.value)} className="w-full h-14 bg-gray-50/30 border border-gray-100 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#D9FF00]/40 focus:outline-none focus:bg-white transition-all" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Foto de Capa</label>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                            <div onClick={() => fileInputRef.current?.click()} className="w-full h-40 rounded-[32px] border-2 border-dashed border-gray-100 bg-gray-50/30 flex flex-col items-center justify-center gap-3 overflow-hidden cursor-pointer relative group">
                                {formData.imagePreview ? (
                                    <>
                                        <img src={formData.imagePreview} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-8 h-8 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Camera className="w-8 h-8 text-gray-300" />
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Adicionar Foto</span>
                                    </>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Descrição Curta</label>
                                <input placeholder="O melhor do centro..." value={formData.description} onChange={e => handleChange('description', e.target.value)} className="w-full h-14 bg-gray-50/30 border border-gray-100 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#D9FF00]/40 focus:outline-none focus:bg-white transition-all" />
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Proprietário</label>
                                <input required placeholder="Nome completo" value={formData.ownerName} onChange={e => handleChange('ownerName', e.target.value)} className="w-full h-14 bg-gray-50/30 border border-gray-100 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#D9FF00]/40 focus:outline-none focus:bg-white transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">E-mail</label>
                                <input required type="email" placeholder="contato@local.com" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="w-full h-14 bg-gray-50/30 border border-gray-100 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#D9FF00]/40 focus:outline-none focus:bg-white transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Senha</label>
                                <input required type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={e => handleChange('password', e.target.value)} className="w-full h-14 bg-gray-50/30 border border-gray-100 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#D9FF00]/40 focus:outline-none focus:bg-white transition-all" />
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#FDFDFE]/80 backdrop-blur-lg border-t border-gray-50/50 pb-safe">
                    <Button fullWidth size="lg" type="submit" isLoading={isLoading} className="bg-[#D9FF00] text-black h-15 rounded-2xl shadow-xl shadow-[#D9FF00]/20 font-black italic uppercase tracking-tighter" rightIcon={<ChevronRight className="w-5 h-5" />}>
                        {step === 4 ? 'FINALIZAR' : 'PRÓXIMO'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
