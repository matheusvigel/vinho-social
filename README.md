# VinhoSocial — PWA de Rede Social para Adegas

Plataforma para gerenciar adegas de vinho, compartilhar descobertas e criar confrarias.

## Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **PWA**: vite-plugin-pwa + Workbox
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Estado**: Zustand + TanStack Query v5
- **Forms**: react-hook-form + zod

---

## Setup

### 1. Instalar Node.js

Necessário Node.js 18+. Instale via [nvm](https://github.com/nvm-sh/nvm) ou [nodejs.org](https://nodejs.org).

```bash
# Via nvm (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
```

### 2. Instalar dependências

```bash
cd /Users/admin/Sites/vinho-social
npm install
```

### 3. Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto gratuito
2. Copie o arquivo de variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   ```
3. No dashboard do Supabase, vá em **Settings > API** e copie:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
4. Preencha o `.env.local` com suas credenciais

### 4. Configurar banco de dados

No dashboard do Supabase, vá em **SQL Editor** e execute as migrations em ordem:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_functions_triggers.sql
supabase/migrations/004_seed_catalog.sql   ← opcional (seed com vinhos)
```

### 5. Configurar Storage

No dashboard do Supabase, vá em **Storage** e crie 3 buckets públicos:

| Bucket | Tamanho máx | Tipos aceitos |
|--------|------------|---------------|
| `wine-labels` | 10MB | `image/*` |
| `user-avatars` | 5MB | `image/*` |
| `confraria-covers` | 10MB | `image/*` |

Para cada bucket, vá em **Policies** e adicione uma policy de leitura pública:
```sql
-- Policy: allow public read
CREATE POLICY "public read" ON storage.objects FOR SELECT USING (bucket_id = 'wine-labels');
```

### 6. Rodar o app

```bash
npm run dev
```

Acesse: http://localhost:5173

---

## Estrutura do Projeto

```
src/
├── components/
│   ├── ui/          # Componentes reutilizáveis (Button, Input, WineGlassRating...)
│   ├── layout/      # AppLayout, AuthLayout, Header, BottomNav
│   ├── wine/        # Componentes relacionados a vinhos
│   ├── social/      # Feed, likes, comentários, follow
│   └── confraria/   # Grupos, eventos, convites
├── pages/           # Páginas organizadas por feature
├── hooks/           # Custom hooks (useCellar, useFeed, useFollow...)
├── stores/          # Zustand stores (auth, UI, offline)
├── services/        # Supabase client e storage
├── lib/             # queryClient, queryKeys, utils
├── types/           # Tipos TypeScript de domínio
├── constants/       # Rotas, países, uvas, regiões
└── router/          # Definição de rotas + guards
```

---

## Funcionalidades

### Adega Pessoal
- Adicionar vinhos com foto, notas, harmonização
- Sistema de avaliação por taças (1-5): de "Não vale a ressaca" a "Me vê uma caixa!"
- Filtrar por tipo (tinto, branco, rosé, espumante)
- Controle de quantidade, preço, localização na adega

### Feed Social
- Feed de atividades dos usuários que você segue
- Curtir com optimistic update
- Comentários em atividades
- Realtime: novas atividades aparecem automaticamente

### Confrarias
- Criar grupos públicos, privados ou ocultos
- Membros com roles (admin, moderador, membro)
- Eventos e degustações
- Sistema de convites por token (7 dias de validade)

### Catálogo
- Base de dados com busca full-text (pg_trgm)
- Filtros por tipo, país, região, safra
- Adicionar diretamente à adega pessoal
- Seed com 35+ vinhos nacionais e internacionais

### PWA
- Instalável em Android e iOS
- Suporte offline (navegação com cache)
- Notificações push via realtime
- Estratégias de cache otimizadas por tipo de recurso

---

## Comandos

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build (testa PWA localmente)
npm run type-check   # Checagem de tipos TypeScript
npm run lint         # Lint do código
```

---

## Deploy

Recomendado: **Vercel** ou **Netlify**

```bash
npm run build
# Pasta dist/ está pronta para deploy
```

Lembre-se de configurar as variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) no painel da plataforma de deploy.
