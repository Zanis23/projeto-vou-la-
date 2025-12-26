# 📊 Guia de Monitoramento e Observabilidade

## 🎯 Ferramentas Recomendadas

### 1. Sentry (Error Tracking)

#### Instalação:
```bash
npm install @sentry/react @sentry/vite-plugin
```

#### Configuração (`main.tsx`):
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE
});
```

#### Features:
- ✅ Rastreamento de erros em tempo real
- ✅ Stack traces detalhados
- ✅ Session replay
- ✅ Performance monitoring
- ✅ Alertas por email/Slack

**URL:** https://sentry.io

---

### 2. Vercel Analytics (Web Vitals)

#### Instalação:
```bash
npm install @vercel/analytics
```

#### Configuração (`App.tsx`):
```typescript
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <Analytics />
      {/* seu app */}
    </>
  );
}
```

#### Métricas Coletadas:
- ✅ Core Web Vitals (LCP, FID, CLS)
- ✅ Page views
- ✅ Unique visitors
- ✅ Top pages
- ✅ Referrers

**URL:** Vercel Dashboard → Analytics

---

### 3. PostHog (Product Analytics)

#### Instalação:
```bash
npm install posthog-js
```

#### Configuração:
```typescript
import posthog from 'posthog-js';

posthog.init('YOUR_PROJECT_API_KEY', {
  api_host: 'https://app.posthog.com'
});

// Track events
posthog.capture('check_in', {
  place_id: '123',
  place_name: 'Bar XYZ'
});
```

#### Features:
- ✅ Event tracking
- ✅ User funnels
- ✅ Session recording
- ✅ Feature flags
- ✅ A/B testing

**URL:** https://posthog.com

---

## 📈 Métricas Importantes

### Performance:
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **TTFB (Time to First Byte):** < 600ms

### Engagement:
- **DAU (Daily Active Users)**
- **MAU (Monthly Active Users)**
- **Session Duration**
- **Bounce Rate**

### Features:
- **Check-ins por dia**
- **Matches realizados**
- **Mensagens enviadas**
- **Lugares mais visitados**

### Errors:
- **Error Rate:** < 1%
- **Crash-Free Rate:** > 99.5%
- **API Error Rate:** < 2%

---

## 🚨 Alertas Configurados

### Sentry Alerts:

```yaml
# .sentry/alerts.yml
alerts:
  - name: "High Error Rate"
    condition: "error_count > 100 in 1 hour"
    actions:
      - email: dev-team@voula.com
      - slack: #alerts
  
  - name: "Performance Degradation"
    condition: "p95_response_time > 3000ms"
    actions:
      - email: dev-team@voula.com
```

### Vercel Alerts:

- ❌ Build failures
- ⚠️ Deployment errors
- 📊 Bandwidth limit (80% threshold)
- 💰 Billing alerts

### Supabase Alerts:

- 📊 Database size (80% of quota)
- 🔥 API requests (80% of quota)
- 💾 Storage usage (80% of quota)

---

## 📊 Dashboards

### 1. Vercel Dashboard
**URL:** https://vercel.com/dashboard

**Métricas:**
- Deployments status
- Web Vitals
- Bandwidth usage
- Function invocations

---

### 2. Supabase Dashboard
**URL:** https://supabase.com/dashboard

**Métricas:**
- Database size
- API requests
- Storage usage
- Active connections
- Query performance

---

### 3. Google Cloud Console (Gemini API)
**URL:** https://console.cloud.google.com

**Métricas:**
- API calls
- Quota usage
- Billing
- Errors

---

## 🔍 Logs

### Vercel Logs:

```bash
# Via CLI
vercel logs --follow

# Via Dashboard
Vercel → Project → Deployments → Functions
```

### Supabase Logs:

```sql
-- Query logs
SELECT * FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Slow queries
SELECT * FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;
```

### Browser Console:

```typescript
// Custom logging
console.log('[VouLa]', 'Event:', eventName, data);

// Error logging
window.addEventListener('error', (event) => {
  Sentry.captureException(event.error);
});
```

---

## 💰 Monitoramento de Custos

### Vercel:
- **Free Tier:** 100GB bandwidth/month
- **Pro:** $20/mês + $40/TB adicional
- **Alerta:** Configurar em 80% do limite

### Supabase:
- **Free Tier:** 500MB database, 1GB storage
- **Pro:** $25/mês + uso adicional
- **Alerta:** Configurar em 80% do limite

### Google Cloud (Gemini):
- **Pricing:** Por token/request
- **Alerta:** Budget alerts no Cloud Console

---

## 📋 Checklist de Monitoramento

### Diário:
- [ ] Verificar error rate no Sentry
- [ ] Checar deployment status no Vercel
- [ ] Revisar alertas críticos

### Semanal:
- [ ] Analisar Web Vitals
- [ ] Revisar top errors no Sentry
- [ ] Verificar uso de quota (Supabase, Gemini)
- [ ] Analisar métricas de engagement

### Mensal:
- [ ] Review de custos
- [ ] Análise de performance trends
- [ ] Planejamento de otimizações
- [ ] Update de dashboards

---

## 🎯 Metas de Monitoramento

### Availability:
- **Uptime:** > 99.9%
- **MTTR (Mean Time to Recovery):** < 1 hora

### Performance:
- **API Response Time (p95):** < 500ms
- **Page Load Time:** < 3s

### Quality:
- **Error Rate:** < 1%
- **Crash-Free Rate:** > 99.5%

### User Satisfaction:
- **App Store Rating:** > 4.5 ⭐
- **NPS (Net Promoter Score):** > 50

---

## 📞 Contatos de Emergência

### Incidentes Críticos:
- **On-call:** [telefone-emergencia]
- **Email:** incidents@voula.com
- **Slack:** #incidents

### Suporte de Provedores:
- **Vercel:** https://vercel.com/support
- **Supabase:** https://supabase.com/support
- **Sentry:** https://sentry.io/support

---

*Última atualização: 26 de dezembro de 2024*
