-- ============================================================
-- MIGRATION 003: FUNCTIONS E TRIGGERS — VinhoSocial
-- ============================================================

-- ============================================================
-- TRIGGER: Criar perfil ao registrar usuário
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Gerar username base a partir do email ou metadados
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9_]', '', 'g'))
  );

  -- Garantir que o username seja único
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', final_username),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: Atualizar contadores de follow
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
      SET following_count = following_count + 1
      WHERE id = NEW.follower_id;
    UPDATE public.profiles
      SET followers_count = followers_count + 1
      WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
      SET following_count = GREATEST(following_count - 1, 0)
      WHERE id = OLD.follower_id;
    UPDATE public.profiles
      SET followers_count = GREATEST(followers_count - 1, 0)
      WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

-- ============================================================
-- TRIGGER: Atualizar contador de likes na atividade
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.activities
      SET likes_count = likes_count + 1
      WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.activities
      SET likes_count = GREATEST(likes_count - 1, 0)
      WHERE id = OLD.activity_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.update_likes_count();

-- ============================================================
-- TRIGGER: Atualizar contador de comentários
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.activities
      SET comments_count = comments_count + 1
      WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.activities
      SET comments_count = GREATEST(comments_count - 1, 0)
      WHERE id = OLD.activity_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();

-- ============================================================
-- TRIGGER: Atualizar contador de vinhos no perfil
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_wines_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
      SET wines_count = wines_count + 1
      WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
      SET wines_count = GREATEST(wines_count - 1, 0)
      WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_cellar_wine_change
  AFTER INSERT OR DELETE ON public.cellar_wines
  FOR EACH ROW EXECUTE FUNCTION public.update_wines_count();

-- ============================================================
-- TRIGGER: Atualizar contador de membros da confraria
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_confraria_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.confrarias
      SET members_count = members_count + 1
      WHERE id = NEW.confraria_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.confrarias
      SET members_count = GREATEST(members_count - 1, 0)
      WHERE id = OLD.confraria_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_confraria_member_change
  AFTER INSERT OR DELETE ON public.confraria_members
  FOR EACH ROW EXECUTE FUNCTION public.update_confraria_members_count();

