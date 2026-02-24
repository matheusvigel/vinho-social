import { Link, useNavigate } from 'react-router-dom'
import { ROUTES, routeTo } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  showBack?: boolean
  rightAction?: React.ReactNode
}

export function Header({ title, showBack, rightAction }: HeaderProps) {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { unreadCount } = useNotifications()

  return (
    <header className="sticky top-0 z-30 bg-dark-300/95 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-3 h-14 px-4 max-w-2xl mx-auto">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-overlay text-white/60 hover:text-white transition-colors flex-shrink-0"
            aria-label="Voltar"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
        ) : (
          <Link to={ROUTES.FEED} className="flex-shrink-0">
            <span className="font-display font-bold text-xl text-gold-500 tracking-tight">
              Vinho<span className="text-white">Social</span>
            </span>
          </Link>
        )}

        {title && (
          <h1 className="flex-1 font-display font-semibold text-lg text-white truncate">
            {title}
          </h1>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Notificações */}
          <Link
            to={ROUTES.NOTIFICATIONS}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-overlay text-white/60 hover:text-white transition-colors"
            aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className={cn(
                'absolute top-1 right-1 min-w-[16px] h-4 px-0.5',
                'bg-wine-600 rounded-full flex items-center justify-center',
                'text-[10px] text-white font-bold animate-scale-in',
              )}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Avatar do usuário */}
          {profile && (
            <Link
              to={routeTo(ROUTES.PROFILE, { username: profile.username })}
              aria-label="Meu perfil"
            >
              <Avatar
                src={profile.avatar_url}
                name={profile.display_name}
                size="sm"
              />
            </Link>
          )}

          {rightAction}
        </div>
      </div>
    </header>
  )
}
