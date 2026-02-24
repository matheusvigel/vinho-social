import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ActionType = 'like' | 'unlike' | 'comment' | 'follow' | 'unfollow'

interface PendingAction {
  id: string
  type: ActionType
  payload: Record<string, unknown>
  timestamp: number
}

interface OfflineState {
  isOnline: boolean
  pendingActions: PendingAction[]
  setOnline: (online: boolean) => void
  addPendingAction: (action: Omit<PendingAction, 'id' | 'timestamp'>) => void
  removePendingAction: (id: string) => void
  clearPendingActions: () => void
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      isOnline: navigator.onLine,
      pendingActions: [],

      setOnline: (online) => set({ isOnline: online }),

      addPendingAction: (action) =>
        set((state) => ({
          pendingActions: [
            ...state.pendingActions,
            {
              ...action,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),

      removePendingAction: (id) =>
        set((state) => ({
          pendingActions: state.pendingActions.filter((a) => a.id !== id),
        })),

      clearPendingActions: () => set({ pendingActions: [] }),
    }),
    {
      name: 'vinho-offline-queue',
      partialize: (state) => ({ pendingActions: state.pendingActions }),
    },
  ),
)
