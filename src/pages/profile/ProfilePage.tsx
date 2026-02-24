import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useCellar } from '@/hooks/useCellar'
import { useIsFollowing, useToggleFollow } from '@/hooks/useFollow'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { WineGlassRating } from '@/components/ui/WineGlassRating'
import { WineTypeBadge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { ROUTES, routeTo } from '@/constants/routes'
import { getCellarWineName } from '@/types'
import { formatCount } from '@/lib/utils'
import { queryKeys } from '@/lib/queryKeys'
import type { Profile } from '@/types'

async function fetchProfileByUsername(username: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()
  return data as Profile | null
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()

  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.profile(username ?? ''),
    queryFn: () => fetchProfileByUsername(username ?? ''),
    enabled: !!username,
  })

  const isOwn = profile?.id === user?.id
  const { data: isFollowing } = useIsFollowing(profile?.id ?? '')
  const { mutate: toggleFollow, isPending: followPending } = useToggleFollow(profile?.id ?? '')
  const { data: cellarWines = [] } = useCellar(profile?.id)

  if (isLoading) return <PageSpinner />
  if (!profile) return <div className="p-4 text-white/50">Usuário não encontrado</div>

  const publicWines = isOwn ? cellarWines : cellarWines.filter((w) => w.is_public)

  return (
    <div className="flex flex-col">
      {/* Cabeçalho */}
      <div className="px-4 pt-6 pb-4 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <Avatar src={profile.avatar_url} name={profile.display_name} size="xl" />

          <div className="flex gap-2">
            {isOwn ? (
              <Link to={ROUTES.PROFILE_EDIT}>
                <Button variant="secondary" size="sm">Editar perfil</Button>
              </Link>
            ) : (
              <Button
                variant={isFollowing ? 'secondary' : 'gold'}
                size="sm"
                isLoading={followPending}
                onClick={() => toggleFollow(isFollowing ?? false)}
              >
                {isFollowing ? 'Seguindo' : 'Seguir'}
              </Button>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-white">{profile.display_name}</h1>
            {profile.is_verified && (
              <span className="text-gold-500 text-sm" title="Verificado">✓</span>
            )}
            {profile.is_sommelier && (
              <span className="text-xs bg-gold-500/20 text-gold-400 px-1.5 py-0.5 rounded-full border border-gold-500/30">
                Sommelier
              </span>
            )}
          </div>
          <p className="text-white/40 text-sm">@{profile.username}</p>
          {profile.bio && (
            <p className="text-white/70 text-sm mt-2">{profile.bio}</p>
          )}
          {profile.location && (
            <p className="text-xs text-white/30 mt-1">📍 {profile.location}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{formatCount(profile.wines_count)}</p>
            <p className="text-xs text-white/40">vinhos</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{formatCount(profile.followers_count)}</p>
            <p className="text-xs text-white/40">seguidores</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{formatCount(profile.following_count)}</p>
            <p className="text-xs text-white/40">seguindo</p>
          </div>
        </div>
      </div>

      {/* Adega */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wide">
            {isOwn ? 'Minha Adega' : 'Adega'}
          </h2>
          {isOwn && (
            <Link to={ROUTES.CELLAR_ADD} className="text-xs text-gold-500 hover:text-gold-400 transition-colors">
              + Adicionar
            </Link>
          )}
        </div>

        {publicWines.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">
            {isOwn ? 'Sua adega está vazia' : 'Adega privada'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {publicWines.slice(0, 6).map((wine) => (
              <Link
                key={wine.id}
                to={routeTo(ROUTES.CELLAR_WINE, { id: wine.id })}
                className="bg-surface rounded-xl border border-white/5 p-3 hover:border-wine-800/50 transition-colors"
              >
                <p className="text-sm font-medium text-white truncate">{getCellarWineName(wine)}</p>
                <div className="flex items-center justify-between mt-2">
                  {wine.wine?.wine_type ?? wine.custom_wine_type
                    ? <WineTypeBadge type={(wine.wine?.wine_type ?? wine.custom_wine_type)!} />
                    : <span />
                  }
                  {wine.rating && (
                    <WineGlassRating value={wine.rating} readonly size="sm" showLabel={false} />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {publicWines.length > 6 && (
          <Link
            to={isOwn ? ROUTES.CELLAR : '#'}
            className="block text-center text-xs text-gold-500 hover:text-gold-400 transition-colors mt-3"
          >
            Ver todos os {publicWines.length} vinhos
          </Link>
        )}
      </div>
    </div>
  )
}
