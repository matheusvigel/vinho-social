import { Link } from 'react-router-dom'
import { useConfrarias, useMyConfrarias, useJoinConfraria } from '@/hooks/useConfraria'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { ROUTES, routeTo } from '@/constants/routes'
import { CONFRARIA_PRIVACY_LABELS } from '@/types'
import { formatCount } from '@/lib/utils'
import type { Confraria } from '@/types'

function ConfrariaCard({ confraria, isMember }: { confraria: Confraria; isMember: boolean }) {
  const { mutate: join, isPending } = useJoinConfraria()

  return (
    <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
      {confraria.cover_url && (
        <img
          src={confraria.cover_url}
          alt={confraria.name}
          className="w-full h-28 object-cover"
        />
      )}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Avatar
            src={confraria.avatar_url}
            name={confraria.name}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <Link
              to={routeTo(ROUTES.CONFRARIA, { slug: confraria.slug })}
              className="font-display font-semibold text-white hover:text-gold-400 transition-colors text-sm leading-tight"
            >
              {confraria.name}
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={confraria.privacy === 'publica' ? 'success' : 'default'}>
                {CONFRARIA_PRIVACY_LABELS[confraria.privacy]}
              </Badge>
            </div>
          </div>
        </div>

        {confraria.description && (
          <p className="text-xs text-white/50 line-clamp-2">{confraria.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-xs text-white/40">
            <span>{formatCount(confraria.members_count)} membros</span>
            <span>{formatCount(confraria.events_count)} eventos</span>
          </div>

          {isMember ? (
            <Link
              to={routeTo(ROUTES.CONFRARIA, { slug: confraria.slug })}
              className="text-xs text-gold-500 hover:text-gold-400 transition-colors font-medium"
            >
              Ver →
            </Link>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              isLoading={isPending}
              onClick={() => join(confraria.id)}
            >
              Entrar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ConfrariasPage() {
  const { data: confrarias = [], isLoading: loadingPublic } = useConfrarias()
  const { data: myConfrarias = [], isLoading: loadingMine } = useMyConfrarias()

  const myIds = new Set(myConfrarias.map((c) => c.id))

  if (loadingPublic || loadingMine) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-white">Confrarias</h1>
        <Link to={ROUTES.CONFRARIA_NEW}>
          <Button variant="gold" size="sm">+ Criar</Button>
        </Link>
      </div>

      {/* Minhas confrarias */}
      {myConfrarias.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">
            Minhas confrarias
          </h2>
          <div className="flex flex-col gap-3">
            {myConfrarias.map((c) => (
              <ConfrariaCard key={c.id} confraria={c} isMember={true} />
            ))}
          </div>
        </section>
      )}

      {/* Confrarias públicas */}
      <section>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">
          Descobrir confrarias
        </h2>
        {confrarias.filter((c) => !myIds.has(c.id)).length === 0 ? (
          <p className="text-white/40 text-sm text-center py-8">
            Nenhuma confraria pública por enquanto.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {confrarias
              .filter((c) => !myIds.has(c.id))
              .map((c) => (
                <ConfrariaCard key={c.id} confraria={c} isMember={false} />
              ))}
          </div>
        )}
      </section>
    </div>
  )
}
