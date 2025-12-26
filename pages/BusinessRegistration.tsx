
import React, { useState } from 'react';
import {
    ArrowLeft, Store, BarChart3, Ticket, Zap, CheckCircle2, Building2,
    Users, DollarSign, Clock, Music, Instagram, Camera, FileText, ChevronRight, MapPin
} from 'lucide-react';
import { Button } from '../components/Button';
import { PlaceType, Place, User } from '../types';
import { useHaptic } from '../hooks/useHaptic';
import { db } from '../utils/storage';
import { generateAIImage } from '../services/geminiService'; // Optional if we want AI avatar

interface BusinessRegistrationProps {
    onBack: () => void;
    onRegisterSuccess?: (user: User) => void; // New Prop to handle auto-login
}

export const BusinessRegistration: React.FC<BusinessRegistrationProps> = ({ onBack, onRegisterSuccess }) => {
    const { trigger } = useHaptic();

    // Steps: 0=Intro, 1=Identity, 2=Operations, 3=Showcase, 4=Contact, 5=Success
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
        password: '', // Added password field for account creation
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
        trigger('medium');
        setStep(prev => prev + 1);
    };

    const handleBackStep = () => {
        trigger('light');
        if (step === 0) onBack();
        else setStep(prev => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        trigger('medium');

        try {
            const pass = formData.password || '123456';

            // 1. REGISTER
            const placeId = `p_${Date.now()}`; // Generate ID upfront
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
                ownedPlaceId: placeId, // Pass the ID immediately
                settings: {
                    ghostMode: false,
                    publicProfile: true,
                    allowTagging: true,
                    notifications: { hypeAlerts: true, chatMessages: true, friendActivity: true }
                }
            };

            // Create Auth User & Trigger Profile
            let resReg = await db.auth.register(newOwnerPartial, pass);

            // AUTO-RECOVERY: If user exists, try to log in (User might have retried after a previous partial failure)
            if (!resReg.success && resReg.message?.includes("already registered")) {
                console.log("Usuário já existe. Tentando login automático...");
                const recoveryLogin = await db.auth.login(formData.email, pass);
                if (recoveryLogin.success && recoveryLogin.user) {
                    resReg = { success: true, data: { user: { id: recoveryLogin.user.id } } };
                } else {
                    alert("Este email já está cadastrado e a senha está incorreta.");
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
            // placeId already generated above

            // 2. LOGIN (Required for RLS to allow INSERT places and UPDATE profile)
            // If we just recovered via login, we are arguably already logged in, 
            // but db.auth.login calls signInWithPassword which sets the session.
            // If we didn't recover, we need to login.
            // Let's just call login again to be safe and ensure session is active for RLS.
            const resLogin = await db.auth.login(formData.email, pass);
            if (!resLogin.success) {
                alert("Conta criada, mas erro ao logar: " + resLogin.message);
                setIsLoading(false);
                return;
            }

            // 3. New Place Object
            const newPlace: Place = {
                id: placeId,
                name: formData.businessName,
                type: formData.category,
                distance: '0.1km', // Initial placeholder
                peopleCount: 0,
                capacityPercentage: 0,
                imageUrl: formData.imagePreview ? formData.imagePreview : `https://source.unsplash.com/800x600/?${formData.category.toLowerCase()},nightclub`,
                isTrending: false,
                description: formData.description,
                coordinates: { x: 50, y: 50 }, // Placeholder
                phoneNumber: formData.phone,
                openingHours: formData.openingHours,
                currentMusic: formData.musicStyle,
                activeCalls: [],
                friendsPresent: [],
                liveRequests: [],
                upcomingEvents: [],
                activePromos: [],
                sentimentScore: 100,
                // crowdInsights: undefined, // Optional field
                ownerId: realOwnerId // bind ownership
            };

            // 3. UPDATE PROFILE & CREATE PLACE
            // Now that we are logged in, we can update our own profile and create the place
            const fullOwner: User = {
                ...newOwnerPartial,
                id: realOwnerId,
                ownedPlaceId: placeId
            };

            // Use Promise.all but checking results
            // Note: db.places.add returns the Place object or null (it doesn't throw usually)
            // db.user.save now returns boolean
            const [saveProfileSuccess, createdPlace] = await Promise.all([
                db.user.save(fullOwner),
                db.places.add(newPlace)
            ]);

            if (!saveProfileSuccess) {
                // Critical failure: Profile didn't update with ownedPlaceId.
                // Retry once
                console.warn("Retrying profile save...");
                const retrySuccess = await db.user.save(fullOwner);
                if (!retrySuccess) {
                    throw new Error("Falha ao vincular conta empresarial. Tente logar novamente.");
                }
            }

            setRegisteredUser(fullOwner); // Store for finish step

            // Success
            setIsLoading(false);
            trigger('success');
            setStep(5);

        } catch (error: any) {
            console.error("Erro no cadastro", error);
            alert("Erro no processo: " + (error.message || "Tente novamente"));
            setIsLoading(false);
        }
    };

    const handleFinish = async () => {
        // User is already logged in from handleSubmit
        // Reset tutorial flag so they see the onboarding
        localStorage.removeItem('voula_tutorial_seen_v1');

        // Just refresh local state in App
        if (onRegisterSuccess && registeredUser) {
            onRegisterSuccess(registeredUser);
        } else if (onRegisterSuccess) {
            // Fallback just in case
            const user = await db.user.get();
            onRegisterSuccess(user);
        } else {
            onBack();
        }
    };



    // --- COMPONENT: PROGRESS BAR ---
    const ProgressBar = () => (
        <div className="flex gap-1 mb-6 px-1">
            {[1, 2, 3, 4].map((s) => (
                <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[var(--primary)]' : 'bg-slate-800'}`}
                />
            ))}
        </div>
    );

    // --- MOCK DASHBOARD COMPONENT ---
    const MockDashboardPreview = () => (
        <div className="relative mb-8 mx-0 group cursor-default select-none animate-[slideUp_0.4s_ease-out]">
            <div className="absolute -top-3 right-0 z-20 bg-[var(--primary)] text-[var(--on-primary)] text-[10px] font-black uppercase px-2 py-1 rounded-lg shadow-lg transform rotate-2">
                Visão do Dono
            </div>
            <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-4 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                            <Store className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                            <div className="w-20 h-2 bg-slate-700 rounded-full mb-1"></div>
                            <div className="w-12 h-1.5 bg-slate-800 rounded-full"></div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                            <Users className="w-3 h-3" />
                            <span className="text-[9px] font-bold uppercase">Lotação</span>
                        </div>
                        <p className="text-lg font-black text-white flex items-end gap-1">
                            412 <span className="text-[9px] text-green-500 mb-1 font-bold">▲ 92%</span>
                        </p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                            <DollarSign className="w-3 h-3" />
                            <span className="text-[9px] font-bold uppercase">Vendas</span>
                        </div>
                        <p className="text-lg font-black text-[var(--primary)]">R$ 4.2k</p>
                    </div>
                </div>
                <div className="h-16 flex items-end justify-between gap-1 px-1 opacity-80">
                    {[35, 55, 40, 70, 50, 85, 60, 95, 75].map((h, i) => (
                        <div key={i} className="w-full bg-slate-800 rounded-t-sm relative overflow-hidden" style={{ height: '100%' }}>
                            <div
                                style={{ height: `${h}%` }}
                                className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm"
                            ></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // --- SUCCESS SCREEN ---
    if (step === 5) {
        return (
            <div className="h-[100dvh] bg-[#0E1121] flex flex-col items-center justify-center p-8 text-center animate-[fadeIn_0.5s_ease-out]">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50 relative">
                    <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 animate-pulse"></div>
                    <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
                </div>
                <h2 className="text-3xl font-black text-white italic mb-2">TUDO PRONTO!</h2>
                <p className="text-slate-400 mb-8 max-w-xs text-sm leading-relaxed">
                    O <strong>{formData.businessName}</strong> foi cadastrado com sucesso.
                    <br /><br />
                    Seu painel de gerenciamento já está disponível.
                </p>
                <Button variant="neon" onClick={handleFinish}>ACESSAR PAINEL</Button>
            </div>
        );
    }

    // --- INTRO SCREEN ---
    if (step === 0) {
        return (
            <div className="h-[100dvh] bg-[#0E1121] flex flex-col pt-safe relative overflow-hidden animate-[fadeIn_0.3s_ease-out]">
                <div className="absolute top-0 right-0 w-[90vw] h-[90vw] bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none"></div>
                <div className="flex-1 overflow-y-auto px-6 pt-4 pb-40 hide-scrollbar">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-slate-800/50 rounded-full text-slate-300 hover:text-white mb-4 backdrop-blur-sm border border-slate-700">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[var(--primary)] text-[10px] font-bold uppercase tracking-widest border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-2 py-1 rounded-md">
                                Vou Lá Business
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter leading-none mb-3">
                            SEU ROLÊ <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-green-500">NO MAPA.</span>
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Cadastre seu estabelecimento, controle a lotação e venda ingressos direto pelo app.
                        </p>
                    </div>
                    <MockDashboardPreview />
                    <div className="space-y-3">
                        <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-4">
                            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800"><Zap className="w-5 h-5 text-[var(--primary)]" /></div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Radar de Hype</h3>
                                <p className="text-slate-400 text-xs">Destaque quando a casa encher.</p>
                            </div>
                        </div>
                        <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-4">
                            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800"><Ticket className="w-5 h-5 text-fuchsia-500" /></div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Ingressos & Listas</h3>
                                <p className="text-slate-400 text-xs">Gestão completa de entrada.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 pt-8 bg-gradient-to-t from-[#0E1121] via-[#0E1121] to-transparent pb-safe z-10">
                    <Button fullWidth variant="primary" onClick={() => setStep(1)} className="py-4 text-base shadow-xl shadow-indigo-500/20 bg-indigo-600 border-indigo-400 hover:bg-indigo-500">
                        CADASTRAR GRÁTIS <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                    <p className="text-center text-[10px] text-slate-500 mt-3 font-medium">
                        Avaliação gratuita • Sem compromisso
                    </p>
                </div>
            </div>
        );
    }

    // --- HELPERS ---


    // --- WIZARD STEPS ---
    return (
        <div className="h-[100dvh] bg-[#0E1121] flex flex-col pt-safe animate-[slideLeft_0.3s_ease-out]">
            <div className="px-4 py-4 border-b border-slate-800 flex items-center gap-4 bg-[#0E1121] sticky top-0 z-20 shrink-0">
                <button onClick={handleBackStep} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-lg font-black text-white italic tracking-tight leading-none">NOVO PARCEIRO</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Etapa {step} de 4
                    </p>
                </div>
            </div>

            <form onSubmit={step === 4 ? handleSubmit : handleNext} className="flex-1 flex flex-col overflow-hidden relative">
                <div className="flex-1 overflow-y-auto p-6 pb-32">
                    <ProgressBar />

                    {/* STEP 1: IDENTITY */}
                    {step === 1 && (
                        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-white italic mb-1">IDENTIDADE</h3>
                                <p className="text-slate-400 text-sm">Informações básicas para validar seu negócio.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Fantasia</label>
                                    <div className="relative">
                                        <Store className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                        <input required type="text" placeholder="Ex: Bar do Zé" value={formData.businessName} onChange={e => handleChange('businessName', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[var(--primary)] focus:outline-none placeholder-slate-600" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">CNPJ</label>
                                    <input required type="text" placeholder="00.000.000/0001-00" value={formData.cnpj} onChange={e => handleChange('cnpj', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white focus:border-[var(--primary)] focus:outline-none placeholder-slate-600 font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Categoria Principal</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.values(PlaceType).map(type => (
                                            <button key={type} type="button" onClick={() => handleChange('category', type)} className={`p-3 rounded-xl border text-xs font-bold transition-all ${formData.category === type ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--on-primary)] shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: OPERATIONS */}
                    {step === 2 && (
                        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-white italic mb-1">OPERAÇÃO</h3>
                                <p className="text-slate-400 text-sm">Onde fica e como funciona.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Endereço Completo</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                        <input required type="text" placeholder="Rua, Número, Bairro - Cidade/UF" value={formData.address} onChange={e => handleChange('address', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[var(--primary)] focus:outline-none placeholder-slate-600" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Lotação Máx</label>
                                        <input required type="number" placeholder="500" value={formData.capacity} onChange={e => handleChange('capacity', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white focus:border-[var(--primary)] focus:outline-none placeholder-slate-600" inputMode="numeric" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Horário</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                                            <input required type="text" placeholder="22h - 05h" value={formData.openingHours} onChange={e => handleChange('openingHours', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-2 text-white focus:border-[var(--primary)] focus:outline-none placeholder-slate-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SHOWCASE (THE CARD) */}
                    {step === 3 && (
                        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-white italic mb-1">VITRINE</h3>
                                <p className="text-slate-400 text-sm">Como seu local vai aparecer no app.</p>
                            </div>
                            <div className="space-y-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${formData.imagePreview ? 'border-[var(--primary)] bg-[var(--primary)]/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'}`}
                                >
                                    {formData.imagePreview ? (
                                        <div className="flex flex-col items-center text-[var(--primary)]">
                                            <div className="relative w-full h-32 rounded-2xl overflow-hidden">
                                                <img src={formData.imagePreview} className="w-full h-full object-cover opacity-60" />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <CheckCircle2 className="w-8 h-8 mb-2 drop-shadow-md" />
                                                    <span className="text-xs font-bold uppercase drop-shadow-md">Foto Selecionada</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-500">
                                            <Camera className="w-8 h-8 mb-2" />
                                            <span className="text-xs font-bold uppercase">Adicionar Capa</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Pitch (Descrição Curta)</label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                        <input type="text" placeholder="O melhor sertanejo da cidade..." value={formData.description} onChange={e => handleChange('description', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[var(--primary)] focus:outline-none placeholder-slate-600" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Estilo Musical</label>
                                    <div className="relative">
                                        <Music className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                        <input type="text" placeholder="Ex: Funk, Sertanejo, Rock..." value={formData.musicStyle} onChange={e => handleChange('musicStyle', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[var(--primary)] focus:outline-none placeholder-slate-600" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Instagram</label>
                                    <div className="relative">
                                        <Instagram className="absolute left-4 top-3.5 w-5 h-5 text-pink-500" />
                                        <input type="text" placeholder="@seulocal" value={formData.instagram} onChange={e => handleChange('instagram', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[var(--primary)] focus:outline-none placeholder-slate-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: CONTACT & PASSWORD */}
                    {step === 4 && (
                        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-white italic mb-1">RESPONSÁVEL</h3>
                                <p className="text-slate-400 text-sm">Quem vai administrar o painel.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Seu Nome Completo</label>
                                    <input required type="text" placeholder="Nome do Dono/Gerente" value={formData.ownerName} onChange={e => handleChange('ownerName', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white focus:border-[var(--primary)] focus:outline-none placeholder-slate-600" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Corporativo (Login)</label>
                                    <input required type="email" placeholder="contato@empresa.com" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white focus:border-[var(--primary)] focus:outline-none placeholder-slate-600" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Senha de Acesso</label>
                                    <input required type="password" minLength={6} placeholder="Mínimo 6 caracteres" value={formData.password} onChange={e => handleChange('password', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white focus:border-[var(--primary)] focus:outline-none placeholder-slate-600" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
                                    <input required type="tel" placeholder="(00) 00000-0000" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white focus:border-[var(--primary)] focus:outline-none placeholder-slate-600" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0E1121] border-t border-slate-800 pb-safe z-30">
                    <Button fullWidth variant="neon" type="submit" disabled={isLoading}>
                        {isLoading ? 'ENVIANDO...' : step === 4 ? 'FINALIZAR CADASTRO' : 'PRÓXIMO'} <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                </div>
            </form>
        </div>
    );
};
