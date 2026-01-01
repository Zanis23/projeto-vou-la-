
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronRight, Store, Apple as AppleIcon, UserCircle, Phone, MapPin, Calendar, ShieldCheck } from 'lucide-react';
import { db } from '@/utils/storage';
import { triggerHaptic } from '@/utils/haptics';
import { User } from '@/types';

// UI Components
import { Button } from '@/components/ui/Button';
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

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegister) {
      if (!email || !password || !name || !phone || !city || !age) {
        setError("Preencha todos os campos.");
        return;
      }
      if (!acceptTerms) {
        setError("Você precisa aceitar os termos.");
        return;
      }
    } else {
      if (!email || !password) return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const newUserProps: User = {
          id: '',
          name,
          email,
          phone,
          city,
          age: parseInt(age),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          level: 1,
          points: 0,
          history: [],
          savedPlaces: [],
          memberSince: new Date().toISOString(),
          appMode: 'light',
          accentColor: 'neon'
        } as any;

        const res = await db.auth.register(newUserProps, password);
        if (res.success && res.data?.user) {
          triggerHaptic('success');
          onLogin(name, true, res.data.user);
        } else {
          setError(res.message || "Erro ao cadastrar.");
          triggerHaptic('error');
        }
      } else {
        const res = await db.auth.login(email, password);
        if (res.success && res.user) {
          triggerHaptic('success');
          onLogin(res.user.name, false, res.user);
        } else {
          setError(res.message || "Verifique suas credenciais.");
          triggerHaptic('error');
        }
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    triggerHaptic('medium');
    setIsRegister(!isRegister);
    setError(null);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-[#FDFDFE] relative overflow-x-hidden">
      <AnimatedBackground />

      {/* Logo & Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8 mt-4"
      >
        <div className="relative mb-4">
          <div className="w-28 h-28 bg-white/80 backdrop-blur-md rounded-[36px] shadow-2xl flex items-center justify-center border border-white overflow-hidden p-5">
            <img
              src="/icons/icon-192x192.png"
              alt="Vou Lá"
              className="w-full h-full object-contain filter drop-shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIzNCIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNNjUgMzBMNDAgNzBMMjAgNDBINjVMIiBmaWxsPSJibGFjayIvPjwvc3ZnPg==';
              }}
            />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-3 bg-[#D9FF00] text-black text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg border-2 border-white"
          >
            BETA
          </motion.div>
        </div>

        <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-1 uppercase italic">Vou Lá</h1>
        <p className="text-sm text-gray-400 font-bold tracking-widest uppercase text-[10px]">Sua conta. Seu mundo.</p>
      </motion.div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm mb-12"
      >
        <div className="rounded-[44px] border border-gray-100/30 bg-white/70 backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] p-7 transition-all duration-500">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 text-center block">Dados Pessoais</label>
                    <div className="relative group">
                      <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#D9FF00] transition-colors" />
                      <input
                        required
                        placeholder="Nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-12 bg-gray-50/30 border border-gray-100 rounded-2xl pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#D9FF00]/40 focus:bg-white transition-all placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#D9FF00] transition-colors" />
                      <input
                        required
                        placeholder="Telefone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-12 bg-gray-50/30 border border-gray-100 rounded-2xl pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#D9FF00]/40 focus:bg-white transition-all placeholder:text-gray-300"
                      />
                    </div>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#D9FF00] transition-colors" />
                      <input
                        required
                        type="number"
                        placeholder="Idade"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full h-12 bg-gray-50/30 border border-gray-100 rounded-2xl pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#D9FF00]/40 focus:bg-white transition-all placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#D9FF00] transition-colors" />
                    <input
                      required
                      placeholder="Cidade / Estado"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-12 bg-gray-50/30 border border-gray-100 rounded-2xl pl-11 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#D9FF00]/40 focus:bg-white transition-all placeholder:text-gray-300"
                    />
                  </div>

                  <div className="border-t border-gray-50 my-2"></div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block text-center">Acesso</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#D9FF00] transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 bg-gray-50/30 border border-gray-100 rounded-2xl pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#D9FF00]/40 focus:bg-white transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#D9FF00] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-gray-50/30 border border-gray-100 rounded-2xl pl-12 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#D9FF00]/40 focus:bg-white transition-all placeholder:text-gray-300"
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

            {isRegister && (
              <div className="flex items-start gap-3 px-1 py-1">
                <button
                  type="button"
                  onClick={() => setAcceptTerms(!acceptTerms)}
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${acceptTerms ? 'bg-[#D9FF00] border-[#D9FF00] text-black' : 'border-gray-200 bg-white'}`}
                >
                  {acceptTerms && <ShieldCheck className="w-3.5 h-3.5" />}
                </button>
                <p className="text-[10px] text-gray-400 font-bold leading-tight uppercase tracking-wider">
                  Li e aceito as <span className="text-gray-600 underline">Políticas de Privacidade</span> e <span className="text-gray-600 underline">Termos de Segurança</span>.
                </p>
              </div>
            )}

            {error && (
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="bg-[#D9FF00] text-black shadow-xl shadow-[#D9FF00]/30 h-15 rounded-2xl font-black italic tracking-tighter"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              {isRegister ? 'CRIAR CONTA' : 'ACESSAR'}
            </Button>

            {!isRegister && (
              <>
                <div className="relative py-2 flex items-center">
                  <div className="flex-1 border-t border-gray-50"></div>
                  <span className="px-4 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">ou</span>
                  <div className="flex-1 border-t border-gray-50"></div>
                </div>

                <div className="flex gap-3">
                  <SocialLoginButton
                    icon={<img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" />}
                    label="Google"
                    onClick={() => { triggerHaptic('heavy'); alert('Google Auth em breve'); }}
                  />
                  <SocialLoginButton
                    icon={<AppleIcon className="w-4 h-4 fill-current" />}
                    label="Apple"
                    onClick={() => { triggerHaptic('heavy'); alert('Apple Auth em breve'); }}
                  />
                </div>
              </>
            )}
          </form>
        </div>
      </motion.div>

      {/* Footer Actions */}
      <div className="mt-4 flex flex-col items-center gap-6 w-full max-sm mb-safe">
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-gray-400 uppercase tracking-wider">{isRegister ? 'Já tem conta?' : 'Novo por aqui?'}</span>
          <button
            onClick={toggleMode}
            className="text-gray-900 border-b-2 border-[#D9FF00] pb-0.5 hover:opacity-70 transition-opacity"
          >
            {isRegister ? 'Fazer Login' : 'Criar conta'}
          </button>
        </div>

        {!isRegister && (
          <button
            onClick={onBusinessClick}
            className="w-full max-w-sm group bg-white border border-gray-100 rounded-[32px] p-4 shadow-sm active:scale-[0.98] transition-all flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#D9FF00]/5 flex items-center justify-center group-hover:bg-[#D9FF00]/20 transition-all duration-300">
              <Store className="w-6 h-6 text-gray-900" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Vou Lá Business</h3>
                <div className="w-1 h-1 rounded-full bg-[#D9FF00]"></div>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Gerenciar meu estabelecimento</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 transition-all" />
          </button>
        )}

        {!isRegister && (
          <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.15em] text-center px-8 leading-loose">
            Ao entrar, você concorda com nossos <br />
            <span className="text-gray-400 border-b border-gray-200">Termos</span> e <span className="text-gray-400 border-b border-gray-200">Privacidade</span>.
          </p>
        )}
      </div>
    </div>
  );
};