-- ============================================================
-- TRIGGER: Notificação de curtida
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  activity_owner UUID;
BEGIN
  SELECT user_id INTO activity_owner
    FROM public.activities
    WHERE id = NEW.activity_id;

  -- Não notificar o próprio usuário
  IF activity_owner IS NOT NULL AND activity_owner != NEW.user_id THEN
    INSERT INTO public.notifications (
      recipient_id, sender_id, notification_type, activity_id
    ) VALUES (
      activity_owner, NEW.user_id, 'like', NEW.activity_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_like
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.create_like_notification();

-- ============================================================
-- TRIGGER: Notificação de comentário
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  activity_owner UUID;
BEGIN
  SELECT user_id INTO activity_owner
    FROM public.activities
    WHERE id = NEW.activity_id;

  IF activity_owner IS NOT NULL AND activity_owner != NEW.user_id THEN
    INSERT INTO public.notifications (
      recipient_id, sender_id, notification_type, activity_id, comment_id
    ) VALUES (
      activity_owner, NEW.user_id, 'comment', NEW.activity_id, NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.create_comment_notification();

-- ============================================================
-- TRIGGER: Notificação de novo seguidor
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    recipient_id, sender_id, notification_type
  ) VALUES (
    NEW.following_id, NEW.follower_id, 'follow'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.create_follow_notification();

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER wines_updated_at
  BEFORE UPDATE ON public.wines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER cellar_wines_updated_at
  BEFORE UPDATE ON public.cellar_wines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER confrarias_updated_at
  BEFORE UPDATE ON public.confrarias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- FUNCTION: Feed do usuário (otimizada)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_feed(
  p_user_id UUID,
  p_limit   INTEGER DEFAULT 20,
  p_offset  INTEGER DEFAULT 0
)
RETURNS TABLE (
  activity_id    UUID,
  author_id      UUID,
  username       TEXT,
  display_name   TEXT,
  avatar_url     TEXT,
  activity_type  activity_type,
  cellar_wine_id UUID,
  wine_name      TEXT,
  wine_photo     TEXT,
  rating         DECIMAL,
  tasting_notes  TEXT,
  likes_count    INTEGER,
  comments_count INTEGER,
  user_liked     BOOLEAN,
  created_at     TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id                                           AS activity_id,
    p.id                                           AS author_id,
    p.username,
    p.display_name,
    p.avatar_url,
    a.activity_type,
    a.cellar_wine_id,
    COALESCE(w.name, cw.custom_name)               AS wine_name,
    cw.photo_url                                   AS wine_photo,
    cw.rating,
    cw.tasting_notes,
    a.likes_count,
    a.comments_count,
    EXISTS(
      SELECT 1 FROM public.likes l
      WHERE l.activity_id = a.id AND l.user_id = p_user_id
    )                                              AS user_liked,
    a.created_at
  FROM public.activities a
  JOIN public.profiles p ON p.id = a.user_id
  LEFT JOIN public.cellar_wines cw ON cw.id = a.cellar_wine_id
  LEFT JOIN public.wines w ON w.id = cw.wine_id
  WHERE a.is_public = TRUE
    AND (
      a.user_id = p_user_id
      OR a.user_id IN (
        SELECT following_id FROM public.follows
        WHERE follower_id = p_user_id
      )
    )
  ORDER BY a.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Busca de vinhos (catálogo)
-- ============================================================

CREATE OR REPLACE FUNCTION public.search_wines(
  p_query   TEXT DEFAULT '',
  p_type    wine_type DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_limit   INTEGER DEFAULT 20,
  p_offset  INTEGER DEFAULT 0
)
RETURNS TABLE (
  id              UUID,
  name            TEXT,
  producer        TEXT,
  country         TEXT,
  region          TEXT,
  vintage         INTEGER,
  grape_varieties TEXT[],
  wine_type       wine_type,
  label_url       TEXT,
  avg_rating      DECIMAL,
  ratings_count   INTEGER,
  relevance       REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    w.name,
    w.producer,
    w.country,
    w.region,
    w.vintage,
    w.grape_varieties,
    w.wine_type,
    w.label_url,
    w.avg_rating,
    w.ratings_count,
    CASE
      WHEN p_query = '' THEN 1.0
      ELSE similarity(w.name, p_query)
    END::REAL AS relevance
  FROM public.wines w
  WHERE
    (p_query = '' OR w.name ILIKE '%' || p_query || '%' OR similarity(w.name, p_query) > 0.1)
    AND (p_type IS NULL OR w.wine_type = p_type)
    AND (p_country IS NULL OR w.country = p_country)
  ORDER BY
    CASE WHEN p_query = '' THEN w.avg_rating ELSE similarity(w.name, p_query) END DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Estatísticas da adega do usuário
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_cellar_stats(p_user_id UUID)
RETURNS TABLE (
  total_wines      BIGINT,
  avg_rating       NUMERIC,
  countries_count  BIGINT,
  wine_types       JSONB,
  top_rated        JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT                                      AS total_wines,
    ROUND(AVG(rating), 2)                                 AS avg_rating,
    COUNT(DISTINCT COALESCE(w.country, cw.custom_country))::BIGINT AS countries_count,
    jsonb_object_agg(
      COALESCE(cw.custom_wine_type::TEXT, w.wine_type::TEXT, 'desconhecido'),
      COUNT(*)
    )                                                     AS wine_types,
    (
      SELECT jsonb_agg(sub ORDER BY sub->>'rating' DESC)
      FROM (
        SELECT jsonb_build_object(
          'name', COALESCE(w2.name, cw2.custom_name),
          'rating', cw2.rating,
          'photo', cw2.photo_url
        ) AS sub
        FROM public.cellar_wines cw2
        LEFT JOIN public.wines w2 ON w2.id = cw2.wine_id
        WHERE cw2.user_id = p_user_id AND cw2.rating IS NOT NULL
        ORDER BY cw2.rating DESC
        LIMIT 5
      ) top
    )                                                     AS top_rated
  FROM public.cellar_wines cw
  LEFT JOIN public.wines w ON w.id = cw.wine_id
  WHERE cw.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
