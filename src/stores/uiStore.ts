import { create } from 'zustand'
import toast from 'react-hot-toast'

interface UIState {
  isInstallable: boolean
  deferredPrompt: BeforeInstallPromptEvent | null
  setInstallable: (prompt: BeforeInstallPromptEvent) => void
  clearInstallable: () => void
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showInfo: (message: string) => void
}

// Tipo para o evento de instalação do PWA
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const useUIStore = create<UIState>()((set) => ({
  isInstallable: false,
  deferredPrompt: null,

  setInstallable: (prompt) =>
    set({ isInstallable: true, deferredPrompt: prompt }),

  clearInstallable: () =>
    set({ isInstallable: false, deferredPrompt: null }),

  showSuccess: (message) => {
    toast.success(message, {
      style: {
        background: '#1c1c1e',
        color: '#fff',
        border: '1px solid rgba(212, 175, 55, 0.3)',
      },
      iconTheme: { primary: '#d4af37', secondary: '#1c1c1e' },
    })
  },

  showError: (message) => {
    toast.error(message, {
      style: {
        background: '#1c1c1e',
        color: '#fff',
        border: '1px solid rgba(224, 67, 112, 0.3)',
      },
    })
  },

  showInfo: (message) => {
    toast(message, {
      style: {
        background: '#1c1c1e',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
    })
  },
}))
