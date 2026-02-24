-- ============================================================
-- MIGRATION 001: SCHEMA INICIAL — VinhoSocial
-- Executar no Supabase SQL Editor ou via Supabase CLI
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Busca full-text eficiente

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE wine_type AS ENUM (
  'tinto', 'branco', 'rose', 'espumante', 'sobremesa', 'fortificado'
);

CREATE TYPE wine_color AS ENUM ('tinto', 'branco', 'rose', 'laranja');

CREATE TYPE confraria_privacy AS ENUM ('publica', 'privada', 'oculta');

CREATE TYPE member_role AS ENUM ('admin', 'moderador', 'membro');

CREATE TYPE activity_type AS ENUM (
  'wine_added',       -- adicionou vinho à adega
  'wine_reviewed',    -- avaliou um vinho
  'wine_shared',      -- compartilhou um vinho
  'joined_confraria', -- entrou em confraria
  'event_checkin'     -- participou de evento
);

CREATE TYPE notification_type AS ENUM (
  'like',
  'comment',
  'follow',
  'mention',
  'confraria_invite',
  'event_reminder'
);

CREATE TYPE invite_status AS ENUM ('pendente', 'aceito', 'recusado');

-- ============================================================
-- TABELA: profiles
-- Estende auth.users do Supabase automaticamente via trigger
-- ============================================================

CREATE TABLE public.profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username         TEXT UNIQUE NOT NULL,
  display_name     TEXT NOT NULL,
  bio              TEXT,
  avatar_url       TEXT,
  location         TEXT,
  website          TEXT,
  is_sommelier     BOOLEAN DEFAULT FALSE,
  is_verified      BOOLEAN DEFAULT FALSE,
  followers_count  INTEGER DEFAULT 0,
  following_count  INTEGER DEFAULT 0,
  wines_count      INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: wines (Catálogo público de referência)
-- ============================================================

