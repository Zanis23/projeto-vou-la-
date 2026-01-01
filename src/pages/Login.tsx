
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronRight, Moon, Store, Chrome, Apple as AppleIcon } from 'lucide-react';
import { db } from '@/utils/storage';
import { triggerHaptic } from '@/utils/haptics';
import { User } from '@/types';

// UI Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { SocialLoginButton } from '@/components/ui/SocialLoginButton';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

interface LoginProps {
  onLogin: (name: string, isNewUser: boolean, user?: User) => void;
  onBusinessClick?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBusinessClick }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await db.auth.login(email, password);
      if (res.success && res.user) {
        triggerHaptic('success');
        onLogin(res.user.name, false, res.user);
      } else {
        setError(res.message || "Erro ao entrar. Verifique suas credenciais.");
        triggerHaptic('error');
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-[#FDFDFE] relative overflow-x-hidden">
      <AnimatedBackground />

      {/* Top Controls */}
      <div className="absolute top-safe right-6 flex items-center gap-4">
        <button className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 active:scale-90 transition-all">
          <Moon className="w-5 h-5 text-gray-800" />
        </button>
      </div>

      {/* Logo & Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-10 mt-8"
      >
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl flex items-center justify-center border border-gray-100 overflow-hidden p-4">
            <img src="/icons/icon-192x192.png" alt="Vou Lá" className="w-full h-full object-contain" onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyNCIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNNjUgM0w0MCA3MEwyMCAzNUg2NUwiIGZpbGw9ImJsYWNrIi8+PC9zdmc+'; // Fallback V icon
            }} />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-2 bg-[#D9FF00] text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border-2 border-white"
          >
            BETA
          </motion.div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Vou Lá</h1>
        <p className="text-sm text-gray-500 font-medium tracking-tight">Sua conta, seu mundo.</p>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-[40px] border border-gray-100/50 bg-white/60 backdrop-blur-2xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.06)] p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#D9FF00] transition-colors" />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D9FF00]/30 focus:bg-white transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#D9FF00] transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="........"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D9FF00]/30 focus:bg-white transition-all placeholder:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
                Esqueceu a senha?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="bg-[#D9FF00] text-black shadow-xl shadow-[#D9FF00]/20 h-14 rounded-2xl active:scale-95 transition-transform"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              ACESSAR
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-gray-400 px-2 bg-transparent">
                <span className="bg-white px-3">Ou continue com</span>
              </div>
            </div>

            <div className="flex gap-4">
              <SocialLoginButton
                icon={<Chrome className="w-5 h-5 text-red-500" />}
                label="Google"
                onClick={() => { }}
              />
              <SocialLoginButton
                icon={<AppleIcon className="w-5 h-5 text-black" />}
                label="Apple"
                onClick={() => { }}
              />
            </div>
          </form>
        </Card>
      </motion.div>

      {/* Footer Actions */}
      <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-md">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Ainda não tem uma conta?</span>
          <button
            onClick={() => setIsRegister(true)}
            className="font-bold text-gray-900 hover:underline active:opacity-70"
          >
            Criar conta
          </button>
        </div>

        <button
          onClick={onBusinessClick}
          className="w-full group bg-white border border-gray-100 rounded-3xl p-5 shadow-sm active:scale-[0.98] transition-all flex items-center gap-4 text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-[#D9FF00]/10 transition-colors">
            <Store className="w-6 h-6 text-gray-900" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-0.5">PARA EMPRESAS</h3>
            <p className="text-[11px] text-gray-500 font-medium">Gerenciar meu negócio</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors" />
        </button>

        <p className="text-[10px] text-gray-400 font-medium mt-4">
          Ao entrar, você concorda com nossos <span className="underline">Termos</span> e <span className="underline">Privacidade</span>.
        </p>
      </div>
    </div>
  );
};
