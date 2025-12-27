

import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { Building2, ChevronRight, AlertCircle, Loader2, UserCircle, MapPin, Star } from 'lucide-react';
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

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0E1121]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f35] via-[#0E1121] to-black opacity-90"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
      </div>

      <div className="relative z-10 w-full max-w-[360px] p-6 animate-[fadeIn_0.5s_ease-out]">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="relative inline-flex mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-3xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative w-24 h-24 bg-[#161b2e] rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl">
              <Logo className="w-14 h-14" />
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg rotate-12">
              BETA
            </div>
            <div className="absolute -bottom-2 -left-2 bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">
              v0.0.1
            </div>
          </div>
          <h1 className="text-5xl font-black text-white italic tracking-tighter drop-shadow-xl mb-2">
            VOU LÁ
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            <MapPin className="w-3 h-3 text-[var(--primary)]" /> Dourados / MS
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-[#161b2e]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-2 shadow-2xl mb-6">
          <div className="p-4 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold animate-[shake_0.4s_ease-in-out]">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="space-y-3">
              {isRegister && (
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full bg-[#0E1121] border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[var(--primary)] focus:bg-[#0E1121] transition-all"
                />
              )}
              <input
                type="text"
                placeholder="E-mail"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full bg-[#0E1121] border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[var(--primary)] focus:bg-[#0E1121] transition-all"
              />
              <input
                type="password"
                placeholder="Senha"
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                className="w-full bg-[#0E1121] border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[var(--primary)] focus:bg-[#0E1121] transition-all"
              />
            </div>

            <div className="pt-2">
              <Button fullWidth onClick={handleSubmit} variant="neon" disabled={isLoading} className="h-12 shadow-lg shadow-indigo-500/20">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegister ? 'CRIAR CONTA' : 'ACESSAR')}
              </Button>
            </div>

            {!isRegister && (
              <button
                onClick={handleDemoLogin}
                className="w-full py-3 rounded-xl text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <UserCircle className="w-3 h-3" /> Visitante
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button onClick={() => { setIsRegister(!isRegister); setError(null); }} className="w-full text-center text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-wider">
            {isRegister ? 'Já tenho conta' : 'Criar nova conta'}
          </button>

          <div className="flex items-center gap-4 px-2 opacity-50">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
            <Star className="w-3 h-3 text-slate-700" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
          </div>

          <button
            onClick={() => {
              trigger('medium');
              if (onBusinessClick) onBusinessClick();
            }}
            className="w-full group relative overflow-hidden rounded-2xl p-[1px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-fuchsia-600 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-[#161b2e] rounded-2xl p-4 flex items-center gap-4 transition-transform group-active:scale-[0.98]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-white font-bold text-sm">PARA EMPRESAS</div>
                <div className="text-[var(--primary-light)] text-[10px] font-medium">Cadastre seu estabelecimento</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>

        <p className="mt-8 text-center text-[10px] text-slate-600">
          &copy; 2024 Vou Lá. Todos os direitos reservados.
        </p>

      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};
