import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useConfraria, useConfrariaMembers, useConfrariaEvents, useJoinConfraria } from '@/hooks/useConfraria'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { CONFRARIA_PRIVACY_LABELS, MEMBER_ROLE_LABELS } from '@/types'
import { formatDateTime, formatCount } from '@/lib/utils'
// import { useAuth } from '@/hooks/useAuth'

type Tab = 'membros' | 'eventos'

export default function ConfrariaDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  // const { user } = useAuth()
  const { data: confraria, isLoading } = useConfraria(slug ?? '')
  const { data: members = [] } = useConfrariaMembers(confraria?.id ?? '')
  const { data: events = [] } = useConfrariaEvents(confraria?.id ?? '')
  const { mutate: join, isPending: joining } = useJoinConfraria()
  const [activeTab, setActiveTab] = useState<Tab>('membros')

  if (isLoading) return <PageSpinner />
  if (!confraria) return <div className="p-4 text-white/50">Confraria não encontrada</div>

  const isMember = !!confraria.user_role
  // const isAdmin = confraria.user_role === 'admin' || confraria.owner_id === user?.id

  return (
    <div className="flex flex-col">
      {/* Cover */}
      {confraria.cover_url ? (
        <img src={confraria.cover_url} alt={confraria.name} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gradient-wine" />
      )}

      {/* Info */}
      <div className="px-4 -mt-8 flex flex-col gap-4 pb-4">
        <div className="flex items-end gap-3">
          <Avatar
            src={confraria.avatar_url}
            name={confraria.name}
            size="lg"
            className="border-2 border-dark-300"
          />
          <div className="flex-1 pb-1">
            <h1 className="font-display text-xl font-bold text-white leading-tight">
              {confraria.name}
            </h1>
            <Badge variant={confraria.privacy === 'publica' ? 'success' : 'default'}>
              {CONFRARIA_PRIVACY_LABELS[confraria.privacy]}
            </Badge>
          </div>
        </div>

        {confraria.description && (
          <p className="text-white/60 text-sm">{confraria.description}</p>
        )}

        {/* Stats */}
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-lg font-bold text-white">{formatCount(confraria.members_count)}</p>
            <p className="text-xs text-white/40">membros</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{formatCount(confraria.events_count)}</p>
            <p className="text-xs text-white/40">eventos</p>
          </div>
        </div>

        {/* CTA */}
        {!isMember && confraria.privacy !== 'privada' && (
          <Button
            variant="gold"
            size="lg"
            isLoading={joining}
            onClick={() => join(confraria.id)}
            className="w-full"
          >
            Entrar na confraria
          </Button>
        )}

        {/* Tabs */}
        <div className="flex border-b border-white/10 -mx-4 px-4 gap-6">
          {(['membros', 'eventos'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-gold-500 text-gold-500'
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Membros */}
        {activeTab === 'membros' && (
          <div className="flex flex-col gap-3">
            {members.map((member) => (
              <div key={member.user_id} className="flex items-center gap-3">
                <Avatar
                  src={member.profile?.avatar_url}
                  name={member.profile?.display_name ?? '?'}
                  size="md"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {member.profile?.display_name}
                  </p>
                  <p className="text-xs text-white/40">@{member.profile?.username}</p>
                </div>
                <Badge variant={member.role === 'admin' ? 'gold' : 'default'}>
                  {MEMBER_ROLE_LABELS[member.role]}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Eventos */}
        {activeTab === 'eventos' && (
          <div className="flex flex-col gap-3">
            {events.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">
                Nenhum evento agendado.
              </p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="bg-surface rounded-xl p-3 border border-white/5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-white text-sm">{event.title}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {formatDateTime(event.starts_at)}
                      </p>
                      {event.location && (
                        <p className="text-xs text-white/40">{event.location}</p>
                      )}
                    </div>
                    <Badge
                      variant={event.status === 'agendado' ? 'success' : 'default'}
                    >
                      {event.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-white/30">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 17a6.974 6.974 0 0 1-4.696-1.81Z" />
                    </svg>
                    {event.attendees_count} confirmados
                    {event.max_attendees && ` / ${event.max_attendees}`}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
