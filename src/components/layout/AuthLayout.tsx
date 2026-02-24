import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { Spinner } from '@/components/ui/Spinner'

export function AuthLayout() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-premium flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (user) {
    return <Navigate to={ROUTES.FEED} replace />
  }

  return (
    <div className="min-h-screen bg-gradient-premium flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="font-display font-bold text-4xl text-gold-500 tracking-tight">
          Vinho<span className="text-white">Social</span>
        </h1>
        <p className="text-white/50 text-sm mt-1">Sua adega digital</p>
      </div>

      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
