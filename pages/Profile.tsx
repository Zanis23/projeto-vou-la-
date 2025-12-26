
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_USER, FALLBACK_IMAGE } from '../constants';
import { User, PrivacySettings, Place } from '../types';
import { Award, MapPin, Settings, Instagram, Edit3, X, Clock, Camera, Twitter, Video, Calendar, Shield, Share2, Store, LayoutDashboard, Database, Wifi, WifiOff, Eye } from 'lucide-react';
import { SettingsScreen } from '../components/SettingsScreen';
import { SafetyModal } from '../components/SafetyModal';
import { BusinessDashboard } from '../components/BusinessDashboard';
import { calculateLevel } from '../utils/core';
import { Button } from '../components/Button';
import { checkSupabaseConnection } from '../services/supabase';

interface ProfileProps {
  currentUser?: User;
  onLogout?: () => void;
  onUpdateProfile?: (user: Partial<User>) => void;
  onUpdateSettings?: (settings: PrivacySettings, mode?: 'light' | 'dark', accent?: 'purple' | 'neon' | 'cyan' | 'pink') => void;
  editTrigger?: number;
  places: Place[];
}

export const Profile: React.FC<ProfileProps> = ({ currentUser = MOCK_USER, onLogout, onUpdateProfile, onUpdateSettings, editTrigger, places }) => {
  const [user, setUser] = useState<User>(currentUser);

  // Fix: Sync local user state when currentUser prop changes (e.g. after registration)
  useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);

  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);

  const [editForm, setEditForm] = useState<Partial<User>>({
    name: '', bio: '', instagram: '', tiktok: '', twitter: '', avatar: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setUser(currentUser); }, [currentUser]);
  useEffect(() => { if (editTrigger && editTrigger > 0) handleStartEdit(); }, [editTrigger]);


  const { level, progress, nextLevelXp } = calculateLevel(user.points);

  const handleStartEdit = () => {
    setEditForm({
      name: user.name || '',
      bio: user.bio || '',
      instagram: user.instagram || '',
      tiktok: user.tiktok || '',
      twitter: user.twitter || '',
      avatar: user.avatar || ''
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onUpdateProfile) {
      onUpdateProfile(editForm);
      setIsEditing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        alert('Código copiado com sucesso! 📋');
      } else {
        // Fallback for non-secure contexts or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          alert('Código copiado com sucesso! 📋');
        } catch (err) {
          console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSettingsUpdate = (settings: PrivacySettings, mode?: 'light' | 'dark', accent?: 'purple' | 'neon' | 'cyan' | 'pink') => {
    if (onUpdateSettings) {
      onUpdateSettings(settings, mode, accent);
    } else if (onUpdateProfile) {
      const upd: any = { settings };
      if (mode) upd.appMode = mode;
      if (accent) upd.themeColor = accent;
      onUpdateProfile(upd);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { if (typeof reader.result === 'string') setEditForm(prev => ({ ...prev, avatar: reader.result as string })); };
      reader.readAsDataURL(file);
    }
  };

  if (showDashboard && user.ownedPlaceId) {
    const myPlace = places.find(p => p.id === user.ownedPlaceId);
    return (
      <div className="fixed inset-0 z-[100] bg-[#0E1121] flex flex-col">
        <div className="pt-safe px-4 pb-2 bg-[#1F2937] flex items-center justify-between border-b border-slate-700">
          <button onClick={() => setShowDashboard(false)} className="p-2 text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <span className="text-white font-black italic tracking-tight">GESTÃO DO LOCAL</span>
          <div className="w-10"></div>
        </div>
        <BusinessDashboard placeId={user.ownedPlaceId} placeData={myPlace} />
      </div>
    );
  }

  if (showSettings) {
    return (
      <SettingsScreen
        user={user}
        onClose={() => setShowSettings(false)}
        onLogout={onLogout || (() => { })}
        onUpdateUser={onUpdateProfile}
        onUpdateSettings={handleSettingsUpdate}
      />
    );
  }

  if (showSafety) return <SafetyModal onClose={() => setShowSafety(false)} />;

  if (isEditing) {
    return (
      <div className="min-h-screen bg-[var(--background)] pb-24 relative animate-[fadeIn_0.3s_ease-out] z-50">
        <div className="pt-safe px-4 pb-4 flex items-center justify-between border-b border-[var(--surface-highlight)] bg-[var(--background)] sticky top-0 z-20">
          <button onClick={() => setIsEditing(false)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--surface)] rounded-full"> <X className="w-5 h-5" /> </button>
          <h2 className="text-lg font-bold text-[var(--text-main)] uppercase tracking-wider">Editar Perfil</h2>
          <div className="w-9"></div>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-80px)] pb-32">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img src={editForm.avatar} className="w-32 h-32 rounded-[2rem] object-cover border-4 border-[var(--surface)] shadow-2xl" alt="Preview" />
              <div className="absolute inset-0 bg-black/40 rounded-[2rem] flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            <span className="text-[var(--primary)] text-sm font-bold uppercase tracking-wider">Alterar Foto</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase ml-1">Nome</label>
              <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-[var(--surface)] border border-[var(--surface-highlight)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase ml-1">Bio</label>
              <textarea value={editForm.bio || ''} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} className="w-full bg-[var(--surface)] border border-[var(--surface-highlight)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none resize-none" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--surface-highlight)] pb-2">Redes Sociais</h3>
            {['instagram', 'tiktok', 'twitter'].map((social) => (
              <div key={social} className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase ml-1 capitalize">{social}</label>
                <div className="relative">
                  <div className="absolute left-4 top-3.5 text-[var(--text-muted)]">
                    {social === 'instagram' ? <Instagram className="w-5 h-5" /> : social === 'tiktok' ? <Video className="w-5 h-5" /> : <Twitter className="w-5 h-5" />}
                  </div>
                  <input type="text" placeholder="@seuuser" value={editForm[social as keyof User] as string || ''} onChange={(e) => setEditForm({ ...editForm, [social]: e.target.value })} className="w-full bg-[var(--surface)] border border-[var(--surface-highlight)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-[var(--background)] pb-safe z-20 border-t border-[var(--surface-highlight)]">
          <Button fullWidth variant="neon" onClick={handleSave}>SALVAR PERFIL</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-32 relative overflow-x-hidden transition-colors duration-500">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#1a1f35] to-transparent pointer-events-none z-0"></div>
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--primary)] opacity-10 rounded-full blur-[80px] pointer-events-none z-0"></div>

      <div className="px-5 pb-2 z-20 flex flex-col gap-6 sticky top-0 backdrop-blur-xl bg-[var(--background)]/80 pt-safe transition-colors duration-500 border-b border-white/5 mb-6">
        <div className="flex justify-between items-center mt-2">
          <h2 className="text-3xl font-black text-[var(--text-main)] italic tracking-tighter drop-shadow-sm flex items-center gap-2">
            PERFIL <span className="text-2xl not-italic text-[var(--primary)] animate-pulse">|</span>
          </h2>

          <div className="flex gap-2">
            <button onClick={() => setShowSafety(true)} className="flex items-center gap-2 px-3 py-2 bg-red-500/10 backdrop-blur-md rounded-2xl text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-lg">
              <Shield className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase block">Segurança</span>
            </button>
            <button onClick={() => setShowCodeModal(true)} className="p-3 bg-[var(--surface)] rounded-full text-[var(--text-muted)] border border-[var(--surface-highlight)] hover:text-[var(--text-main)] transition-all active:scale-95 shadow-lg">
              <Eye className="w-5 h-5" />
            </button>
            <button onClick={() => setShowSettings(true)} className="p-3 bg-[var(--surface)] rounded-full text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors active:scale-95 border border-[var(--surface-highlight)] shadow-lg">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 relative z-10 pb-32">
        <div className="flex flex-col items-center mb-10">
          <div className="relative group mb-6">
            <div className="absolute -inset-1 bg-gradient-to-br from-[var(--primary)] to-fuchsia-500 rounded-[2.5rem] squircle opacity-70 blur-md group-hover:opacity-100 transition-duration-500"></div>
            <img src={user.avatar} alt={user.name} className="relative w-36 h-36 rounded-[2.2rem] squircle border-4 border-[var(--background)] object-cover shadow-2xl bg-slate-800" setError={(e) => e.currentTarget.src = FALLBACK_IMAGE} />
            <button onClick={handleStartEdit} className="absolute -bottom-2 -right-2 bg-[var(--surface)] p-3 rounded-2xl border border-[var(--surface-highlight)] text-[var(--text-muted)] shadow-xl hover:text-[var(--primary)] transition-colors z-20 group-hover:scale-110">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-4xl font-black text-[var(--text-main)] italic tracking-tighter drop-shadow-sm text-center mb-2 leading-none">{user.name}</h2>

          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[var(--surface)] border border-[var(--surface-highlight)] px-4 py-1.5 rounded-full text-[10px] font-mono font-black text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2" onClick={() => copyToClipboard(user.userCode || '')}>
              @{user.userCode || '---'}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex flex-col items-center px-4 border-r border-[var(--border)]">
              <span className="text-lg font-black text-[var(--primary)] uppercase tracking-tight flex items-center gap-1">
                {level}
              </span>
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Nível</span>
            </div>
            <div className="flex flex-col items-center px-4">
              <span className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">
                {user.points}
              </span>
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">XP Total</span>
            </div>
          </div>

          <p className="text-[var(--text-muted)] text-sm text-center max-w-xs leading-relaxed font-bold opacity-80">
            {user.bio || "Adicione uma bio para a galera te conhecer."}
          </p>

          <div className="flex gap-3 mt-6">
            {user.instagram && <SocialButton platform="instagram" username={user.instagram} icon={<Instagram className="w-5 h-5" />} />}
            {user.tiktok && <SocialButton platform="tiktok" username={user.tiktok} icon={<Video className="w-5 h-5" />} />}
            {user.twitter && <SocialButton platform="twitter" username={user.twitter} icon={<Twitter className="w-5 h-5" />} />}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-card p-4 rounded-[2rem] flex flex-col justify-between h-32 border border-[var(--surface-highlight)] shadow-sm group hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <span className="text-3xl font-black text-[var(--text-main)] block tracking-tighter">{user.history?.length || 0}</span>
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Rolês Totais</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-[2rem] flex flex-col justify-between h-32 relative overflow-hidden border border-[var(--surface-highlight)] shadow-sm group hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center relative z-10">
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <div className="relative z-10">
              <span className="text-xl font-black text-[var(--text-main)] block truncate mt-2">
                {user.memberSince ? new Date(user.memberSince).toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' }) : '---'}
              </span>
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Membro Desde</span>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors"></div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[2.5rem] mb-10 relative overflow-hidden border border-[var(--surface-highlight)]">
          <div className="flex justify-between items-end mb-4 relative z-10">
            <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Próximo Nível</span>
            <span className="text-[var(--primary)] font-black text-xl italic">{progress}%</span>
          </div>
          <div className="relative z-10 h-4 bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--border)]">
            <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-glow)] shadow-[0_0_15px_var(--primary)] transition-all duration-1000 relative" style={{ width: `${progress}%` }}>
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <p className="relative z-10 text-[10px] text-[var(--text-muted)] mt-2 text-right font-bold uppercase tracking-wide opacity-70">Faltam {nextLevelXp - user.points} XP para o topo</p>
        </div>

        <div className="mb-10">
          <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-2 pl-2">
            <Award className="w-4 h-4 text-amber-500" /> Insígnias
          </h3>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6 snap-x">
            {(!user.achievements || user.achievements.length === 0) ? (
              <div className="w-full py-8 text-center bg-[var(--surface)]/50 rounded-3xl border border-dashed border-[var(--border)]">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">Nenhuma conquista ainda.</p>
              </div>
            ) : (
              user.achievements.map((achId) => (
                <div key={achId} className="flex flex-col items-center gap-2 shrink-0 snap-center group">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-amber-300 to-orange-600 p-[2px] shadow-lg shadow-orange-500/20 group-hover:-translate-y-1 transition-transform">
                    <div className="w-full h-full rounded-[1.4rem] bg-[var(--surface)] flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Award className="w-8 h-8 text-amber-400 drop-shadow-md" />
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-[var(--text-main)] uppercase text-center w-20 leading-tight opacity-80 group-hover:opacity-100 transition-opacity">
                    {achId.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pb-safe">
          <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-2 pl-2">
            <Clock className="w-4 h-4 text-[var(--text-muted)]" /> Histórico
          </h3>
          <div className="space-y-6 relative pl-4 border-l-2 border-[var(--surface-highlight)] ml-2">
            {user.history?.map((checkin) => (
              <div key={checkin.id} className="relative pl-6 group">
                <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--background)] border-4 border-[var(--surface-highlight)] group-hover:border-[var(--primary)] transition-colors z-10"></div>
                <div className="glass-card p-3 pr-4 rounded-2xl flex items-center gap-4 hover:bg-[var(--surface-highlight)]/30 transition-colors border border-[var(--surface-highlight)] cursor-pointer">
                  <img src={checkin.snapshotImageUrl || FALLBACK_IMAGE} className="w-12 h-12 rounded-xl object-cover bg-slate-800" alt="" />
                  <div className="flex-1">
                    <h4 className="font-bold text-[var(--text-main)] text-sm">{checkin.placeName}</h4>
                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase mt-0.5 opacity-70">{new Date(checkin.timestamp).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-black text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-1 rounded-lg">+{checkin.xpEarned} XP</span>
                </div>
              </div>
            ))}
            {(!user.history || user.history.length === 0) && (
              <p className="text-[var(--text-muted)] text-sm py-4 italic pl-6 opacity-60">Nenhum rolê registrado ainda.</p>
            )}
          </div>
        </div>      </div>
      {/* User Code ID Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCodeModal(false)}></div>
          <div className="relative glass-card w-full max-w-sm p-8 rounded-[3rem] border border-white/10 flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="w-full flex justify-end mb-4 absolute top-6 right-6">
              <button onClick={() => setShowCodeModal(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-24 h-24 rounded-[2rem] bg-indigo-600/20 flex items-center justify-center mb-6">
              <Store className="w-12 h-12 text-indigo-400" />
            </div>

            <h3 className="text-xl font-black text-white italic tracking-tight mb-2 uppercase">Meu Código ID</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 text-center px-4 leading-relaxed">Mostre este código para seus amigos te encontrarem no Vou Lá!</p>

            <div className="bg-slate-900/50 border-2 border-dashed border-indigo-500/30 rounded-3xl p-8 w-full flex flex-col items-center mb-8">
              <span className="text-4xl font-mono font-black text-white tracking-[0.2em] mb-2">{user.userCode}</span>
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
            </div>

            <Button fullWidth variant="neon" onClick={() => {
              copyToClipboard(user.userCode || '');
              setShowCodeModal(false);
            }}>
              COPIAR MEU CÓDIGO
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const SocialButton = ({ icon, platform, username }: { icon: React.ReactNode, platform: string, username: string }) => {
  const handleClick = () => {
    if (!username) return;

    let url = '';
    if (username.startsWith('http')) {
      url = username;
    } else {
      const cleanUser = username.replace('@', '');
      if (platform === 'instagram') url = `https://instagram.com/${cleanUser}`;
      if (platform === 'tiktok') url = `https://tiktok.com/@${cleanUser}`;
      if (platform === 'twitter') url = `https://twitter.com/${cleanUser}`;
    }

    if (url) window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="w-12 h-12 rounded-2xl bg-[var(--surface)] border border-[var(--surface-highlight)] flex items-center justify-center text-slate-400 hover:text-white hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all active:scale-95"
    >
      {icon}
    </button>
  );
};
