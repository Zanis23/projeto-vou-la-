

import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { TermsModal } from '../components/TermsModal';
import { Building2, ChevronRight, AlertCircle, Loader2, MapPin, Star } from 'lucide-react';
import { db, generateUserCode } from '../utils/storage';
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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy'>('terms');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    city: '',
    acceptTerms: false,
    acceptPrivacy: false
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15);
    }
    return value.substring(0, 15);
  };

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 11;
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError("Preencha todos os campos.");
      trigger('error');
      return;
    }

    if (isRegister) {
      if (!formData.name) {
        setError("Digite seu nome completo.");
        trigger('error');
        return;
      }

      if (!formData.phone || !validatePhone(formData.phone)) {
        setError("Digite um telefone válido (11 dígitos).");
        trigger('error');
        return;
      }

      const age = parseInt(formData.age);
      if (!formData.age || isNaN(age) || age < 18) {
        setError("Você deve ter pelo menos 18 anos.");
        trigger('error');
        return;
      }

      if (!formData.city || formData.city.trim().length < 2) {
        setError("Digite sua cidade.");
        trigger('error');
        return;
      }

      if (!formData.acceptTerms || !formData.acceptPrivacy) {
        setError("Você deve aceitar os Termos de Uso e a Política de Privacidade.");
        trigger('error');
        return;
      }
    }

    setIsLoading(true);
    trigger('medium');

    try {
      if (isRegister) {
        const now = new Date().toISOString();
        const newUser: User = {
          id: `u_${Date.now()}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ''),
          age: parseInt(formData.age),
          city: formData.city.trim(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
          level: 1,
          points: 0,
          badges: [],
          memberSince: now,
          history: [],
          savedPlaces: [],
          userCode: generateUserCode(),
          termsAcceptedAt: now,
          privacyAcceptedAt: now
        };

        const res = await db.auth.register(newUser, formData.password);
        if (res.success) {
          localStorage.removeItem('voula_tutorial_seen_v1');
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

  const openTermsModal = (type: 'terms' | 'privacy') => {
    setTermsModalType(type);
    setShowTermsModal(true);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[var(--background)]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface)] via-[var(--background)] to-black opacity-90"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--primary)]/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-600/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
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
          </div>
          <h1 className="text-5xl font-black text-white italic tracking-tighter drop-shadow-xl mb-2">
            VOU LÁ
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            <MapPin className="w-3 h-3 text-[var(--primary)]" /> Dourados / MS
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-[var(--surface)]/80 backdrop-blur-xl border border-[var(--border)] rounded-3xl p-2 shadow-2xl mb-6">
          <div className="p-4 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold animate-[shake_0.4s_ease-in-out]">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="space-y-3">
              {isRegister && (
                <>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                  />
                  <input
                    type="tel"
                    placeholder="Telefone (11) 99999-9999"
                    value={formData.phone}
                    onChange={e => handleChange('phone', formatPhone(e.target.value))}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Idade"
                      value={formData.age}
                      onChange={e => handleChange('age', e.target.value)}
                      min="18"
                      max="120"
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={formData.city}
                      onChange={e => handleChange('city', e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
                    />
                  </div>
                </>
              )}
              <input
                type="text"
                placeholder="E-mail"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
              />
              <input
                type="password"
                placeholder="Senha"
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--background)] transition-all"
              />

              {isRegister && (
                <div className="space-y-2 pt-2">
                  <label className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={e => handleChange('acceptTerms', e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#0E1121] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                    />
                    <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                      Aceito os{' '}
                      <button
                        type="button"
                        onClick={() => openTermsModal('terms')}
                        className="text-[var(--primary)] hover:underline font-medium"
                      >
                        Termos de Uso
                      </button>
                    </span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.acceptPrivacy}
                      onChange={e => handleChange('acceptPrivacy', e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#0E1121] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
                    />
                    <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                      Aceito a{' '}
                      <button
                        type="button"
                        onClick={() => openTermsModal('privacy')}
                        className="text-[var(--primary)] hover:underline font-medium"
                      >
                        Política de Privacidade
                      </button>
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button fullWidth onClick={handleSubmit} variant="neon" disabled={isLoading} className="h-12 shadow-lg shadow-indigo-500/20">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegister ? 'CRIAR CONTA' : 'ACESSAR')}
              </Button>
            </div>


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
            <div className="relative bg-[var(--surface)] rounded-2xl p-4 flex items-center gap-4 transition-transform group-active:scale-[0.98]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-indigo-700 flex items-center justify-center text-[var(--on-primary)] shadow-lg shadow-indigo-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[var(--text-main)] font-bold text-sm">PARA EMPRESAS</div>
                <div className="text-[var(--text-muted)] text-[10px] font-medium">Cadastre seu estabelecimento</div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text-main)] group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>

        <p className="mt-8 text-center text-[10px] text-slate-600">
          &copy; 2024 Vou Lá. Todos os direitos reservados.
        </p>

      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        type={termsModalType}
      />

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
