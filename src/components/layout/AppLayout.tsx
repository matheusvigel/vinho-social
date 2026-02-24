import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { useRealtimeNotifications, useRealtimeFeed } from '@/hooks/useNotifications'
import { useOfflineSupport } from '@/hooks/useOffline'

export function AppLayout() {
  // Hooks globais do app
  useRealtimeNotifications()
  useRealtimeFeed()
  useOfflineSupport()

  return (
    <div className="min-h-screen bg-gradient-premium flex flex-col">
      <Header />
      <main className="flex-1 pb-20 max-w-2xl mx-auto w-full">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
