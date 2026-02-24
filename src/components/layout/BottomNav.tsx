import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES, routeTo } from '@/constants/routes'

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
)

const CellarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
)

const ConfrariasIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
  </svg>
)

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
)

export function BottomNav() {
  const { profile } = useAuth()
  const { unreadCount } = useNotifications()

  const profilePath = profile
    ? routeTo(ROUTES.PROFILE, { username: profile.username })
    : ROUTES.FEED

  const navItems = [
    { to: ROUTES.FEED, icon: <HomeIcon />, label: 'Feed', key: 'feed' },
    { to: ROUTES.CELLAR, icon: <CellarIcon />, label: 'Adega', key: 'cellar' },
    { to: ROUTES.SEARCH, icon: <SearchIcon />, label: 'Buscar', key: 'search' },
    { to: ROUTES.CONFRARIAS, icon: <ConfrariasIcon />, label: 'Confrarias', key: 'confrarias' },
    { to: profilePath, icon: <ProfileIcon />, label: 'Perfil', key: 'profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dark-200/95 backdrop-blur-xl border-t border-white/5 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ to, icon, label, key }) => (
          <NavLink
            key={key}
            to={to}
            end={to === ROUTES.FEED}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-gold-500'
                  : 'text-white/40 hover:text-white/70',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn('relative', isActive && 'drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]')}>
                  {icon}
                  {label === 'Perfil' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-wine-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
