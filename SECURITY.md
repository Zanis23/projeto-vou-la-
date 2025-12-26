# 🔐 Guia de Segurança - Vou Lá

## ⚠️ Ações Críticas Executadas

### 1. Remoção de Credenciais do Frontend

#### ✅ Problema Resolvido:
- **Antes:** Chave da API Gemini estava sendo injetada no bundle JavaScript via `vite.config.ts`
- **Depois:** Chave removida do frontend, todas as chamadas agora passam por proxy server-side

#### Arquivos Modificados:
- [`vite.config.ts`](file:///c:/Users/slgab/Downloads/vou-lá%20(4)/vite.config.ts) - Removido bloco `define` que expunha a chave
- [`services/geminiService.ts`](file:///c:/Users/slgab/Downloads/vou-lá%20(4)/services/geminiService.ts) - Refatorado para chamar `/api/gemini-proxy`
- [`api/gemini-proxy.ts`](file:///c:/Users/slgab/Downloads/vou-lá%20(4)/api/gemini-proxy.ts) - **NOVO** endpoint server-side seguro

### 2. Proteção de Credenciais

#### ✅ `.env` Protegido:
- Arquivo `.env` já estava em `.gitignore` (não versionado)
- Criado `.env.example` com placeholders seguros
- **IMPORTANTE:** Nunca commitar arquivos `.env` ou `.env.local`

### 3. Endpoint Server-Side Seguro

O novo endpoint `/api/gemini-proxy` implementa:

✅ **Autenticação:** Requer token JWT do Supabase  
✅ **Rate Limiting:** 20 requisições por minuto por usuário  
✅ **Validação:** Verifica todos os parâmetros antes de processar  
✅ **Logging:** Registra todas as chamadas para monitoramento  
✅ **Error Handling:** Não expõe erros internos ao cliente  

---

## 🔑 Próximos Passos URGENTES

### A. Rotacionar Chaves do Supabase

> [!CAUTION]
> **A chave anon do Supabase foi exposta publicamente. É CRÍTICO rotacioná-la.**

#### Passo-a-Passo:

1. **Acessar Dashboard do Supabase:**
   - URL: https://supabase.com/dashboard/project/qfqazksheoovpwquhcjo
   - Login com sua conta

2. **Rotacionar Anon Key:**
   - Ir em: Settings → API
   - Clicar em "Reset anon key"
   - **COPIAR** a nova chave gerada

3. **Atualizar Variáveis de Ambiente:**
   
   **Localmente (.env):**
   ```bash
   VITE_SUPABASE_URL=https://qfqazksheoovpwquhcjo.supabase.co
   VITE_SUPABASE_ANON_KEY=<NOVA_CHAVE_AQUI>
   ```

   **No Vercel:**
   - Acessar: https://vercel.com/seu-projeto/settings/environment-variables
   - Editar `VITE_SUPABASE_ANON_KEY`
   - Colar a nova chave
   - **Redeploy** o projeto

4. **Verificar RLS Policies:**
   - Ir em: Database → Policies
   - Garantir que todas as tabelas sensíveis têm RLS habilitado
   - Revisar policies de `users`, `profiles`, `places`, `interactions`, `chats`

### B. Configurar Chave Gemini no Servidor

> [!IMPORTANT]
> **A chave Gemini NUNCA deve estar no `.env` local (cliente). Apenas no servidor.**

#### Passo-a-Passo:

1. **Gerar Nova Chave (se a atual foi exposta):**
   - Acessar: https://aistudio.google.com/apikey
   - Revogar chave antiga (se existir)
   - Criar nova chave

2. **Configurar no Vercel (APENAS):**
   - Acessar: https://vercel.com/seu-projeto/settings/environment-variables
   - Adicionar nova variável:
     - **Name:** `GEMINI_API_KEY`
     - **Value:** `<SUA_CHAVE_AQUI>`
     - **Environment:** Production, Preview, Development
   - Salvar

3. **NUNCA adicionar ao `.env` local:**
   ```bash
   # ❌ ERRADO - NÃO FAZER ISSO:
   # GEMINI_API_KEY=sua-chave
   
   # ✅ CORRETO - Chave só no Vercel (server-side)
   # O cliente chama /api/gemini-proxy que usa a chave do servidor
   ```

4. **Redeploy no Vercel:**
   ```bash
   git add .
   git commit -m "security: implement server-side Gemini proxy"
   git push
   ```

---

## 🛡️ Checklist de Segurança

### Imediato (Hoje):
- [ ] Rotacionar chave anon do Supabase
- [ ] Configurar `GEMINI_API_KEY` no Vercel
- [ ] Redeploy da aplicação
- [ ] Testar que `/api/gemini-proxy` está funcionando

### Curto Prazo (Esta Semana):
- [ ] Revisar e melhorar RLS policies do Supabase
- [ ] Implementar verificação JWT adequada no proxy
- [ ] Configurar monitoramento de billing (Gemini + Supabase)
- [ ] Adicionar alertas de rate limiting

### Médio Prazo (Próximas 2 Semanas):
- [ ] Implementar secret scanning no CI/CD
- [ ] Configurar Sentry para error tracking
- [ ] Documentar políticas de segurança para a equipe
- [ ] Realizar audit de segurança completo

---

## 🚨 O Que NÃO Fazer

❌ **NUNCA commitar arquivos:**
- `.env`
- `.env.local`
- `.env.production`
- Qualquer arquivo com credenciais

❌ **NUNCA expor no frontend:**
- API keys (Gemini, OpenAI, etc.)
- Service role keys do Supabase
- Tokens de autenticação de serviços

❌ **NUNCA fazer chamadas diretas de APIs pagas do cliente:**
- Sempre usar proxy server-side
- Implementar rate limiting
- Validar autenticação

---

## 📊 Monitoramento

### Logs para Verificar:

**Vercel Logs:**
```bash
vercel logs --follow
```

**Procurar por:**
- `Gemini API request:` - Chamadas bem-sucedidas
- `Gemini API error:` - Erros que precisam atenção
- `Rate limit exceeded` - Usuários atingindo limite

### Métricas Importantes:

1. **Custo da API Gemini:**
   - Acessar: https://aistudio.google.com/apikey
   - Monitorar uso diário/mensal
   - Configurar alertas de billing

2. **Uso do Supabase:**
   - Dashboard → Usage
   - Verificar: Database size, API requests, Bandwidth
   - Configurar alertas se ultrapassar limites

---

## 🔄 Rollback Plan

Se algo der errado após o deploy:

### 1. Reverter Deploy no Vercel:
```bash
# Via dashboard Vercel:
# Deployments → Selecionar deploy anterior → Promote to Production
```

### 2. Restaurar Chaves Antigas (Temporário):
- Manter chaves antigas ativas por 24h durante transição
- Reverter variáveis de ambiente se necessário

### 3. Contato de Emergência:
- Suporte Vercel: https://vercel.com/support
- Suporte Supabase: https://supabase.com/support

---

## 📞 Suporte

Para dúvidas sobre este guia:
- **Email:** [seu-email]
- **Urgências:** [seu-telefone]

---

*Última atualização: 26 de dezembro de 2024*  
*Versão: 1.0*
