import { useEffect } from 'react'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Profile } from '@/types'

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.warn('fetchProfile error:', error.message)
    return null
  }
  return data as Profile | null
}

// Hook principal: escuta mudanças de autenticação globalmente
// Deve ser usado UMA VEZ no App.tsx
export function useAuthListener() {
  const { setAuth, setProfile, reset } = useAuthStore()

  useEffect(() => {
    // Hidratar sessão inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setAuth(session?.user ?? null, session)
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setProfile(profile)
      }
    })

    // Escutar mudanças de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuth(session?.user ?? null, session)

      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user.id)
        setProfile(profile)
      }

      if (event === 'SIGNED_OUT') {
        reset()
      }

      if (event === 'USER_UPDATED' && session?.user) {
        const profile = await fetchProfile(session.user.id)
        setProfile(profile)
      }
    })

    return () => subscription.unsubscribe()
  }, [setAuth, setProfile, reset])
}

// Hook de acesso ao estado de auth
export function useAuth() {
  return useAuthStore()
}

// Ações de auth
export const authActions = {
  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  },

  async signUp(email: string, password: string, username: string, displayName: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: displayName },
      },
    })
    if (error) throw new Error(error.message)
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })
    if (error) throw new Error(error.message)
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
  },

  async updateProfile(updates: Partial<Profile>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) throw new Error(error.message)

    // Atualizar store local
    const profile = await fetchProfile(user.id)
    useAuthStore.getState().setProfile(profile)
  },
}
