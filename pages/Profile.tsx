
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_USER, FALLBACK_IMAGE } from '../constants';
import { User, PrivacySettings, Place } from '../types';
import { Award, MapPin, Settings, Instagram, Edit3, X, Clock, Camera, Twitter, Video, Calendar, Shield, Share2, LayoutDashboard } from 'lucide-react';
import { SettingsScreen } from '../components/SettingsScreen';
import { SafetyModal } from '../components/SafetyModal';
import { BusinessDashboard } from '../components/BusinessDashboard';
import { calculateLevel } from '../utils/core';

// UI Components
import { Avatar } from '../src/components/ui/Avatar';
import { Button } from '../src/components/ui/Button';
import { Badge } from '../src/components/ui/Badge';
import { Card, CardContent } from '../src/components/ui/Card';

interface ProfileProps {
  currentUser?: User;
  onLogout?: () => void;
  onUpdateProfile?: (user: Partial<User>) => void;
  editTrigger?: number;
  places: Place[];
}

export const Profile: React.FC<ProfileProps> = ({ currentUser = MOCK_USER, onLogout, onUpdateProfile, editTrigger, places }) => {
  const [user, setUser] = useState<User>(currentUser);

  useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);

  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const [editForm, setEditForm] = useState<Partial<User>>({
    name: '', bio: '', instagram: '', tiktok: '', twitter: '', avatar: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const updatedUser = { ...user, ...editForm } as User;
    setUser(updatedUser);
    if (onUpdateProfile) onUpdateProfile(editForm);
    setIsEditing(false);
  };

  const handleSettingsUpdate = (settings: PrivacySettings, theme?: 'purple' | 'neon' | 'cyan' | 'pink') => {
    if (onUpdateProfile) {
      onUpdateProfile({
        settings,
        theme
      });
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
      <div className="fixed inset-0 z-[100] bg-[var(--bg-default)] flex flex-col">
        <div className="pt-safe px-4 pb-2 bg-[var(--bg-surface)] flex items-center justify-between border-b border-[var(--border-default)]">
          <Button variant="ghost" size="icon" onClick={() => setShowDashboard(false)}>
            <X className="w-6 h-6" />
          </Button>
          <span className="text-[var(--text-primary)] font-black italic tracking-tight">GESTÃO DO LOCAL</span>
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
      <div className="min-h-screen bg-[var(--bg-default)] pb-24 relative animate-[fadeIn_0.3s_ease-out] z-50">
        <div className="pt-safe px-4 pb-4 flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-default)] sticky top-0 z-20">
          <Button variant="secondary" size="icon" onClick={() => setIsEditing(false)} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider">Editar Perfil</h2>
          <div className="w-9"></div>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-80px)] pb-32">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar src={editForm.avatar} size="xl" className="w-32 h-32 border-4 border-[var(--bg-surface)] shadow-2xl" />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            <span className="text-[var(--primary-main)] text-sm font-bold uppercase tracking-wider">Alterar Foto</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase ml-1">Nome</label>
              <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--primary-main)] focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase ml-1">Bio</label>
              <textarea value={editForm.bio || ''} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} className="w-full bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[var(--primary-main)] focus:outline-none resize-none" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-default)] pb-2">Redes Sociais</h3>
            {['instagram', 'tiktok', 'twitter'].map((social) => (
              <div key={social} className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase ml-1 capitalize">{social}</label>
                <div className="relative">
                  <div className="absolute left-4 top-3.5 text-[var(--text-muted)]">
                    {social === 'instagram' ? <Instagram className="w-5 h-5" /> : social === 'tiktok' ? <Video className="w-5 h-5" /> : <Twitter className="w-5 h-5" />}
                  </div>
                  <input type="text" placeholder="@seuuser" value={editForm[social as keyof User] as string || ''} onChange={(e) => setEditForm({ ...editForm, [social]: e.target.value })} className="w-full bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-primary)] focus:border-[var(--primary-main)] focus:outline-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-[var(--bg-default)] pb-safe z-20 border-t border-[var(--border-default)]">
          <Button fullWidth onClick={handleSave}>SALVAR PERFIL</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)] pb-24 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-[var(--primary-main)] opacity-10 blur-[100px] pointer-events-none"></div>

      <div className="pt-safe px-4 py-2 flex justify-between gap-3 sticky top-0 z-30">
        <div className="flex gap-2">
          {user.ownedPlaceId && (
            <Button variant="ghost" className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20" onClick={() => setShowDashboard(true)}>
              <LayoutDashboard className="w-5 h-5 mr-2" />
              <span className="text-[10px] font-black uppercase tracking-widest">Painel Dono</span>
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="danger" className="bg-red-500/10 text-red-500 border-red-500/20 p-2 h-auto" onClick={() => setShowSafety(true)}>
            <Shield className="w-5 h-5 mr-2" />
            <span className="text-[10px] font-black uppercase block">Segurança</span>
          </Button>

          <Button variant="secondary" size="icon" className="glass-card" onClick={() => setShowSettings(true)}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="px-6 pt-4 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group mb-4">
            <div className="absolute -inset-1 bg-gradient-to-br from-[var(--primary-main)] to-purple-500 rounded-full opacity-70 blur-md group-hover:opacity-100 transition-duration-500"></div>
            <Avatar src={user.avatar} size="xl" className="w-36 h-36 border-4 border-[var(--bg-default)] shadow-2xl" />
            <button onClick={handleStartEdit} className="absolute -bottom-2 right-0 bg-[var(--bg-surface)] p-2.5 rounded-xl border border-[var(--border-default)] text-[var(--text-primary)] shadow-lg hover:text-[var(--primary-main)] transition-colors z-20">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-3xl font-black text-[var(--text-primary)] italic tracking-tighter drop-shadow-lg text-center mb-1">{user.name}</h2>

          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="pl-3 pr-4 py-1 gap-1">
              <Award className="w-3 h-3 text-[var(--primary-main)]" /> Nível {level}
            </Badge>
            <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wide">
              {user.points} XP
            </span>
          </div>

          <p className="text-[var(--text-secondary)] text-sm text-center max-w-xs leading-relaxed font-medium">
            {user.bio || "Adicione uma bio para a galera te conhecer."}
          </p>

          <div className="flex gap-4 mt-6">
            {user.instagram && <SocialButton icon={<Instagram className="w-5 h-5" />} />}
            {user.tiktok && <SocialButton icon={<Video className="w-5 h-5" />} />}
            {user.twitter && <SocialButton icon={<Twitter className="w-5 h-5" />} />}
            <Button variant="secondary" size="icon" className="w-12 h-12 rounded-2xl">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <Card variant="glass" className="h-32 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-full bg-[var(--primary-main)]/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[var(--primary-main)]" />
            </div>
            <div>
              <span className="text-3xl font-black text-[var(--text-primary)] block">{user.history?.length || 0}</span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Rolês Totais</span>
            </div>
          </Card>

          <Card variant="glass" className="h-32 flex flex-col justify-between relative overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center relative z-10">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div className="relative z-10">
              <span className="text-xl font-black text-[var(--text-primary)] block truncate">{user.memberSince ? new Date(user.memberSince).toLocaleDateString() : '2024'}</span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Membro Desde</span>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
          </Card>
        </div>

        <Card variant="glass" padding="md" className="mb-8 relative overflow-hidden">
          <div className="flex justify-between items-end mb-3 relative z-10">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Próximo Nível</span>
            <span className="text-[var(--primary-main)] font-black text-lg">{progress}%</span>
          </div>
          <div className="relative z-10 h-3 bg-slate-900/50 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--primary-main)] shadow-[0_0_15px_var(--primary-main)] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="relative z-10 text-[10px] text-[var(--text-secondary)] mt-2 text-right">Faltam {nextLevelXp - user.points} XP</p>
        </Card>

        <div className="pb-10">
          <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-widest mb-5 flex items-center gap-2 ml-1">
            <Clock className="w-4 h-4" /> Histórico Recente
          </h3>
          <div className="space-y-4 relative pl-4 border-l-2 border-[var(--border-default)] ml-2">
            {user.history?.map((checkin) => (
              <div key={checkin.id} className="relative pl-6">
                <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--bg-default)] border-2 border-[var(--primary-main)] z-10"></div>
                <Card variant="glass" padding="sm" className="flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <img src={checkin.snapshotImageUrl || FALLBACK_IMAGE} className="w-12 h-12 rounded-xl object-cover bg-slate-800" alt="" />
                  <div className="flex-1">
                    <h4 className="font-bold text-[var(--text-primary)] text-sm">{checkin.placeName}</h4>
                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase mt-0.5">{new Date(checkin.timestamp).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-black text-[var(--primary-main)]">+{checkin.xpEarned} XP</span>
                </Card>
              </div>
            ))}
            {(!user.history || user.history.length === 0) && (
              <p className="text-[var(--text-muted)] text-sm py-4 italic pl-6">Nenhum rolê registrado ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialButton = ({ icon }: { icon: React.ReactNode }) => (
  <Button variant="secondary" size="icon" className="w-12 h-12 rounded-2xl p-0">
    {icon}
  </Button>
);
