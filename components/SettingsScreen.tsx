import React, { useState, useRef, useEffect } from 'react';
import { User, PrivacySettings } from '../types';
import { X, Moon, Bell, Shield, Lock, LogOut, ChevronRight, UserMinus, Palette, Globe, HelpCircle, FileText, Smartphone, Database, RefreshCw, Edit3, KeyRound, AlertTriangle, ArrowLeft, Camera, Instagram, Twitter, Video, User as UserIcon, Download } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic';
import { Button } from './Button';
import { db } from '../utils/storage';
import { checkSupabaseConnection } from '../services/supabase';
import { usePWA } from '../hooks/usePWA';

interface SettingsScreenProps {
    user: User;
    onClose: () => void;
    onLogout: () => void;
    onDeleteAccount?: () => void;
    onUpdateSettings?: (settings: PrivacySettings, mode?: 'light' | 'dark', accent?: 'purple' | 'neon' | 'cyan' | 'pink') => void;
    onUpdateUser?: (user: Partial<User>) => void;
    onEditProfile?: () => void; // Kept for backward compatibility if needed, but we use internal flow now
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ user, onClose, onLogout, onDeleteAccount, onUpdateSettings, onUpdateUser }) => {
    const { trigger } = useHaptic();

    // -- SETTINGS STATE --
    const [settings, setSettings] = useState<PrivacySettings>(user.settings || {
        ghostMode: false,
        publicProfile: true,
        allowTagging: true,
        notifications: {
            hypeAlerts: true,
            chatMessages: true,
            friendActivity: true
        }
    });

    const [appMode, setAppMode] = useState<'light' | 'dark'>(user.appMode || 'dark');
    const [themeColor, setThemeColor] = useState<'purple' | 'neon' | 'cyan' | 'pink'>(user.themeColor || 'neon');
    const [clearingCache, setClearingCache] = useState(false);

    // -- MODALS / INTERNAL NAVIGATION STATE --
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showTextModal, setShowTextModal] = useState<{ title: string, content: React.ReactNode } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false); // New Internal Edit Mode

    // PWA Hook
    const { deferredPrompt, install, isInstalled } = usePWA();

    // -- PROFILE EDIT FORM STATE --
    const [profileForm, setProfileForm] = useState<Partial<User>>({
        name: user.name,
        bio: user.bio,
        instagram: user.instagram,
        tiktok: user.tiktok,
        twitter: user.twitter,
        avatar: user.avatar
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // -- NEW STATES --
    const [showBlockedModal, setShowBlockedModal] = useState(false);
    const [showDataModal, setShowDataModal] = useState(false);
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Sync internal state when user prop changes (important for late DB loads)
    useEffect(() => {
        if (user) {
            setSettings(user.settings || {
                ghostMode: false,
                publicProfile: true,
                allowTagging: true,
                notifications: { hypeAlerts: true, chatMessages: true, friendActivity: true }
            });
            setAppMode(user.appMode || 'dark');
            setThemeColor(user.themeColor || 'neon');
            setProfileForm({
                name: user.name,
                bio: user.bio,
                instagram: user.instagram,
                tiktok: user.tiktok,
                twitter: user.twitter,
                avatar: user.avatar
            });
        }
    }, [user.id, user.email, user.appMode, user.themeColor]);

    // -- BLOCKED USERS --
    const [blockedUsers, setBlockedUsers] = useState<string[]>(user.settings?.blockedUsers || []);

    // Check connection on mount
    useEffect(() => {
        checkSupabaseConnection().then(setIsConnected);
    }, []);

    // -- PASSWORD FORM STATE --
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

    // Update Local Settings (Does not push to parent yet)
    const toggleSetting = (key: string, subKey?: string) => {
        trigger('light');
        setSettings(prev => {
            if (subKey) {
                return {
                    ...prev,
                    notifications: {
                        ...prev.notifications,
                        [subKey]: !prev.notifications[subKey as keyof typeof prev.notifications]
                    }
                };
            } else {
                return {
                    ...prev,
                    [key]: !prev[key as keyof typeof prev]
                };
            }
        });
    };

    const handleAccentChange = (accent: 'purple' | 'neon' | 'cyan' | 'pink') => {
        trigger('medium');
        setThemeColor(accent);
        if (onUpdateSettings) {
            onUpdateSettings(settings, appMode, accent);
        }
    };

    const handleModeChange = (mode: 'light' | 'dark') => {
        trigger('medium');
        setAppMode(mode);
        if (onUpdateSettings) {
            onUpdateSettings(settings, mode, themeColor);
        }
    };

    // -- SAVE ACTIONS --

    const handleSaveSettings = () => {
        trigger('success');
        if (onUpdateSettings) {
            onUpdateSettings(settings, appMode, themeColor);
        }
        onClose();
    };

    const handleSaveProfile = () => {
        trigger('success');
        if (onUpdateUser) {
            // Normalize handles: trim and remove '@' if present
            const cleanForm = {
                ...profileForm,
                instagram: profileForm.instagram?.trim().replace(/^@/, ''),
                tiktok: profileForm.tiktok?.trim().replace(/^@/, ''),
                twitter: profileForm.twitter?.trim().replace(/^@/, ''),
            };
            onUpdateUser(cleanForm);
        }
        setIsEditingProfile(false);
    };

    const handleUnblock = (userId: string) => {
        trigger('medium');
        const next = blockedUsers.filter(id => id !== userId);
        setBlockedUsers(next);
        setSettings(prev => ({ ...prev, blockedUsers: next }));
    };

    // -- HELPERS --

    const handleClearCache = () => {
        trigger('medium');
        setClearingCache(true);
        setTimeout(() => {
            trigger('success');
            localStorage.clear();
            setClearingCache(false);
            alert("Cache limpo! Reiniciando aplicação...");
            window.location.reload();
        }, 1500);
    };

    const handleChangePassword = async () => {
        if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
            alert("Preencha todos os campos.");
            return;
        }
        if (passwordForm.new !== passwordForm.confirm) {
            trigger('error');
            alert("A nova senha e a confirmação não coincidem.");
            return;
        }

        setIsProcessing(true);
        const res = await db.auth.updatePassword(passwordForm.new);
        setIsProcessing(false);

        if (res.success) {
            trigger('success');
            alert("Senha alterada com sucesso!");
            setShowPasswordModal(false);
            setPasswordForm({ current: '', new: '', confirm: '' });
        } else {
            trigger('error');
            alert(`Erro: ${res.message} `);
        }
    };

    const openTerms = () => {
        trigger('light');
        setShowTextModal({
            title: "Termos de Uso",
            content: (
                <div className="space-y-4 text-sm text-slate-300">
                    <p><strong>1. Aceitação:</strong> Ao usar o Vou Lá, você concorda com estes termos.</p>
                    <p><strong>2. Privacidade:</strong> Respeitamos sua privacidade. Seus dados de localização só são compartilhados se você permitir (Modo Fantasma desativado).</p>
                    <p><strong>3. Conduta:</strong> Não seja um babaca no rolê. O respeito é fundamental na nossa comunidade.</p>
                    <p><strong>4. Conteúdo:</strong> Todo conteúdo gerado pelo usuário é de sua responsabilidade.</p>
                </div>
            )
        });
    };

    const openHelp = () => {
        trigger('light');
        setShowTextModal({
            title: "Central de Ajuda",
            content: (
                <div className="space-y-4 text-sm text-slate-300">
                    <p><strong>Como ganhar XP?</strong><br />Faça check-ins em locais, complete desafios e interaja com amigos.</p>
                    <p><strong>O que é o Modo Fantasma?</strong><br />Quando ativado, sua localização não aparece no mapa para ninguém.</p>
                    <p><strong>Problemas com check-in?</strong><br />Certifique-se de que seu GPS está ativado e você está a menos de 100m do local.</p>
                    <p><strong>Contato:</strong><br />suporte@voula.app</p>
                </div>
            )
        });
    };

    const handleLanguage = () => {
        trigger('light');
        alert("Idioma alterado para Português (BR) [Padrão]");
    };

    const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setProfileForm(prev => ({ ...prev, avatar: reader.result as string }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Detect Changes
    const hasSettingsChanges = JSON.stringify(settings) !== JSON.stringify(user.settings) || appMode !== user.appMode || themeColor !== user.themeColor;

    // Detect Profile Changes (Internal Mode)
    const hasProfileChanges =
        profileForm.name !== user.name ||
        profileForm.bio !== user.bio ||
        profileForm.instagram !== user.instagram ||
        profileForm.tiktok !== user.tiktok ||
        profileForm.twitter !== user.twitter ||
        profileForm.avatar !== user.avatar;

    // --- INTERNAL PROFILE EDIT VIEW ---
    if (isEditingProfile) {
        return (
            <div className="fixed inset-0 z-[101] bg-[var(--background)] flex flex-col animate-[slideUp_0.3s_ease-out]">
                <div className="pt-safe px-4 pb-4 bg-[var(--background)] border-b border-[var(--surface-highlight)] flex items-center gap-3 sticky top-0 z-10">
                    <button onClick={() => setIsEditingProfile(false)} className="p-2 bg-[var(--surface-highlight)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)]">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-black text-[var(--text-main)] italic tracking-tight">EDITAR PERFIL</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <img src={profileForm.avatar} className="w-32 h-32 rounded-[2rem] object-cover border-4 border-[var(--surface-highlight)] shadow-xl" alt="Preview" />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/50 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                            >
                                <Camera className="w-8 h-8 text-white" />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
                        </div>
                        <span className="text-[var(--primary)] text-xs font-bold uppercase tracking-wider">Toque para alterar</span>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase ml-1">Nome</label>
                            <input type="text" value={profileForm.name || ''} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full bg-[var(--surface)] border border-[var(--surface-highlight)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase ml-1">Bio</label>
                            <textarea value={profileForm.bio || ''} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows={3} className="w-full bg-[var(--surface)] border border-[var(--surface-highlight)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none resize-none" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--surface-highlight)] pb-2">Redes Sociais</h3>

                        <div className="relative">
                            <div className="absolute left-4 top-3.5 text-[var(--text-muted)]"><Instagram className="w-5 h-5" /></div>
                            <input type="text" placeholder="@seuuser" value={profileForm.instagram || ''} onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })} className="w-full bg-[var(--surface)] border border-[var(--surface-highlight)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none" />
                        </div>
                        <div className="relative">
                            <div className="absolute left-4 top-3.5 text-[var(--text-muted)]"><Video className="w-5 h-5" /></div>
                            <input type="text" placeholder="@seuuser" value={profileForm.tiktok || ''} onChange={(e) => setProfileForm({ ...profileForm, tiktok: e.target.value })} className="w-full bg-[var(--surface)] border border-[var(--surface-highlight)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none" />
                        </div>
                        <div className="relative">
                            <div className="absolute left-4 top-3.5 text-[var(--text-muted)]"><Twitter className="w-5 h-5" /></div>
                            <input type="text" placeholder="@seuuser" value={profileForm.twitter || ''} onChange={(e) => setProfileForm({ ...profileForm, twitter: e.target.value })} className="w-full bg-[var(--surface)] border border-[var(--surface-highlight)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none" />
                        </div>
                    </div>
                </div>

                {hasProfileChanges && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent pb-safe z-20 animate-[slideUp_0.3s_ease-out]">
                        <Button fullWidth variant="neon" onClick={handleSaveProfile}>SALVAR PERFIL</Button>
                    </div>
                )}
            </div>
        );
    }

    // --- MAIN SETTINGS VIEW ---
    return (
        <div className="fixed inset-0 z-[100] bg-[var(--background)] flex flex-col animate-[slideUp_0.3s_ease-out]">
            {/* Header */}
            <div className="pt-safe px-4 pb-4 bg-[var(--background)] border-b border-[var(--surface-highlight)] flex items-center justify-between sticky top-0 z-10 shadow-lg">
                <h2 className="text-xl font-black text-[var(--text-main)] italic tracking-tight">AJUSTES</h2>
                <button onClick={onClose} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--surface-highlight)] rounded-full transition-colors active:scale-95">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-safe">
                <div className="p-4 space-y-8 pb-32">

                    {/* Account Section */}
                    <section>
                        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-2">Sua Conta</h3>
                        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--surface-highlight)] overflow-hidden backdrop-blur-sm">
                            <SettingsItem
                                icon={<Edit3 className="w-5 h-5 text-blue-400" />}
                                title="Editar Perfil"
                                subtitle="Foto, nome, bio e redes sociais"
                                hasChevron
                                onClick={() => { trigger('light'); setIsEditingProfile(true); }}
                            />
                            <div className="h-[1px] bg-slate-700/50 mx-4"></div>
                            <SettingsItem
                                icon={<KeyRound className="w-5 h-5 text-emerald-400" />}
                                title="Alterar Senha"
                                subtitle="Proteja sua conta"
                                hasChevron
                                onClick={() => { trigger('light'); setShowPasswordModal(true); }}
                            />
                            <div className="h-[1px] bg-slate-700/50 mx-4"></div>
                            <SettingsItem
                                icon={<UserIcon className="w-5 h-5 text-purple-400" />}
                                title="Usuários Bloqueados"
                                subtitle={`${blockedUsers.length} pessoas ocultadas`}
                                hasChevron
                                onClick={() => { trigger('light'); setShowBlockedModal(true); }}
                            />
                        </div>
                    </section>

                    {/* Appearance Section */}
                    <section>
                        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-2">Aparência</h3>
                        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--surface-highlight)] overflow-hidden p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Palette className="w-5 h-5 text-fuchsia-400" />
                                <span className="text-white font-bold text-sm">Modo do App</span>
                            </div>
                            <div className="flex gap-4 px-2 mb-8">
                                <button
                                    onClick={() => handleModeChange('light')}
                                    className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${appMode === 'light' ? 'bg-[var(--surface)] text-[var(--text-main)] border-[var(--primary)]' : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--surface-highlight)]'}`}
                                >
                                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Light</span>
                                </button>
                                <button
                                    onClick={() => handleModeChange('dark')}
                                    className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${appMode === 'dark' ? 'bg-[var(--surface)] text-[var(--text-main)] border-[var(--primary)]' : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--surface-highlight)]'}`}
                                >
                                    <div className="w-6 h-6 rounded-full bg-[#020617] border border-slate-700" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Dark</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <Palette className="w-5 h-5 text-[var(--primary)]" />
                                <span className="text-[var(--text-main)] font-bold text-sm">Cor do Tema</span>
                            </div>
                            <div className="flex flex-wrap justify-between gap-y-4 px-2">
                                <ThemeOption color="#ccff00" label="Neon" active={themeColor === 'neon'} onClick={() => handleAccentChange('neon')} />
                                <ThemeOption color="#c026d3" label="Roxo" active={themeColor === 'purple'} onClick={() => handleAccentChange('purple')} />
                                <ThemeOption color="#06b6d4" label="Azul" active={themeColor === 'cyan'} onClick={() => handleAccentChange('cyan')} />
                                <ThemeOption color="#ec4899" label="Pink" active={themeColor === 'pink'} onClick={() => handleAccentChange('pink')} />
                            </div>
                        </div>
                    </section>

                    {/* Privacy Section */}
                    <section>
                        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-2">Privacidade</h3>
                        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--surface-highlight)] overflow-hidden backdrop-blur-sm">
                            <SettingsToggle
                                icon={<Moon className="w-5 h-5 text-slate-300" />}
                                title="Modo Fantasma"
                                subtitle="Oculte sua localização no mapa"
                                checked={settings.ghostMode}
                                onChange={() => toggleSetting('ghostMode')}
                            />
                            <div className="h-[1px] bg-slate-700/50 mx-4"></div>
                            <SettingsToggle
                                icon={<Lock className="w-5 h-5 text-amber-400" />}
                                title="Perfil Público"
                                subtitle="Permitir que não-amigos vejam você"
                                checked={settings.publicProfile}
                                onChange={() => toggleSetting('publicProfile')}
                            />
                        </div>
                    </section>

                    {/* Notifications Section */}
                    <section>
                        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-2">Notificações</h3>
                        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--surface-highlight)] overflow-hidden backdrop-blur-sm">
                            <SettingsToggle
                                icon={<Shield className="w-5 h-5 text-red-400" />}
                                title="Alertas de Hype"
                                subtitle="Avisar quando locais estiverem bombando"
                                checked={settings.notifications.hypeAlerts}
                                onChange={() => toggleSetting('notifications', 'hypeAlerts')}
                            />
                            <div className="h-[1px] bg-slate-700/50 mx-4"></div>
                            <SettingsToggle
                                icon={<Bell className="w-5 h-5 text-yellow-400" />}
                                title="Atividade de Amigos"
                                subtitle="Quando amigos fizerem check-in"
                                checked={settings.notifications.friendActivity}
                                onChange={() => toggleSetting('notifications', 'friendActivity')}
                            />
                        </div>
                    </section>

                    {/* General/Support Section */}
                    <section>
                        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-2">Geral</h3>
                        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--surface-highlight)] overflow-hidden backdrop-blur-sm">
                            <SettingsItem
                                icon={<Globe className="w-5 h-5 text-indigo-400" />}
                                title="Idioma"
                                value="Português (BR)"
                                hasChevron
                                onClick={handleLanguage}
                            />
                            <div className="h-[1px] bg-slate-700/50 mx-4"></div>
                            <div className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={handleClearCache}>
                                <div className="flex items-center gap-3">
                                    <Database className="w-5 h-5 text-orange-400" />
                                    <div>
                                        <p className="text-white font-bold text-sm">Limpar Cache</p>
                                        <p className="text-xs text-slate-400">Purger dados locais e reiniciar</p>
                                    </div>
                                </div>
                                {clearingCache ? <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" /> : <ChevronRight className="w-5 h-5 text-slate-600" />}
                            </div>
                            <div className="h-[1px] bg-slate-700/50 mx-4"></div>
                            <SettingsItem
                                icon={<FileText className="w-5 h-5 text-emerald-400" />}
                                title="Exportar Meus Dados"
                                subtitle="Baixar resumo da conta (CSV)"
                                onClick={() => { trigger('light'); setShowDataModal(true); }}
                            />
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-2">Suporte</h3>
                        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--surface-highlight)] overflow-hidden backdrop-blur-sm">
                            <SettingsItem icon={<HelpCircle className="w-5 h-5 text-slate-300" />} title="Central de Ajuda" hasChevron onClick={openHelp} />
                            <div className="h-[1px] bg-slate-700/50 mx-4"></div>
                            <SettingsItem icon={<FileText className="w-5 h-5 text-slate-300" />} title="Termos de Uso" hasChevron onClick={openTerms} />
                            <div className="h-[1px] bg-slate-700/50 mx-4"></div>
                            <SettingsItem icon={<Smartphone className="w-5 h-5 text-slate-300" />} title="Versão do App" value="v1.0.2 (Beta)" />
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section>
                        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-2">Zona de Perigo</h3>
                        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--surface-highlight)] overflow-hidden backdrop-blur-sm">
                            <button
                                onClick={() => { trigger('medium'); onLogout(); }}
                                className="w-full p-4 flex items-center justify-between hover:bg-red-500/10 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-red-500/20 transition-colors">
                                        <LogOut className="w-5 h-5 text-red-500" />
                                    </div>
                                    <span className="font-bold text-sm text-red-500">Sair da Conta</span>
                                </div>
                            </button>

                            <div className="h-[1px] bg-slate-700/50 mx-4"></div>

                            <button
                                className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors group opacity-60 hover:opacity-100"
                                onClick={() => { trigger('heavy'); setShowDeleteConfirm(true); }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-800 rounded-lg">
                                        <UserMinus className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <span className="font-bold text-sm text-slate-400">Excluir Conta</span>
                                </div>
                            </button>
                        </div>

                        <div className="mt-6 px-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w - 2 h - 2 rounded - full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 animate-pulse'} `}></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    Servidor: {isConnected === null ? 'Checando...' : (isConnected ? 'Online' : 'Offline')}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 italic">#{user.id.slice(0, 8)}</span>
                        </div>
                    </section>

                    <div className="text-center pt-8 pb-4 opacity-30">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Vou Lá © 2024</p>
                        <p className="text-[9px] text-slate-600 mt-1">Feito para a noite.</p>
                    </div>

                </div>
            </div >

            {/* STICKY SAVE BUTTON FOR SETTINGS */}
            {
                hasSettingsChanges && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent pb-safe z-20 animate-[slideUp_0.3s_ease-out]">
                        <Button fullWidth variant="neon" onClick={handleSaveSettings}>
                            SALVAR ALTERAÇÕES
                        </Button>
                    </div>
                )
            }

            {/* --- MODALS --- */}

            {/* Password Modal */}
            {
                showPasswordModal && (
                    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-[#1e293b] w-full max-w-sm rounded-3xl p-6 border border-slate-700 shadow-2xl">
                            <h3 className="text-xl font-black text-white italic mb-4">Alterar Senha</h3>
                            <div className="space-y-3 mb-6">
                                <input type="password" placeholder="Senha Atual" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-[#ccff00] focus:outline-none" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} />
                                <input type="password" placeholder="Nova Senha" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-[#ccff00] focus:outline-none" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} />
                                <input type="password" placeholder="Confirmar Nova Senha" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-[#ccff00] focus:outline-none" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800">Cancelar</button>
                                <button onClick={handleChangePassword} className="flex-1 py-3 rounded-xl font-bold bg-[#ccff00] text-black hover:bg-[#b3ff00]">Salvar</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Text Modal (Terms/Help) */}
            {
                showTextModal && (
                    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]" onClick={() => setShowTextModal(null)}>
                        <div className="bg-[#1e293b] w-full max-w-sm rounded-3xl p-6 border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-black text-white italic">{showTextModal.title}</h3>
                                <button onClick={() => setShowTextModal(null)}><X className="w-6 h-6 text-slate-400" /></button>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto mb-6 pr-2">
                                {showTextModal.content}
                            </div>
                            <button onClick={() => setShowTextModal(null)} className="w-full py-3 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700">Entendi</button>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirm Modal */}
            {
                showDeleteConfirm && (
                    <div className="fixed inset-0 z-[110] bg-red-900/40 backdrop-blur flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-[#1e293b] w-full max-w-sm rounded-3xl p-6 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 text-red-500">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-white italic mb-2">Tem certeza?</h3>
                                <p className="text-slate-400 text-sm">Essa ação apagará todos os seus dados, histórico e XP. Não há como desfazer.</p>
                            </div>
                            {isProcessing ? (
                                <div className="flex justify-center py-4"><RefreshCw className="w-6 h-6 animate-spin text-white" /></div>
                            ) : (
                                <div className="flex gap-3">
                                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700">Cancelar</button>
                                    <button onClick={async () => {
                                        setIsProcessing(true);
                                        const res = await db.auth.deleteAccount();
                                        setIsProcessing(false);
                                        if (res.success) {
                                            alert("Conta excluída com sucesso.");
                                            window.location.reload();
                                        } else {
                                            alert(`Erro: ${res.message} `);
                                        }
                                    }} className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600">Sim, Excluir Cadaço</button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Blocked Users Modal */}
            {
                showBlockedModal && (
                    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-[#1e293b] w-full max-w-sm rounded-3xl p-6 border border-slate-700 shadow-2xl flex flex-col max-h-[80vh]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-black text-white italic">Bloqueados</h3>
                                <button onClick={() => setShowBlockedModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {blockedUsers.length > 0 ? blockedUsers.map(id => (
                                    <div key={id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--primary)]">UID</div>
                                            <span className="text-white text-sm font-bold">IDs: {id.slice(0, 10)}...</span>
                                        </div>
                                        <button onClick={() => handleUnblock(id)} className="px-3 py-1.5 bg-slate-800 text-xs font-bold text-slate-300 rounded-lg hover:text-white transition-colors">Desbloquear</button>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-slate-500 italic text-sm">Ninguém foi bloqueado ainda.</div>
                                )}
                            </div>
                            <button onClick={() => setShowBlockedModal(false)} className="w-full mt-6 py-3 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700">Fechar</button>
                        </div>
                    </div>
                )
            }

            {/* Data Modal */}
            {
                showDataModal && (
                    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-[#1e293b] w-full max-w-sm rounded-3xl p-6 border border-slate-700 shadow-2xl">
                            <h3 className="text-xl font-black text-white italic mb-2">Exportar Dados</h3>
                            <p className="text-slate-400 text-sm mb-6">Estamos preparando um arquivo com todo o seu histórico de check-ins, medalhas e conquistas. Você receberá o link por e-mail em breve.</p>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
                                <FileText className="w-6 h-6 text-emerald-500" />
                                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Solicitação registrada</div>
                            </div>
                            <button onClick={() => setShowDataModal(false)} className="w-full py-3 rounded-xl font-bold bg-[#ccff00] text-black hover:bg-[#b3ff00]">Ok, Valeu!</button>
                        </div>
                    </div>
                )
            }

        </div >
    );
};

// --- Sub Components for cleaner code ---

const SettingsItem = ({ icon, title, subtitle, value, hasChevron, onClick }: any) => (
    <button onClick={onClick} className="w-full p-4 flex items-center justify-between hover:bg-[var(--surface-highlight)]/50 transition-colors text-left disabled:cursor-default disabled:hover:bg-transparent">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-highlight)] flex items-center justify-center shrink-0 border border-[var(--border)]">
                {icon}
            </div>
            <div>
                <p className="text-[var(--text-main)] font-bold text-sm">{title}</p>
                {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
            </div>
        </div>
        <div className="flex items-center gap-2">
            {value && <span className="text-xs font-bold text-[var(--text-muted)]">{value}</span>}
            {hasChevron && <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />}
        </div>
    </button>
);

const SettingsToggle = ({ icon, title, subtitle, checked, onChange }: any) => (
    <div className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-highlight)] flex items-center justify-center shrink-0 border border-[var(--border)]">
                {icon}
            </div>
            <div>
                <p className="text-[var(--text-main)] font-bold text-sm">{title}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-[180px] leading-tight">{subtitle}</p>
            </div>
        </div>
        <button
            onClick={onChange}
            className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-[#ccff00]' : 'bg-[var(--surface-highlight)] border border-[var(--border)]'}`}
        >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${checked ? 'left-6' : 'left-1'}`}></div>
        </button>
    </div>
);

const ThemeOption = ({ color, label, active, onClick }: any) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group">
        <div
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-[var(--surface-highlight)] hover:border-[var(--text-muted)]'}`}
            style={{ backgroundColor: active ? color : 'transparent' }}
        >
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color }}></div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wide ${active ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
            {label}
        </span>
    </button>
);
