import { useNotifications } from '@/hooks/useNotifications'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { timeAgo } from '@/lib/utils'
import type { Notification } from '@/types'
import { cn } from '@/lib/utils'

const NOTIFICATION_MESSAGES: Record<string, string> = {
  like: 'curtiu sua atividade',
  comment: 'comentou na sua atividade',
  follow: 'começou a te seguir',
  mention: 'te mencionou',
  confraria_invite: 'te convidou para uma confraria',
  event_reminder: 'tem um evento chegando',
}

function NotificationItem({ notification }: { notification: Notification }) {
  const sender = notification.sender

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl transition-colors',
        !notification.is_read
          ? 'bg-wine-900/20 border border-wine-800/30'
          : 'bg-surface/50',
      )}
    >
      <Avatar
        src={sender?.avatar_url}
        name={sender?.display_name ?? 'Sistema'}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80">
          <span className="font-semibold text-white">
            {sender?.display_name ?? 'VinhoSocial'}
          </span>{' '}
          {NOTIFICATION_MESSAGES[notification.notification_type] ?? 'enviou uma notificação'}
        </p>
        <p className="text-xs text-white/40 mt-0.5">{timeAgo(notification.created_at)}</p>
      </div>
      {!notification.is_read && (
        <div className="w-2 h-2 bg-wine-500 rounded-full mt-1 flex-shrink-0" />
      )}
    </div>
  )
}

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, markAllRead } = useNotifications()

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-white">Notificações</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllRead()}>
            Marcar tudo como lido
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/40 text-sm">Nenhuma notificação por enquanto</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  )
}
