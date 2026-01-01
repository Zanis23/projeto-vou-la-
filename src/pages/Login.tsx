import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, AlertCircle, Mail, Lock, User as UserIcon, Chrome, Apple } from 'lucide-react';
import { db } from '@/utils/storage';
import { useHaptic } from '@/hooks/useHaptic';
import { User } from '@/types';

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
    { icon: <Chrome className="w-5 h-5" />, label: 'Google', color: 'hover:bg-white/10' },
    { icon: <Apple className="w-5 h-5" />, label: 'Apple', color: 'hover:bg-white/10' },
    { icon: <UserIcon className="w-5 h-5" />, label: 'Guest', color: 'hover:bg-white/10', action: handleDemoLogin },
  ];

  return (
    <div className="full-screen mesh-gradient flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[350px] relative z-10"
      >
        <div className="bg-[#101010]/80 backdrop-blur-2xl rounded-[40px] p-[35px] border border-white/5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden neon-glow">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-primary-main tracking-tighter mb-1">
              {isRegister ? 'Sign Up' : 'Sign In'}
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              {isRegister ? 'Join the Party' : 'Welcome Back'}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4 mt-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 p-3 rounded-2xl flex items-center gap-2 text-red-500 text-[10px] font-bold"
                >
                  <AlertCircle className="w-3 h-3 shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="w-full bg-[#1a1a1a] border-none px-5 py-4 rounded-[20px] shadow-[inset_0_2px_5px_rgba(0,0,0,0.2)] focus-within:ring-2 focus-within:ring-primary-main transition-all flex items-center gap-3">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <input
                      className="bg-transparent border-none outline-none text-white text-sm font-medium w-full placeholder:text-gray-600"
                      placeholder="Username"
                      value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full bg-[#1a1a1a] border-none px-5 py-4 rounded-[20px] shadow-[inset_0_2px_5px_rgba(0,0,0,0.2)] focus-within:ring-2 focus-within:ring-primary-main transition-all flex items-center gap-3"
              >
                <Mail className="w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  className="bg-transparent border-none outline-none text-white text-sm font-medium w-full placeholder:text-gray-600"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full bg-[#1a1a1a] border-none px-5 py-4 rounded-[20px] shadow-[inset_0_2px_5px_rgba(0,0,0,0.2)] focus-within:ring-2 focus-within:ring-primary-main transition-all flex items-center gap-3"
              >
                <Lock className="w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  className="bg-transparent border-none outline-none text-white text-sm font-medium w-full placeholder:text-gray-600"
                  placeholder="Password"
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                />
              </motion.div>
            </div>

            {!isRegister && (
              <div className="flex justify-end mt-2">
                <a href="#" className="text-[11px] text-primary-main font-bold no-underline hover:underline">
                  Forgot Password?
                </a>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full block font-black bg-gradient-to-r from-primary-main to-cyan-400 text-black py-4 mt-5 rounded-[20px] shadow-[0_20px_10px_-15px_rgba(34,211,238,0.3)] border-none transition-all hover:shadow-[0_23px_10px_-20px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:grayscale"
            >
              {isLoading ? <span className="animate-pulse">PROCESSING...</span> : (isRegister ? 'CREATE ACCOUNT' : 'SIGN IN')}
            </motion.button>

            {/* Social Accounts */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              <span className="block text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-4">Or Sign in with</span>
              <div className="flex justify-center gap-4">
                {socialLogins.map((social, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + (idx * 0.1) }}
                    whileHover={{ scale: 1.1, translateY: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      trigger('light');
                      if (social.action) social.action();
                    }}
                    className="w-12 h-12 rounded-2xl bg-[#1a1a1a] border border-white/5 flex items-center justify-center shadow-xl transition-all hover:border-primary-main/50 group"
                  >
                    <div className="text-gray-400 group-hover:text-primary-main transition-colors">
                      {social.icon}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Switcher & Business */}
            <div className="mt-8 pt-4 border-t border-white/5 space-y-4">
              <div className="text-center">
                <span className="text-[10px] text-gray-500">
                  {isRegister ? "Have an account?" : "Don't have an account?"}
                </span>
                <button
                  onClick={() => { trigger('light'); setIsRegister(!isRegister); setError(null); }}
                  className="ml-2 text-[10px] text-primary-main font-black uppercase tracking-widest hover:underline"
                >
                  {isRegister ? 'Sign In' : 'Sign Up'}
                </button>
              </div>

              <button
                onClick={() => { trigger('medium'); if (onBusinessClick) onBusinessClick(); }}
                className="w-full py-3 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center gap-2 text-[9px] font-black text-gray-500 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
              >
                <Building2 className="w-3 h-3" /> Access Business
              </button>
            </div>

          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-6 text-center">
        <a href="#" className="text-[9px] text-primary-main no-underline opacity-50 hover:opacity-100 transition-opacity">
          Vou Lá User License Agreement
        </a>
      </div>
    </div>
  );
};
