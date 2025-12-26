# 🚀 Guia de Configuração - Monitoramento em Produção

## 📋 Pré-requisitos

Antes de começar, você precisará criar contas (gratuitas) em:

1. **Sentry** - https://sentry.io/signup/
2. **Vercel Analytics** - Já incluído no Vercel (grátis)
3. **PostHog** (Opcional) - https://posthog.com/signup

---

## 1️⃣ Configurar Sentry

### Passo 1: Criar Conta e Projeto

1. Acesse: https://sentry.io/signup/
2. Crie uma conta (pode usar GitHub)
3. Criar novo projeto:
   - Platform: **React**
   - Alert frequency: **On every new issue**
   - Nome: **vou-la-production**

### Passo 2: Obter DSN

Após criar o projeto, você verá o **DSN** (Data Source Name):

```
https://abc123@o123456.ingest.sentry.io/789012
```

**Copie este valor!**

### Passo 3: Configurar no Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto "vou-la"
3. Settings → Environment Variables
4. Adicionar nova variável:

```
Name: VITE_SENTRY_DSN
Value: [seu-dsn-aqui]
Environment: Production, Preview
```

5. Salvar e fazer redeploy

### Passo 4: Configurar Versão do App

Adicione também:

```
Name: VITE_APP_VERSION
Value: 1.0.0
Environment: Production, Preview
```

### Passo 5: Testar Sentry

Após o deploy, abra o console do navegador e execute:

```javascript
throw new Error('Teste Sentry');
```

Verifique se o erro aparece no dashboard do Sentry em ~1 minuto.

---

## 2️⃣ Configurar Vercel Analytics

### Passo 1: Ativar no Vercel

1. Vercel Dashboard → Seu Projeto
2. Analytics → Enable
3. Escolher plano:
   - **Hobby (Free):** 2,500 eventos/mês
   - **Pro:** Ilimitado

### Passo 2: Verificar Instalação

O pacote `@vercel/analytics` já está instalado. Após o próximo deploy, analytics estará ativo automaticamente.

### Passo 3: Ver Métricas

1. Vercel Dashboard → Analytics
2. Você verá:
   - Page views
   - Unique visitors
   - Top pages
   - Core Web Vitals (LCP, FID, CLS)

---

## 3️⃣ Configurar PostHog (Opcional)

### Passo 1: Criar Conta

1. Acesse: https://posthog.com/signup
2. Criar conta (pode usar GitHub)
3. Escolher plano:
   - **Free:** 1M eventos/mês
   - **Paid:** A partir de $0.00045/evento

### Passo 2: Obter API Key

1. PostHog Dashboard → Settings → Project
2. Copiar **Project API Key**

### Passo 3: Configurar no Vercel

```
Name: VITE_POSTHOG_KEY
Value: [seu-api-key]
Environment: Production, Preview

Name: VITE_POSTHOG_HOST
Value: https://app.posthog.com
Environment: Production, Preview
```

### Passo 4: Instalar SDK

```bash
npm install posthog-js
```

### Passo 5: Inicializar (opcional)

Criar `utils/posthog.ts`:

```typescript
import posthog from 'posthog-js';

export function initPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST;

  if (!key) return;

  posthog.init(key, {
    api_host: host,
    autocapture: true,
  });
}
```

---

## 4️⃣ Instalar Dependências

```bash
npm install --legacy-peer-deps
```

Isso instalará:
- `@sentry/react` - Error tracking
- `@sentry/vite-plugin` - Source maps
- `@vercel/analytics` - Web analytics

---

## 5️⃣ Integrar no App

### Atualizar `main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { initSentry, SentryErrorBoundary } from './utils/sentry';
import { initAnalytics } from './utils/analytics';
import App from './App';
import './index.css';

// Initialize monitoring
initSentry();
initAnalytics();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryErrorBoundary fallback={<ErrorFallback />}>
      <App />
      <Analytics />
    </SentryErrorBoundary>
  </React.StrictMode>
);

// Error fallback component
function ErrorFallback() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Algo deu errado 😔</h1>
      <p>Estamos trabalhando para resolver o problema.</p>
      <button onClick={() => window.location.reload()}>
        Recarregar Página
      </button>
    </div>
  );
}
```

---

## 6️⃣ Usar Analytics no Código

### Exemplo: Track Check-in

```typescript
import { trackEvent } from './utils/analytics';

function handleCheckIn(placeId: string) {
  // ... lógica de check-in

  trackEvent('place_checked_in', {
    place_id: placeId,
    timestamp: Date.now(),
  });
}
```

### Exemplo: Track Error

```typescript
import { captureError } from './utils/sentry';

try {
  // ... código que pode falhar
} catch (error) {
  captureError(error as Error, {
    context: 'check_in',
    place_id: placeId,
  });
}
```

---

## 7️⃣ Configurar Alertas

### Sentry Alerts:

1. Sentry Dashboard → Alerts → Create Alert
2. Configurar:
   - **Trigger:** Error count > 10 in 1 hour
   - **Action:** Email to dev-team@voula.com

### Vercel Alerts:

1. Vercel Dashboard → Settings → Notifications
2. Ativar:
   - ✅ Deployment failed
   - ✅ Deployment ready
   - ✅ Domain configuration changed

---

## 8️⃣ Verificar Instalação

### Checklist:

- [ ] Sentry DSN configurado no Vercel
- [ ] Erro de teste aparece no Sentry
- [ ] Vercel Analytics ativo
- [ ] Core Web Vitals sendo coletados
- [ ] PostHog configurado (opcional)
- [ ] Alertas configurados

---

## 📊 Dashboards

### Sentry:
- **URL:** https://sentry.io/organizations/[org]/issues/
- **Métricas:** Errors, Performance, Releases

### Vercel Analytics:
- **URL:** https://vercel.com/[user]/[project]/analytics
- **Métricas:** Page views, Web Vitals, Top pages

### PostHog:
- **URL:** https://app.posthog.com/
- **Métricas:** Events, Funnels, Session recordings

---

## 🚨 Troubleshooting

### Sentry não está recebendo eventos:

1. Verificar DSN no Vercel
2. Verificar console do navegador (erros de CORS?)
3. Testar com `throw new Error('test')`

### Vercel Analytics não mostra dados:

1. Aguardar 5-10 minutos após deploy
2. Verificar se `<Analytics />` está no código
3. Verificar se analytics está habilitado no Vercel

### PostHog não está tracking:

1. Verificar API key no Vercel
2. Verificar console (erros de inicialização?)
3. Testar com `posthog.capture('test')`

---

## 💰 Custos Estimados

### Plano Free (Recomendado para início):

- **Sentry:** 5K errors/mês - **GRÁTIS**
- **Vercel Analytics:** 2.5K eventos/mês - **GRÁTIS**
- **PostHog:** 1M eventos/mês - **GRÁTIS**

**Total: $0/mês** 🎉

### Plano Paid (Se crescer):

- **Sentry Team:** $26/mês (50K errors)
- **Vercel Pro:** $20/mês (analytics ilimitado)
- **PostHog Scale:** ~$50/mês (5M eventos)

**Total: ~$96/mês**

---

## ✅ Próximos Passos

Após configurar:

1. Fazer deploy no Vercel
2. Testar erro no Sentry
3. Verificar analytics no Vercel
4. Configurar alertas
5. Monitorar por 1 semana
6. Ajustar sampling rates se necessário

---

*Última atualização: 26 de dezembro de 2024*
