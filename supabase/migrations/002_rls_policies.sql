-- ============================================================
-- MIGRATION 002: ROW LEVEL SECURITY — VinhoSocial
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cellar_wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confrarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confraria_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confraria_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: profiles
-- ============================================================

CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- POLICIES: wines (catálogo)
-- ============================================================

CREATE POLICY "wines_select_all" ON public.wines
  FOR SELECT USING (TRUE);

CREATE POLICY "wines_insert_authenticated" ON public.wines
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "wines_update_own_unverified" ON public.wines
  FOR UPDATE USING (auth.uid() = created_by AND is_verified = FALSE);

-- ============================================================
-- POLICIES: cellar_wines
-- ============================================================

CREATE POLICY "cellar_select" ON public.cellar_wines
  FOR SELECT USING (
    auth.uid() = user_id OR is_public = TRUE
  );

CREATE POLICY "cellar_insert_own" ON public.cellar_wines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cellar_update_own" ON public.cellar_wines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cellar_delete_own" ON public.cellar_wines
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- POLICIES: follows
-- ============================================================

CREATE POLICY "follows_select_all" ON public.follows
  FOR SELECT USING (TRUE);

CREATE POLICY "follows_insert_own" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows_delete_own" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- ============================================================
-- POLICIES: activities
-- ============================================================

CREATE POLICY "activities_select" ON public.activities
  FOR SELECT USING (
    is_public = TRUE
    OR auth.uid() = user_id
    OR auth.uid() IN (
      SELECT follower_id FROM public.follows WHERE following_id = user_id
    )
  );

CREATE POLICY "activities_insert_own" ON public.activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activities_delete_own" ON public.activities
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- POLICIES: likes
-- ============================================================

CREATE POLICY "likes_select_all" ON public.likes
  FOR SELECT USING (TRUE);

CREATE POLICY "likes_insert_own" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete_own" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- POLICIES: comments
-- ============================================================

CREATE POLICY "comments_select_all" ON public.comments
  FOR SELECT USING (TRUE);

CREATE POLICY "comments_insert_authenticated" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update_own" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- POLICIES: confrarias
-- ============================================================

CREATE POLICY "confrarias_select" ON public.confrarias
  FOR SELECT USING (
    privacy = 'publica'
    OR owner_id = auth.uid()
    OR auth.uid() IN (
      SELECT user_id FROM public.confraria_members WHERE confraria_id = id
    )
  );

CREATE POLICY "confrarias_insert_authenticated" ON public.confrarias
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "confrarias_update_admin" ON public.confrarias
  FOR UPDATE USING (
    owner_id = auth.uid()
    OR auth.uid() IN (
      SELECT user_id FROM public.confraria_members
      WHERE confraria_id = id AND role IN ('admin', 'moderador')
    )
  );

CREATE POLICY "confrarias_delete_owner" ON public.confrarias
  FOR DELETE USING (owner_id = auth.uid());

-- ============================================================
-- POLICIES: confraria_members
-- ============================================================

CREATE POLICY "members_select" ON public.confraria_members
  FOR SELECT USING (
    auth.uid() = user_id
    OR confraria_id IN (
      SELECT id FROM public.confrarias WHERE privacy = 'publica'
    )
    OR auth.uid() IN (
      SELECT user_id FROM public.confraria_members cm
      WHERE cm.confraria_id = confraria_id
    )
  );

CREATE POLICY "members_insert_self" ON public.confraria_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "members_delete_self_or_admin" ON public.confraria_members
  FOR DELETE USING (
    auth.uid() = user_id
    OR auth.uid() IN (
      SELECT user_id FROM public.confraria_members cm
      WHERE cm.confraria_id = confraria_id AND cm.role = 'admin'
    )
  );

-- ============================================================
-- POLICIES: confraria_invites
-- ============================================================

CREATE POLICY "invites_select" ON public.confraria_invites
  FOR SELECT USING (
    invited_by = auth.uid()
    OR invited_user = auth.uid()
  );

CREATE POLICY "invites_insert" ON public.confraria_invites
  FOR INSERT WITH CHECK (invited_by = auth.uid());

CREATE POLICY "invites_update_invited" ON public.confraria_invites
  FOR UPDATE USING (invited_user = auth.uid());

-- ============================================================
-- POLICIES: events
-- ============================================================

CREATE POLICY "events_select" ON public.events
  FOR SELECT USING (
    confraria_id IN (
      SELECT id FROM public.confrarias WHERE privacy = 'publica'
    )
    OR auth.uid() IN (
      SELECT user_id FROM public.confraria_members
      WHERE confraria_id = events.confraria_id
    )
  );

CREATE POLICY "events_insert_admin" ON public.events
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.confraria_members
      WHERE confraria_id = events.confraria_id
        AND role IN ('admin', 'moderador')
    )
    OR auth.uid() = (
      SELECT owner_id FROM public.confrarias WHERE id = events.confraria_id
    )
  );

CREATE POLICY "events_update_admin" ON public.events
  FOR UPDATE USING (auth.uid() = created_by);

-- ============================================================
-- POLICIES: event_attendees
-- ============================================================

CREATE POLICY "attendees_select_all" ON public.event_attendees
  FOR SELECT USING (TRUE);

CREATE POLICY "attendees_insert_own" ON public.event_attendees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "attendees_delete_own" ON public.event_attendees
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- POLICIES: notifications
-- ============================================================

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "notifications_insert_system" ON public.notifications
  FOR INSERT WITH CHECK (TRUE); -- Apenas via triggers (SECURITY DEFINER)

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE USING (auth.uid() = recipient_id);
