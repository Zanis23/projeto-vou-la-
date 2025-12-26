# 📱 Checklist para Publicação nas App Stores

## 🎯 Pré-requisitos Gerais

### Contas Necessárias:
- [ ] **Google Play Console** - $25 (pagamento único)
  - URL: https://play.google.com/console/signup
- [ ] **Apple Developer Program** - $99/ano
  - URL: https://developer.apple.com/programs/

### Builds Prontos:
- [ ] APK/AAB Android assinado (release)
- [ ] IPA iOS assinado (via Xcode)

---

## 📊 Materiais de Marketing

### Screenshots Obrigatórios:

#### Android (Google Play):
- [ ] **Mínimo:** 2 screenshots
- [ ] **Máximo:** 8 screenshots
- [ ] **Tamanhos:**
  - Phone: 1080x1920px ou 1080x2340px
  - Tablet 7": 1200x1920px
  - Tablet 10": 1920x1200px

#### iOS (App Store):
- [ ] **iPhone 6.7"** (iPhone 14 Pro Max): 1290x2796px - Mínimo 3
- [ ] **iPhone 6.5"** (iPhone 11 Pro Max): 1242x2688px - Mínimo 3
- [ ] **iPhone 5.5"** (iPhone 8 Plus): 1242x2208px - Opcional
- [ ] **iPad Pro 12.9"**: 2048x2732px - Opcional

