# 🎉 Vou Lá - Dourados

> Descubra os melhores rolês de Dourados em tempo real!

[![Deploy](https://img.shields.io/badge/deploy-vercel-black)](https://vercel.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-enabled-success)](https://web.dev/progressive-web-apps/)

---

## 📱 Sobre o Projeto

Vou Lá é um aplicativo social que mostra em tempo real os lugares mais animados de Dourados. Com IA personalizada, gamificação e recursos offline, você nunca mais perde o melhor rolê!

### ✨ Features Principais:

- 📍 **Radar em Tempo Real** - Veja quantas pessoas estão em cada lugar
- 🎯 **IA Personalizada** - Recomendações baseadas no seu estilo (Google Gemini)
- 💬 **Match & Chat** - Conecte-se com pessoas no mesmo lugar
- 🏆 **Gamificação** - Ganhe pontos, suba no ranking, desbloqueie conquistas
- 📱 **PWA Offline** - Funciona sem internet com sincronização automática
- 🔒 **Seguro** - Autenticação via Supabase, dados criptografados

---

## 🚀 Tech Stack

### Frontend:
- **React 19** + **TypeScript**
- **Vite** - Build tool
- **Lucide React** - Ícones
- **CSS Modules** - Estilização

### Backend/Data:
- **Supabase** - Database, Auth, Realtime
- **Google Gemini** - IA para recomendações
- **Vercel** - Hosting e serverless functions

### PWA:
- **Workbox** - Service Worker e caching
- **IndexedDB** - Offline sync queue
- **vite-plugin-pwa** - PWA configuration

### Native (Capacitor):
- **Capacitor 6** - Android e iOS
- **Plugins:** Camera, Geolocation, Push Notifications, Status Bar, Splash Screen

---

## 📦 Instalação

### Pré-requisitos:
- Node.js 18+
- npm ou yarn

### Clone e Instale:

```bash
git clone https://github.com/Zanis23/projeto-vou-la-.git
cd projeto-vou-la-
npm install --legacy-peer-deps
```

### Configurar Variáveis de Ambiente:

Copie `.env.example` para `.env` e preencha:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Importante:** `GEMINI_API_KEY` deve estar apenas no Vercel (server-side), não no `.env` local.

---

## 🛠️ Desenvolvimento

### Rodar Localmente:

```bash
npm run dev
```

Acesse: http://localhost:5173

### Build para Produção:

```bash
npm run build
npm run preview
```

### Capacitor (Apps Nativos):

```bash
# Sincronizar código web com apps nativos
npm run cap:sync

# Abrir Android Studio
npm run cap:android

# Abrir Xcode (macOS)
npm run cap:ios
```

---

## 📚 Documentação

### Guias Completos:

- [🔐 Segurança](SECURITY.md) - Rotação de chaves, boas práticas
- [🚀 Deploy](NEXT_STEPS.md) - Como fazer deploy no Vercel
- [📱 Build Nativo](docs/NATIVE_BUILD_GUIDE.md) - Gerar APK/IPA
- [📊 Lighthouse](docs/LIGHTHOUSE_GUIDE.md) - Performance audits
- [🏪 App Stores](docs/APP_STORE_CHECKLIST.md) - Publicação
- [📜 Privacidade](docs/PRIVACY_POLICY.md) - Política LGPD
- [📈 Monitoramento](docs/MONITORING.md) - Sentry, Analytics

---

## 🏗️ Arquitetura

### Estrutura de Pastas:

```
vou-lá/
├── api/                    # Vercel serverless functions
│   └── gemini-proxy.ts    # Proxy server-side para Gemini
├── components/            # Componentes React
├── pages/                 # Páginas principais
├── services/              # Serviços (Supabase, Gemini)
├── utils/                 # Utilitários
│   ├── capacitorPlugins.ts   # Wrapper plugins nativos
│   ├── imageOptimization.ts  # Otimização de imagens
│   ├── offlineSync.ts        # Sync queue offline
│   └── secureStorage.ts      # Storage seguro
├── public/                # Assets estáticos
│   └── offline.html       # Página offline
├── docs/                  # Documentação
└── .github/workflows/     # CI/CD pipelines
```

---

## 🔒 Segurança

### Melhorias Implementadas:

✅ **Credenciais Protegidas:**
- Chaves API nunca expostas no frontend
- Endpoint server-side para Gemini (`/api/gemini-proxy`)
- Secret scanning automático (Gitleaks)

✅ **Autenticação:**
- JWT do Supabase
- Rate limiting (20 req/min por usuário)

✅ **Monitoramento:**
- Sentry para error tracking
- Alertas de segurança no CI/CD

---

## 📊 Performance

### Core Web Vitals (Metas):

- **LCP:** < 2.5s ✅
- **FID:** < 100ms ✅
- **CLS:** < 0.1 ✅

### Otimizações:

- ⚡ Code-splitting (lazy loading de páginas)
- 📦 Bundle size reduzido (~37%)
- 🗄️ Workbox caching (API, imagens, tiles, fonts)
- 📴 Funciona offline com sync queue

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Equipe

- **Desenvolvedor:** [Seu Nome]
- **Email:** [seu-email]
- **GitHub:** [@Zanis23](https://github.com/Zanis23)

---

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend as a Service
- [Google Gemini](https://ai.google.dev) - IA generativa
- [Vercel](https://vercel.com) - Hosting e serverless
- [Capacitor](https://capacitorjs.com) - Framework nativo

---

## 📞 Suporte

- **Email:** [seu-email]
- **Issues:** [GitHub Issues](https://github.com/Zanis23/projeto-vou-la-/issues)
- **Documentação:** [Wiki](https://github.com/Zanis23/projeto-vou-la-/wiki)

---

**Vou Lá - Descubra os Melhores Rolês de Dourados! 🎉**

*Última atualização: 26 de dezembro de 2024*
