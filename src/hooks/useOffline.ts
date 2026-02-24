import { useEffect } from 'react'
import { queryClient } from '@/lib/queryClient'
import { useOfflineStore } from '@/stores/offlineStore'
import { useUIStore } from '@/stores/uiStore'

export function useOfflineSupport() {
  const { setOnline } = useOfflineStore()
  const { showInfo, showSuccess } = useUIStore()

  useEffect(() => {
    function handleOnline() {
      setOnline(true)
      showSuccess('Conexão restaurada')
      queryClient.invalidateQueries()
    }

    function handleOffline() {
      setOnline(false)
      showInfo('Você está offline. Algumas funções estão limitadas.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline, showInfo, showSuccess])
}

export function useInstallPWA() {
  const { isInstallable, deferredPrompt, setInstallable, clearInstallable } = useUIStore()

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setInstallable(e as Parameters<typeof setInstallable>[0])
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [setInstallable])

  const install = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      clearInstallable()
    }
  }

  return { isInstallable, install }
}