**Dica:** Use ferramentas como [Figma](https://figma.com) ou [Canva](https://canva.com) para criar screenshots profissionais.

---

### Ícone do App:

- [ ] **1024x1024px** (PNG, sem transparência)
- [ ] Fundo sólido (não usar gradientes complexos)
- [ ] Legível em tamanhos pequenos
- [ ] Sem texto promocional ("GRÁTIS", "NOVO", etc.)

**Atual:** Usando DiceBear API - considerar criar ícone customizado

---

### Vídeo Promocional (Opcional mas Recomendado):

#### Android:
- [ ] Formato: MP4, WebM, MOV
- [ ] Duração: 30 segundos - 2 minutos
- [ ] Resolução: 1920x1080 (Full HD)

#### iOS:
- [ ] Formato: MP4, MOV
- [ ] Duração: 15-30 segundos
- [ ] Resolução: 1920x1080 ou superior

---

## 📝 Textos e Descrições

### Nome do App:
```
Vou Lá - Dourados
```
**Limite:** 30 caracteres (Google Play) / 30 caracteres (App Store)

---

### Descrição Curta (Google Play):
```
Descubra os melhores rolês de Dourados em tempo real.
```
**Limite:** 80 caracteres

---

### Descrição Completa:

```markdown
🎉 Vou Lá - Descubra os Melhores Rolês de Dourados!

Quer saber onde está a galera? Vou Lá mostra em tempo real os lugares mais animados de Dourados!

✨ FUNCIONALIDADES:

📍 Radar em Tempo Real
- Veja quantas pessoas estão em cada lugar
- Descubra eventos e promoções ativas
- Encontre seus amigos nos rolês

🎯 IA Personalizada
- Recomendações baseadas no seu estilo
- Concierge virtual para sugestões
- Insights sobre os melhores horários

💬 Conexões Sociais
- Match com pessoas no mesmo lugar
- Chat integrado
- Compartilhe momentos

🏆 Gamificação
- Ganhe pontos por check-ins
- Suba no ranking
- Desbloqueie conquistas

📱 Funciona Offline
- Cache inteligente
- Sincronização automática
- PWA instalável

🔒 Seguro e Privado
- Seus dados são protegidos
- Controle total de privacidade
- Sem compartilhamento não autorizado

Baixe agora e descubra onde está o melhor rolê de Dourados! 🚀

---

📧 Suporte: [seu-email]
🌐 Site: [seu-site]
📱 Instagram: @voula_dourados
```

**Limite:** 4000 caracteres (Google Play) / 4000 caracteres (App Store)

---

### Keywords (App Store):

```
rolê, balada, eventos, dourados, festa, bar, restaurante, amigos, social, mapa
```

**Limite:** 100 caracteres (separados por vírgula)

---

## 🔐 Política de Privacidade

### URL Obrigatória:
- [ ] Criar página de política de privacidade
- [ ] Hospedar em domínio público (ex: voula.com/privacy)
- [ ] Incluir link no app

**Template:** Ver `docs/PRIVACY_POLICY.md`

---

## 📋 Informações do App

### Categoria:
- **Google Play:** Estilo de vida / Social
- **App Store:** Lifestyle / Social Networking

### Classificação de Conteúdo:

#### Google Play:
- [ ] Preencher questionário de classificação
- [ ] Esperado: **12+** (Teen)
- Motivos: Interação social, localização

#### App Store:
- [ ] Selecionar classificação
- [ ] Esperado: **12+**
- Motivos: Infrequent/Mild Alcohol, Tobacco, or Drug Use References

---

### Permissões Justificadas:

#### Localização:
```
Vou Lá usa sua localização para mostrar os melhores lugares perto de você e permitir check-ins em estabelecimentos.
```

#### Câmera:
```
Vou Lá precisa acessar sua câmera para você tirar fotos e compartilhar momentos nos rolês.
```

#### Notificações:
```
Vou Lá envia notificações sobre eventos próximos, mensagens de amigos e atualizações de lugares favoritos.
```

---

## 🚀 Processo de Publicação

### Google Play Console:

1. **Criar App:**
   - [ ] Acessar Play Console
   - [ ] "Criar app"
   - [ ] Preencher informações básicas

2. **Configurar Ficha da Loja:**
   - [ ] Upload de screenshots
   - [ ] Ícone do app
   - [ ] Descrição curta e longa
   - [ ] Vídeo promocional (opcional)

3. **Classificação de Conteúdo:**
   - [ ] Preencher questionário
   - [ ] Obter classificação

4. **Configurar Preços:**
   - [ ] Selecionar "Gratuito"
   - [ ] Escolher países de distribuição

5. **Upload do APK/AAB:**
   - [ ] Produção → Criar nova versão
   - [ ] Upload do arquivo assinado
   - [ ] Preencher notas de versão

6. **Revisar e Publicar:**
   - [ ] Revisar todas as seções
   - [ ] Enviar para revisão
   - [ ] Aguardar aprovação (1-7 dias)

---

### Apple App Store Connect:

1. **Criar App:**
   - [ ] Acessar App Store Connect
   - [ ] "My Apps" → "+"
   - [ ] Preencher informações

2. **Configurar Informações:**
   - [ ] Screenshots para todos os tamanhos
   - [ ] Descrição e keywords
   - [ ] Ícone 1024x1024px
   - [ ] Política de privacidade URL

3. **Build Upload:**
   - [ ] Xcode → Archive
   - [ ] Distribute → App Store Connect
   - [ ] Aguardar processamento

4. **TestFlight (Opcional):**
   - [ ] Adicionar beta testers
   - [ ] Distribuir build de teste
   - [ ] Coletar feedback

5. **Submeter para Revisão:**
   - [ ] Preencher informações de revisão
   - [ ] Adicionar notas para revisores
   - [ ] Submeter
   - [ ] Aguardar aprovação (1-3 dias)

---

## ✅ Checklist Final Antes de Publicar

### Técnico:
- [ ] App funciona sem crashes
- [ ] Todas as features testadas
- [ ] Performance aceitável (Lighthouse >= 80)
- [ ] Sem dados de teste/debug em produção
- [ ] Variáveis de ambiente configuradas
- [ ] Analytics configurado
- [ ] Crash reporting ativo (Sentry)

### Legal:
- [ ] Política de privacidade publicada
- [ ] Termos de uso publicados
- [ ] LGPD compliance verificado
- [ ] Permissões justificadas

### Marketing:
- [ ] Screenshots profissionais
- [ ] Descrição otimizada (SEO)
- [ ] Ícone atraente
- [ ] Vídeo promocional (opcional)

### Suporte:
- [ ] Email de suporte configurado
- [ ] FAQ preparado
- [ ] Canais de suporte definidos

---

## 📊 Pós-Publicação

### Monitoramento:
- [ ] Configurar alertas de crash
- [ ] Monitorar reviews e ratings
- [ ] Acompanhar métricas de uso
- [ ] Responder feedback de usuários

### Updates:
- [ ] Planejar roadmap de features
- [ ] Corrigir bugs reportados
- [ ] Melhorar baseado em feedback
- [ ] Publicar updates regulares

---

## 📞 Recursos Úteis

- **Google Play Console:** https://play.google.com/console
- **App Store Connect:** https://appstoreconnect.apple.com
- **Guia Google Play:** https://support.google.com/googleplay/android-developer
- **Guia App Store:** https://developer.apple.com/app-store/review/guidelines/

---

*Última atualização: 26 de dezembro de 2024*