CREATE TABLE public.wines (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  producer         TEXT,
  country          TEXT NOT NULL,
  region           TEXT,
  sub_region       TEXT,
  appellation      TEXT,
  vintage          INTEGER,
  grape_varieties  TEXT[],
  wine_type        wine_type NOT NULL,
  wine_color       wine_color,
  alcohol_pct      DECIMAL(4,1),
  label_url        TEXT,
  description      TEXT,
  avg_rating       DECIMAL(3,2) DEFAULT 0,
  ratings_count    INTEGER DEFAULT 0,
  created_by       UUID REFERENCES public.profiles(id),
  is_verified      BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wines_name_trgm ON public.wines USING gin(name gin_trgm_ops);
CREATE INDEX idx_wines_country ON public.wines(country);
CREATE INDEX idx_wines_region ON public.wines(region);
CREATE INDEX idx_wines_type ON public.wines(wine_type);
CREATE INDEX idx_wines_vintage ON public.wines(vintage);
CREATE INDEX idx_wines_grape ON public.wines USING gin(grape_varieties);

-- ============================================================
-- TABELA: cellar_wines (Adega pessoal do usuário)
-- rating 0.5 a 5.0 = sistema de taças (1 taça = 0.5 incrementos)
-- ============================================================

CREATE TABLE public.cellar_wines (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wine_id                UUID REFERENCES public.wines(id),

  -- Dados customizados (quando não está no catálogo)
  custom_name            TEXT,
  custom_producer        TEXT,
  custom_country         TEXT,
  custom_region          TEXT,
  custom_vintage         INTEGER,
  custom_grape_varieties TEXT[],
  custom_wine_type       wine_type,

  -- Dados da adega
  photo_url              TEXT,
  quantity               INTEGER DEFAULT 1,
  purchase_price         DECIMAL(10,2),
  purchase_date          DATE,
  drink_from             INTEGER,
  drink_until            INTEGER,
  storage_location       TEXT,

  -- Avaliação (taças): 1.0 = "Não vale a ressaca", 5.0 = "Me vê uma caixa!"
  rating                 DECIMAL(3,1) CHECK (rating >= 0.5 AND rating <= 5.0),
  tasting_notes          TEXT,
  pairing_notes          TEXT,
  is_favorite            BOOLEAN DEFAULT FALSE,
  is_public              BOOLEAN DEFAULT TRUE,

  added_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cellar_user ON public.cellar_wines(user_id);
CREATE INDEX idx_cellar_wine ON public.cellar_wines(wine_id);
CREATE INDEX idx_cellar_rating ON public.cellar_wines(rating);
CREATE INDEX idx_cellar_is_public ON public.cellar_wines(is_public);

-- ============================================================
-- TABELA: follows
-- ============================================================

CREATE TABLE public.follows (
  follower_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);

-- ============================================================
-- TABELA: activities (Feed de atividades)
-- ============================================================

CREATE TABLE public.activities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type   activity_type NOT NULL,
  cellar_wine_id  UUID REFERENCES public.cellar_wines(id) ON DELETE CASCADE,
  wine_id         UUID REFERENCES public.wines(id),
  confraria_id    UUID, -- FK adicionada após criação da tabela confrarias
  event_id        UUID, -- FK adicionada após criação da tabela events
  metadata        JSONB DEFAULT '{}',
  likes_count     INTEGER DEFAULT 0,
  comments_count  INTEGER DEFAULT 0,
  is_public       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_user ON public.activities(user_id);
CREATE INDEX idx_activities_created ON public.activities(created_at DESC);
CREATE INDEX idx_activities_type ON public.activities(activity_type);

-- ============================================================
-- TABELA: likes
-- ============================================================

CREATE TABLE public.likes (
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id  UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, activity_id)
);

CREATE INDEX idx_likes_activity ON public.likes(activity_id);

-- ============================================================
-- TABELA: comments
-- ============================================================

CREATE TABLE public.comments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id  UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id    UUID REFERENCES public.comments(id),
  content      TEXT NOT NULL,
  likes_count  INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_activity ON public.comments(activity_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);

-- ============================================================
-- TABELA: confrarias
-- ============================================================

CREATE TABLE public.confrarias (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  description    TEXT,
  avatar_url     TEXT,
  cover_url      TEXT,
  privacy        confraria_privacy DEFAULT 'publica',
  owner_id       UUID NOT NULL REFERENCES public.profiles(id),
  members_count  INTEGER DEFAULT 1,
  wines_count    INTEGER DEFAULT 0,
  events_count   INTEGER DEFAULT 0,
  tags           TEXT[],
  location       TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_confrarias_owner ON public.confrarias(owner_id);
CREATE INDEX idx_confrarias_privacy ON public.confrarias(privacy);
CREATE INDEX idx_confrarias_name_trgm ON public.confrarias USING gin(name gin_trgm_ops);

-- Adicionar FK de activities → confrarias
ALTER TABLE public.activities
  ADD CONSTRAINT fk_activities_confraria
  FOREIGN KEY (confraria_id) REFERENCES public.confrarias(id) ON DELETE SET NULL;

-- ============================================================
-- TABELA: confraria_members
-- ============================================================

CREATE TABLE public.confraria_members (
  confraria_id  UUID NOT NULL REFERENCES public.confrarias(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role          member_role DEFAULT 'membro',
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (confraria_id, user_id)
);

CREATE INDEX idx_confraria_members_user ON public.confraria_members(user_id);

-- ============================================================
-- TABELA: confraria_invites
-- ============================================================

CREATE TABLE public.confraria_invites (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  confraria_id  UUID NOT NULL REFERENCES public.confrarias(id) ON DELETE CASCADE,
  invited_by    UUID NOT NULL REFERENCES public.profiles(id),
  invited_user  UUID REFERENCES public.profiles(id),
  invite_token  TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  status        invite_status DEFAULT 'pendente',
  expires_at    TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: events (Eventos e degustações)
-- ============================================================

CREATE TABLE public.events (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  confraria_id     UUID NOT NULL REFERENCES public.confrarias(id) ON DELETE CASCADE,
  created_by       UUID NOT NULL REFERENCES public.profiles(id),
  title            TEXT NOT NULL,
  description      TEXT,
  cover_url        TEXT,
  location         TEXT,
  is_online        BOOLEAN DEFAULT FALSE,
  online_link      TEXT,
  starts_at        TIMESTAMPTZ NOT NULL,
  ends_at          TIMESTAMPTZ,
  max_attendees    INTEGER,
  attendees_count  INTEGER DEFAULT 0,
  wines            UUID[],
  status           TEXT DEFAULT 'agendado',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_confraria ON public.events(confraria_id);
CREATE INDEX idx_events_starts ON public.events(starts_at);

-- Adicionar FK de activities → events
ALTER TABLE public.activities
  ADD CONSTRAINT fk_activities_event
  FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;

-- ============================================================
-- TABELA: event_attendees
-- ============================================================

CREATE TABLE public.event_attendees (
  event_id      UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  confirmed_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- ============================================================
-- TABELA: notifications
-- ============================================================

CREATE TABLE public.notifications (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notification_type  notification_type NOT NULL,
  activity_id        UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  comment_id         UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  confraria_id       UUID REFERENCES public.confrarias(id) ON DELETE CASCADE,
  message            TEXT,
  is_read            BOOLEAN DEFAULT FALSE,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
