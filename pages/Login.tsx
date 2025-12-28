import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { Logo } from '../components/Logo';
import { Building2, ChevronRight, AlertCircle, Mail, Lock, User as UserIcon, Chrome, Apple } from 'lucide-react';
import { db } from '../utils/storage';
import { useHaptic } from '../hooks/useHaptic';
import { User } from '../types';

interface LoginProps {
  onLogin: (name: string, isNewUser: boolean, user?: User) => void;
  onBusinessClick?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBusinessClick }) => {
  const { trigger } = useHaptic();

  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    trigger('medium');
    const res = await db.auth.login('admin', '123');
    if (res.success && res.user) {
      trigger('success');
      onLogin(res.user.name, false, res.user);
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError("Preencha todos os campos.");
      trigger('error');
      return;
    }

    if (isRegister && !formData.name) {
      setError("Digite seu nome.");
      trigger('error');
      return;
    }

    setIsLoading(true);
    trigger('medium');

    try {
      if (isRegister) {
        const newUser: User = {
          id: `u_${Date.now()}`,
          name: formData.name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
          level: 1,
          points: 0,
          badges: [],
          memberSince: new Date().toISOString(),
          history: [],
          savedPlaces: [],
          email: formData.email,
          appMode: 'dark',
          accentColor: 'neon'
        };

        const res = await db.auth.register(newUser, formData.password);
        if (res.success) {
          alert("Conta criada! Confirme seu e-mail ou faça login.");
          setIsRegister(false);
        } else {
          setError(res.message || "Erro no cadastro.");
        }
      } else {
        const res = await db.auth.login(formData.email, formData.password);
        if (res.success && res.user) {
          trigger('success');
          onLogin(res.user.name, false, res.user);
        } else {
          let msg = res.message || "Login ou senha incorretos.";
          if (msg.includes("Email not confirmed")) msg = "Confirme seu e-mail antes de entrar.";
          if (msg.includes("Invalid login credentials")) msg = "Credenciais inválidas.";
          setError(msg);
          trigger('error');
        }
      }
    } catch (e) {
      setError("Erro de conexão.");
      trigger('error');
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogins = [
    { icon: <Chrome className="w-5 h-5" />, label: 'Google', color: 'hover:bg-white/5' },
    { icon: <Apple className="w-5 h-5" />, label: 'Apple', color: 'hover:bg-white/5' },
  ];

  return (
    <div className="full-screen bg-[#050505] overflow-hidden flex flex-col">
      {/* Dynamic Immersive Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[120vw] h-[120vw] rounded-full bg-gradient-to-br from-primary-main/20 via-primary-main/5 to-transparent blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, -50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[30%] -left-[20%] w-[130vw] h-[130vw] rounded-full bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent blur-[140px]"
        />

        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay" />

        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 0.5px, transparent 0)', backgroundSize: '32px 32px' }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 pt-safe pb-safe overflow-y-auto hide-scrollbar">

        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10 w-full"
        >
          <div className="relative inline-flex mb-8">
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -inset-4 bg-primary-main/20 rounded-[2.5rem] blur-[30px]"
            ></motion.div>
            <div className="relative w-28 h-28 glass-card !bg-white/5 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/10 backdrop-blur-3xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-main/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <Logo className="w-16 h-16 relative z-10" />
              <div className="absolute -top-1 -right-1 bg-primary-main text-black text-[9px] font-black px-2.5 py-1 rounded-full shadow-xl rotate-12">
                PWA
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-7xl font-black text-white italic tracking-tighter leading-none mb-3">
              VOU LÁ
            </h1>
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.4em] flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-white/10" />
              Your Night, Your Rules
              <span className="w-8 h-[1px] bg-white/10" />
            </p>
          </motion.div>
        </motion.div>

        {/* Auth Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="w-full max-w-sm"
        >
          <div className="glass-card !bg-white/[0.03] rounded-[3rem] p-5 shadow-2xl border border-white/5 backdrop-blur-2xl relative overflow-hidden mb-8">
            <div className="p-2 space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    key="error-msg"
                    className="bg-status-error/10 border border-status-error/20 p-4 rounded-2xl flex items-center gap-3 text-status-error text-[11px] font-bold"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isRegister ? 'register' : 'login'}
                    initial={{ opacity: 0, x: isRegister ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRegister ? -20 : 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {isRegister && (
                      <Input
                        placeholder="Nome completo"
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        startIcon={<UserIcon className="w-4 h-4" />}
                        className="!bg-white/5"
                      />
                    )}

                    <Input
                      type="email"
                      placeholder="E-mail"
                      value={formData.email}
                      onChange={e => handleChange('email', e.target.value)}
                      startIcon={<Mail className="w-4 h-4" />}
                      className="!bg-white/5"
                    />

                    <Input
                      type="password"
                      placeholder="Senha"
                      value={formData.password}
                      onChange={e => handleChange('password', e.target.value)}
                      startIcon={<Lock className="w-4 h-4" />}
                      className="!bg-white/5"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="pt-2">
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  className="rounded-2xl !bg-primary-main !text-black shadow-[0_12px_30px_-10px_rgba(204,255,0,0.5)] active:scale-[0.98]"
                >
                  {isRegister ? 'CRIAR CONTA' : 'ACESSAR'}
                </Button>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-[9px] uppercase font-black tracking-widest text-text-tertiary">
                  <span className="bg-[#0c0c0c] px-4 rounded-full">OU ENTRE COM</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {socialLogins.map(social => (
                  <button
                    key={social.label}
                    onClick={() => trigger('light')}
                    className={`flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs font-bold text-white transition-all active:scale-95 ${social.color}`}
                  >
                    {social.icon} {social.label}
                  </button>
                ))}
              </div>

              {!isRegister && (
                <button
                  onClick={handleDemoLogin}
                  className="w-full py-2 text-text-tertiary text-[10px] font-bold uppercase tracking-[0.2em] hover:text-primary-main transition-colors"
                >
                  Continuar como Visitante
                </button>
              )}
            </div>
          </div>

          {/* Toggle Action */}
          <div className="space-y-8">
            <button
              onClick={() => { trigger('light'); setIsRegister(!isRegister); setError(null); }}
              className="w-full text-center text-sm font-bold text-text-secondary transition-colors"
            >
              {isRegister ? 'Já tem uma conta?' : 'Novo por aqui?'}
              <span className="text-primary-main ml-2 font-black italic">{isRegister ? 'ENTRAR' : 'CRIAR CONTA'}</span>
            </button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                trigger('medium');
                if (onBusinessClick) onBusinessClick();
              }}
              className="w-full glass-card !bg-white/[0.02] rounded-[2.5rem] p-5 flex items-center gap-5 group transition-all border border-white/5 hover:bg-white/[0.05]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-main to-indigo-600 flex items-center justify-center text-black shadow-2xl shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-white font-black text-sm uppercase italic leading-none mb-1">PARA BUSINESS</div>
                <div className="text-text-tertiary text-[10px] font-bold uppercase tracking-tighter truncate">Gestão & Inteligência</div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-tertiary group-hover:text-white group-hover:translate-x-1 transition-all" />
            </motion.button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center text-[9px] text-text-tertiary font-bold uppercase tracking-[0.2em] leading-relaxed opacity-50"
        >
          &copy; 2024 VOU LÁ APP &bull; DOURADOS MS<br />
          THE ULTIMATE NIGHTLIFE EXPERIENCE
        </motion.p>
      </div>
    </div>
  );
};
