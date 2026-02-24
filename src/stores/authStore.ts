import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  setAuth: (user: User | null, session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: true,

      setAuth: (user, session) =>
        set({ user, session, isLoading: false }),

      setProfile: (profile) =>
        set({ profile }),

      reset: () =>
        set({ user: null, session: null, profile: null, isLoading: false }),
    }),
    {
      name: 'vinho-auth',
      // Apenas persistir o perfil (user/session são re-hidratados pelo Supabase Auth)
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
)
