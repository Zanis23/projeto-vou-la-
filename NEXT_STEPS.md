# 🚀 Próximos Passos - Deploy Seguro

## ✅ O Que Já Foi Feito

### Código Atualizado:
- ✅ Endpoint `/api/gemini-proxy.ts` criado com autenticação e rate limiting
- ✅ `vite.config.ts` - Removida chave Gemini do bundle frontend
- ✅ `geminiService.ts` - Refatorado para chamar proxy server-side
- ✅ `.env.example` criado com placeholders seguros
- ✅ `SECURITY.md` - Guia completo de segurança
- ✅ GitHub Actions - Workflow de secret scanning
- ✅ `.gitleaks.toml` - Configuração de detecção de segredos
- ✅ Dependências instaladas (`@vercel/node`)
- ✅ Commit realizado no Git

---

## 🔴 AÇÕES URGENTES NECESSÁRIAS

### 1. Configurar Variáveis de Ambiente no Vercel

> [!CAUTION]
> **O app não funcionará até que estas variáveis sejam configuradas no Vercel!**

#### Passo-a-Passo:

1. **Acessar Vercel Dashboard:**
   - URL: https://vercel.com/
   - Login com sua conta
   - Selecionar o projeto "Vou Lá"

2. **Ir para Settings → Environment Variables:**
   - Clicar em "Add New"

3. **Adicionar Variável `GEMINI_API_KEY`:**
   ```
   Name: GEMINI_API_KEY
   Value: [SUA_CHAVE_GEMINI_AQUI]
   Environments: ✅ Production ✅ Preview ✅ Development
   ```
   - Clicar em "Save"

4. **Verificar Variáveis Existentes:**
   - `VITE_SUPABASE_URL` - Deve estar presente
   - `VITE_SUPABASE_ANON_KEY` - Deve estar presente (será rotacionada depois)

5. **Fazer Push para Deploy:**
   ```bash
   git push origin master
   ```

6. **Aguardar Deploy:**
   - Vercel fará deploy automaticamente
   - Acompanhar em: https://vercel.com/seu-projeto/deployments

---

### 2. Rotacionar Chave do Supabase

> [!WARNING]
> **A chave anon foi exposta. Rotacione HOJE!**

#### Instruções Detalhadas:

Consulte o arquivo [`SECURITY.md`](file:///c:/Users/slgab/Downloads/vou-lá%20(4)/SECURITY.md) seção "A. Rotacionar Chaves do Supabase"

**Resumo:**
1. Dashboard Supabase → Settings → API
2. Reset anon key
3. Copiar nova chave
4. Atualizar no Vercel: `VITE_SUPABASE_ANON_KEY`
5. Redeploy

---

### 3. Obter/Rotacionar Chave Gemini

#### Se Você JÁ TEM uma chave:
1. Acessar: https://aistudio.google.com/apikey
2. **Revogar** a chave antiga (foi exposta)
3. Criar nova chave
4. Adicionar no Vercel (passo 1 acima)

#### Se Você NÃO TEM uma chave:
1. Acessar: https://aistudio.google.com/apikey
2. Fazer login com conta Google
3. Clicar em "Create API Key"
4. Copiar a chave gerada
5. Adicionar no Vercel (passo 1 acima)

---

## 🧪 Testar o Deploy

Após configurar as variáveis e fazer deploy:

### 1. Verificar que o App Carrega:
```
https://seu-app.vercel.app
```

### 2. Testar Funcionalidade Gemini:
- Fazer login no app
- Tentar usar qualquer feature que chama Gemini (recomendações, insights, etc.)
- Verificar que funciona sem erros

### 3. Verificar Logs no Vercel:
```bash
# Via CLI (se instalado):
vercel logs --follow

# Ou via Dashboard:
# https://vercel.com/seu-projeto/deployments → Selecionar deploy → Functions
```

**Procurar por:**
- ✅ `Gemini API request: getRecommendation by user ...` (sucesso)
- ❌ `GEMINI_API_KEY not configured` (erro - variável não configurada)
- ❌ `Unauthorized - Missing token` (erro - problema de autenticação)

---

## 📊 Checklist de Validação

Marque conforme completa:

### Configuração:
- [ ] `GEMINI_API_KEY` configurada no Vercel
- [ ] `VITE_SUPABASE_URL` presente no Vercel
- [ ] `VITE_SUPABASE_ANON_KEY` presente no Vercel
- [ ] Push realizado (`git push origin master`)
- [ ] Deploy concluído com sucesso no Vercel

### Rotação de Chaves:
- [ ] Chave Gemini rotacionada (se já tinha uma)
- [ ] Chave Supabase anon rotacionada
- [ ] Chaves antigas revogadas

### Testes:
- [ ] App carrega sem erros
- [ ] Login funciona
- [ ] Features com Gemini funcionam
- [ ] Logs do Vercel mostram chamadas bem-sucedidas
- [ ] Não há erros de "API key not configured"

### Segurança:
- [ ] Arquivo `.env` NÃO está no repositório Git
- [ ] Chave Gemini NÃO aparece no código fonte
- [ ] Secret scanning ativo no GitHub

---

## 🔄 Se Algo Der Errado

### Erro: "GEMINI_API_KEY not configured"
**Solução:**
1. Verificar que a variável foi adicionada no Vercel
2. Verificar que está em todos os ambientes (Production, Preview, Development)
3. Fazer redeploy: `git commit --allow-empty -m "redeploy" && git push`

### Erro: "Unauthorized - Missing token"
**Solução:**
1. Verificar que o usuário está logado no app
2. Verificar que o token Supabase está sendo enviado
3. Checar logs do navegador (F12 → Console)

### Erro: "Rate limit exceeded"
**Solução:**
- Normal se muitas requisições em pouco tempo
- Aguardar 1 minuto
- Se persistir, ajustar limites em `/api/gemini-proxy.ts`

### App não carrega:
**Solução:**
1. Verificar logs do Vercel
2. Verificar que o build foi bem-sucedido
3. Tentar rollback para deploy anterior

---

## 📞 Próximos Passos Após Deploy

Quando tudo estiver funcionando:

1. **Milestone 2 - Performance/PWA:**
   - Configurar Workbox para offline
   - Otimizar imagens
   - Code-splitting

2. **Milestone 3 - Capacitor:**
   - Integrar plugins nativos
   - Gerar builds Android/iOS

3. **Milestone 4 - Publicação:**
   - Preparar para App Stores
   - Documentação final

---

## 📧 Suporte

Se precisar de ajuda:
- **Documentação:** [`SECURITY.md`](file:///c:/Users/slgab/Downloads/vou-lá%20(4)/SECURITY.md)
- **Proposta Completa:** [`implementation_plan.md`](file:///C:/Users/slgab/.gemini/antigravity/brain/a0ab324d-11de-4472-8ab0-b9d6f8fd02f3/implementation_plan.md)

---

*Última atualização: 26 de dezembro de 2024*  
*Status: Aguardando configuração de variáveis de ambiente no Vercel*
