import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_USER, FALLBACK_IMAGE } from '../constants';
import { User, PrivacySettings, Place } from '@/types';
import { Award, MapPin, Settings, Instagram, Edit3, X, Clock, Camera, Twitter, Video, Calendar, Shield, Share2, LayoutDashboard } from 'lucide-react';
import { SettingsScreen } from '@/components/SettingsScreen';
import { SafetyModal } from '@/components/SafetyModal';
import { BusinessDashboard } from '@/components/BusinessDashboard';
import { calculateLevel } from '@/utils/core';
import { slideUp, fadeIn, scaleIn } from '@/styles/animations';
import { FlipCard } from '@/components/FlipCard';
import { QrCode } from 'lucide-react';

// UI Components
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';

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

  const handleSettingsUpdate = (settings: PrivacySettings, theme?: 'purple' | 'neon' | 'cyan' | 'pink' | 'light' | 'black') => {
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

  return (
    <div className="min-h-screen bg-[var(--bg-default)] pb-24 relative overflow-hidden transition-colors duration-500">
      <AnimatePresence>
        {showDashboard && user.ownedPlaceId && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-0 z-[100] bg-[var(--bg-default)] flex flex-col"
          >
            <div className="pt-safe px-4 pb-2 bg-[var(--bg-surface)] flex items-center justify-between border-b border-[var(--border-default)]">
              <Button variant="ghost" size="icon" onClick={() => setShowDashboard(false)}>
                <X className="w-6 h-6" />
              </Button>
              <span className="text-[var(--text-primary)] font-black italic tracking-tight uppercase">Gestão do Local</span>
              <div className="w-10"></div>
            </div>
            <BusinessDashboard placeId={user.ownedPlaceId} placeData={places.find(p => p.id === user.ownedPlaceId)} />
          </motion.div>
        )}

        {showSettings && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-[100]"
          >
            <SettingsScreen
              user={user}
              onClose={() => setShowSettings(false)}
              onLogout={onLogout || (() => { })}
              onUpdateUser={onUpdateProfile}
              onUpdateSettings={handleSettingsUpdate}
            />
          </motion.div>
        )}

        {showSafety && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-[120]"
          >
            <SafetyModal onClose={() => setShowSafety(false)} />
          </motion.div>
        )}

        {isEditing && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed top-0 left-0 w-full h-[100dvh] bg-[var(--bg-default)] z-[110] flex flex-col shadow-2xl"
          >
            <div className="pt-safe px-4 pb-4 flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-default)] sticky top-0 z-20">
              <Button variant="secondary" size="icon" onClick={() => setIsEditing(false)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider">Editar Perfil</h2>
              <div className="w-9"></div>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto flex-1 pb-20">
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

            <div className="p-4 bg-[var(--bg-default)]/80 backdrop-blur-xl border-t border-[var(--border-default)] safe-bottom pb-8 min-h-[100px] flex items-center justify-center">
              <Button fullWidth onClick={handleSave} className="h-14 text-base font-black shadow-2xl glow-primary">SALVAR PERFIL</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="relative"
      >
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-[var(--primary-main)] opacity-10 blur-[100px] pointer-events-none"></div>

        <Header
          left={
            user.ownedPlaceId && (
              <Button
                variant="ghost"
                className="bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 rounded-xl"
                onClick={() => setShowDashboard(true)}
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                <span className="text-[9px] font-black uppercase tracking-widest">Painel</span>
              </Button>
            )
          }
          center={
            <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">
              PERFIL
            </h1>
          }
          right={
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                className="bg-red-500/10 text-red-500 border-red-500/20 p-2.5 h-auto rounded-xl"
                onClick={() => setShowSafety(true)}
              >
                <Shield className="w-5 h-5" />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                className="bg-white/5 border border-white/10 rounded-xl"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          }
        />

        <div className="px-6 pt-4 relative z-10">
          <FlipCard
            trigger="click"
            height={350}
            className="mb-8"
            front={
              <div className="flex flex-col items-center justify-center w-full h-full bg-[var(--bg-default)] rounded-[2rem] border border-[var(--border-default)] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[var(--primary-main)]/20 to-transparent"></div>

                <motion.div variants={scaleIn} className="relative group mb-4 z-10">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[var(--primary-main)] to-purple-500 rounded-full opacity-70 blur-md group-hover:opacity-100 transition-opacity"></div>
                  <Avatar src={user.avatar} size="xl" className="w-36 h-36 border-4 border-[var(--bg-default)] shadow-2xl relative z-10" />
                  <button onClick={(e) => { e.stopPropagation(); handleStartEdit(); }} className="absolute -bottom-2 right-0 bg-[var(--bg-surface)] p-2.5 rounded-xl border border-[var(--border-default)] text-[var(--text-primary)] shadow-lg hover:text-[var(--primary-main)] transition-colors z-20">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </motion.div>

                <motion.h2 variants={slideUp} className="text-3xl font-black text-[var(--text-primary)] italic tracking-tighter drop-shadow-lg text-center mb-1 relative z-10">{user.name}</motion.h2>

                <motion.div variants={slideUp} className="flex items-center gap-2 mb-4 relative z-10">
                  <Badge variant="secondary" className="pl-3 pr-4 py-1 gap-1">
                    <Award className="w-3 h-3 text-[var(--primary-main)]" /> Nível {level}
                  </Badge>
                  <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wide">
                    {user.points} XP
                  </span>
                </motion.div>

                <motion.p variants={slideUp} className="text-[var(--text-secondary)] text-sm text-center max-w-xs leading-relaxed font-medium relative z-10">
                  {user.bio || "Adicione uma bio para a galera te conhecer."}
                </motion.p>

                <div className="flex gap-4 mt-6 relative z-10">
                  {/* Keep interactions inside front, but allow stopPropagation to prevent flip if clicking links */}
                  {user.instagram && <SocialButton icon={<Instagram className="w-5 h-5" />} onClick={() => window.open(`https://instagram.com/${user.instagram?.replace('@', '')}`, '_blank')} />}
                  <div onClick={e => e.stopPropagation()}>
                    <Button variant="secondary" size="icon" className="w-12 h-12 rounded-2xl" onClick={() => {
                      if (navigator.share) { navigator.share({ title: `Perfil de ${user.name}`, url: window.location.href }); }
                    }}>
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <p className="absolute bottom-4 text-[9px] text-[var(--text-muted)] uppercase tracking-widest animate-pulse">Toque para ver QR Code</p>
              </div>
            }
            back={
              <div className="flex flex-col items-center justify-center w-full h-full bg-[#111] rounded-[2rem] border border-[var(--primary-main)]/30 shadow-[0_0_30px_var(--primary-main)/20] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-[var(--primary-main)]/20 rounded-full blur-[80px]"></div>

                <div className="relative z-10 bg-white p-4 rounded-3xl shadow-2xl skew-x-1">
                  <QrCode className="w-40 h-40 text-black" />
                </div>

                <div className="relative z-10 mt-8 text-center space-y-2">
                  <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">SEU PASSE VIP</h3>
                  <p className="text-[10px] text-[var(--primary-main)] font-bold uppercase tracking-[0.2em]">Membro ID: {user.id.slice(0, 8)}</p>
                </div>
                <p className="absolute bottom-4 text-[9px] text-[var(--text-muted)] uppercase tracking-widest">Toque para voltar</p>
              </div>
            }
          />

          <motion.div variants={slideUp} className="grid grid-cols-2 gap-3 mb-8">
            <Card variant="glass" className="h-32 flex flex-col justify-between p-4">
              <div className="w-10 h-10 rounded-full bg-[var(--primary-main)]/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[var(--primary-main)]" />
              </div>
              <div>
                <span className="text-3xl font-black text-[var(--text-primary)] block">{user.history?.length || 0}</span>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Rolês Totais</span>
              </div>
            </Card>

            <Card variant="glass" className="h-32 flex flex-col justify-between relative overflow-hidden p-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center relative z-10">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div className="relative z-10">
                <span className="text-xl font-black text-[var(--text-primary)] block truncate">{user.memberSince ? new Date(user.memberSince).toLocaleDateString() : '2024'}</span>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Membro Desde</span>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
            </Card>
          </motion.div>

          <motion.div variants={slideUp}>
            <Card variant="glass" className="mb-8 relative overflow-hidden p-6">
              <div className="flex justify-between items-end mb-3 relative z-10">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Próximo Nível</span>
                <span className="text-[var(--primary-main)] font-black text-lg">{progress}%</span>
              </div>
              <div className="relative z-10 h-3 bg-slate-900/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-[var(--primary-main)] shadow-[0_0_15px_var(--primary-main)]"
                ></motion.div>
              </div>
              <p className="relative z-10 text-[10px] text-[var(--text-secondary)] mt-2 text-right">Faltam {nextLevelXp - user.points} XP</p>
            </Card>
          </motion.div>

          <div className="pb-10">
            <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-widest mb-5 flex items-center gap-2 ml-1">
              <Clock className="w-4 h-4" /> Histórico Recente
            </h3>
            <motion.div
              initial="initial"
              animate="animate"
              className="space-y-4 relative pl-4 border-l-2 border-[var(--border-default)] ml-2"
            >
              {user.history?.map((checkin, idx) => (
                <motion.div
                  variants={slideUp}
                  custom={idx}
                  key={checkin.id}
                  className="relative pl-6"
                >
                  <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--bg-default)] border-2 border-[var(--primary-main)] z-10"></div>
                  <Card variant="glass" className="flex items-center gap-4 hover:bg-white/5 transition-colors p-3">
                    <img src={checkin.snapshotImageUrl || FALLBACK_IMAGE} className="w-12 h-12 rounded-xl object-cover bg-slate-800" alt="" />
                    <div className="flex-1">
                      <h4 className="font-bold text-[var(--text-primary)] text-sm">{checkin.placeName}</h4>
                      <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase mt-0.5">{new Date(checkin.timestamp).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs font-black text-[var(--primary-main)]">+{checkin.xpEarned} XP</span>
                  </Card>
                </motion.div>
              ))}
              {(!user.history || user.history.length === 0) && (
                <p className="text-[var(--text-muted)] text-sm py-4 italic pl-6">Nenhum rolê registrado ainda.</p>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SocialButton = ({ icon, onClick }: { icon: React.ReactNode, onClick?: () => void }) => (
  <Button variant="secondary" size="icon" className="w-12 h-12 rounded-2xl p-0 hover:bg-[var(--primary-main)] hover:text-black transition-all active:scale-95" onClick={onClick}>
    {icon}
  </Button>
);
