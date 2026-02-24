import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import { useFeed, useLike } from '@/hooks/useFeed'
import { Avatar } from '@/components/ui/Avatar'
import { WineGlassRating } from '@/components/ui/WineGlassRating'
import { Spinner } from '@/components/ui/Spinner'
import { Card, CardBody } from '@/components/ui/Card'
import { timeAgo } from '@/lib/utils'
import { ROUTES, routeTo } from '@/constants/routes'
import type { Activity } from '@/types'

function ActivityCard({ activity }: { activity: Activity }) {
  const { mutate: toggleLike, isPending } = useLike()
  const author = activity.author

  if (!author) return null

  const wineName =
    activity.cellar_wine?.wine?.name ?? activity.cellar_wine?.custom_name

  return (
    <Card className="animate-fade-in">
      <CardBody className="flex flex-col gap-3">
        {/* Header: avatar + nome + tempo */}
        <div className="flex items-center gap-3">
          <Link to={routeTo(ROUTES.PROFILE, { username: author.username })}>
            <Avatar src={author.avatar_url} name={author.display_name} size="md" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              to={routeTo(ROUTES.PROFILE, { username: author.username })}
              className="font-semibold text-white hover:text-gold-400 transition-colors text-sm"
            >
              {author.display_name}
            </Link>
            <p className="text-xs text-white/40">{timeAgo(activity.created_at)}</p>
          </div>
        </div>

        {/* Foto do vinho */}
        {activity.cellar_wine?.photo_url && (
          <img
            src={activity.cellar_wine.photo_url}
            alt={wineName ?? 'Vinho'}
            className="w-full h-56 object-cover rounded-xl"
            loading="lazy"
          />
        )}

        {/* Info do vinho */}
        {wineName && (
          <div>
            <p className="font-display font-semibold text-white">{wineName}</p>
            {activity.cellar_wine?.wine?.producer && (
              <p className="text-sm text-white/50">{activity.cellar_wine.wine.producer}</p>
            )}
          </div>
        )}

        {/* Avaliação */}
        {activity.cellar_wine?.rating && (
          <WineGlassRating
            value={activity.cellar_wine.rating}
            readonly
            size="sm"
          />
        )}

        {/* Notas de degustação */}
        {activity.cellar_wine?.tasting_notes && (
          <p className="text-sm text-white/70 italic">
            "{activity.cellar_wine.tasting_notes}"
          </p>
        )}

        {/* Actions: like + comentar */}
        <div className="flex items-center gap-4 pt-1 border-t border-white/5">
          <button
            onClick={() =>
              toggleLike({
                activityId: activity.id,
                isLiked: activity.user_liked ?? false,
              })
            }
            disabled={isPending}
            className="flex items-center gap-1.5 text-sm transition-colors"
          >
            <span
              className={
                activity.user_liked
                  ? 'text-wine-400 drop-shadow-[0_0_6px_rgba(180,68,80,0.6)]'
                  : 'text-white/40 hover:text-wine-400'
              }
            >
              {activity.user_liked ? '♥' : '♡'}
            </span>
            <span className={activity.user_liked ? 'text-wine-400' : 'text-white/40'}>
              {activity.likes_count}
            </span>
          </button>

          <Link
            to={routeTo(ROUTES.CELLAR_WINE, { id: activity.cellar_wine_id ?? '' })}
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
            </svg>
            {activity.comments_count}
          </Link>
        </div>
      </CardBody>
    </Card>
  )
}

export default function FeedPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed()
  const { ref, inView } = useInView({ threshold: 0.1 })
  const didFetchRef = useRef(false)

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !didFetchRef.current) {
      didFetchRef.current = true
      fetchNextPage().finally(() => { didFetchRef.current = false })
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const activities = data?.pages.flatMap((p) => p) ?? []

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 bg-wine-900/30 rounded-full flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-wine-600" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-semibold text-white mb-2">
          Seu feed está vazio
        </h2>
        <p className="text-white/50 text-sm max-w-xs">
          Siga outros amantes de vinho ou adicione vinhos à sua adega para começar.
        </p>
        <Link
          to={ROUTES.SEARCH}
          className="mt-6 px-6 py-2 bg-wine-800 hover:bg-wine-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Descobrir pessoas
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}

      {/* Sentinela para infinite scroll */}
      <div ref={ref} className="py-4 flex justify-center">
        {isFetchingNextPage && <Spinner />}
        {!hasNextPage && activities.length > 0 && (
          <p className="text-white/30 text-sm">Você viu tudo por hoje 🍷</p>
        )}
      </div>
    </div>
  )
}
