import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useAuth } from './useAuth'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/lib/queryKeys'
import { slugify } from '@/lib/utils'
import type { Confraria, ConfrariaMember, WineEvent, ConfrariaFormData } from '@/types'

// ============================================================
// FETCHERS
// ============================================================

async function fetchConfrarias(): Promise<Confraria[]> {
  const { data, error } = await supabase
    .from('confrarias')
    .select('*, owner:profiles!owner_id (id, username, display_name, avatar_url)')
    .eq('privacy', 'publica')
    .order('members_count', { ascending: false })
    .limit(30)

  if (error) throw error
  return (data ?? []) as unknown as Confraria[]
}

async function fetchMyConfrarias(userId: string): Promise<Confraria[]> {
  const { data, error } = await supabase
    .from('confraria_members')
    .select('confraria:confrarias (*, owner:profiles!owner_id (id, username, display_name, avatar_url))')
    .eq('user_id', userId)

  if (error) throw error
  return (data ?? []).map((d) => d.confraria) as unknown as Confraria[]
}

async function fetchConfraria(slug: string, userId: string): Promise<Confraria> {
  const { data, error } = await supabase
    .from('confrarias')
    .select('*, owner:profiles!owner_id (id, username, display_name, avatar_url)')
    .eq('slug', slug)
    .single()

  if (error) throw error

  // Buscar papel do usuário
  const { data: memberData } = await supabase
    .from('confraria_members')
    .select('role')
    .match({ confraria_id: data.id, user_id: userId })
    .maybeSingle()

  return { ...data, user_role: memberData?.role ?? null } as unknown as Confraria
}

async function fetchConfrariaMembers(confrariaId: string): Promise<ConfrariaMember[]> {
  const { data, error } = await supabase
    .from('confraria_members')
    .select('*, profile:profiles!user_id (id, username, display_name, avatar_url, is_sommelier)')
    .eq('confraria_id', confrariaId)
    .order('role')

  if (error) throw error
  return (data ?? []) as unknown as ConfrariaMember[]
}

async function fetchConfrariaEvents(confrariaId: string): Promise<WineEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('confraria_id', confrariaId)
    .order('starts_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as unknown as WineEvent[]
}

// ============================================================
// HOOKS
// ============================================================

export function useConfrarias() {
  return useQuery({
    queryKey: queryKeys.confrarias(),
    queryFn: fetchConfrarias,
  })
}

export function useMyConfrarias() {
  const { user } = useAuth()

  return useQuery({
    queryKey: queryKeys.myConfrarias(user?.id ?? ''),
    queryFn: () => fetchMyConfrarias(user!.id),
    enabled: !!user?.id,
  })
}

export function useConfraria(slug: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: queryKeys.confraria(slug),
    queryFn: () => fetchConfraria(slug, user?.id ?? ''),
    enabled: !!slug,
  })
}

export function useConfrariaMembers(confrariaId: string) {
  return useQuery({
    queryKey: queryKeys.confrariaMembers(confrariaId),
    queryFn: () => fetchConfrariaMembers(confrariaId),
    enabled: !!confrariaId,
  })
}

export function useConfrariaEvents(confrariaId: string) {
  return useQuery({
    queryKey: queryKeys.confrariaEvents(confrariaId),
    queryFn: () => fetchConfrariaEvents(confrariaId),
    enabled: !!confrariaId,
  })
}

export function useCreateConfraria() {
  const { user } = useAuth()
  const { showSuccess, showError } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: ConfrariaFormData) => {
      if (!user) throw new Error('Usuário não autenticado')

      const slug = slugify(formData.name)

      const { data, error } = await supabase
        .from('confrarias')
        .insert({
          name: formData.name,
          slug,
          description: formData.description ?? null,
          privacy: formData.privacy,
          owner_id: user.id,
          tags: formData.tags
            ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : null,
          location: formData.location ?? null,
        })
        .select()
        .single()

      if (error) throw error

      // Auto-adicionar criador como admin
      await supabase.from('confraria_members').insert({
        confraria_id: data.id,
        user_id: user.id,
        role: 'admin',
      })

      // Criar atividade
      await supabase.from('activities').insert({
        user_id: user.id,
        activity_type: 'joined_confraria',
        confraria_id: data.id,
      })

      return data as Confraria
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.confrarias() })
      queryClient.invalidateQueries({ queryKey: queryKeys.myConfrarias(user!.id) })
      showSuccess('Confraria criada com sucesso!')
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : 'Erro ao criar confraria')
    },
  })
}

export function useJoinConfraria() {
  const { user } = useAuth()
  const { showSuccess, showError } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (confrariaId: string) => {
      if (!user) throw new Error('Usuário não autenticado')

      const { error } = await supabase.from('confraria_members').insert({
        confraria_id: confrariaId,
        user_id: user.id,
        role: 'membro',
      })

      if (error) throw error

      await supabase.from('activities').insert({
        user_id: user.id,
        activity_type: 'joined_confraria',
        confraria_id: confrariaId,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.confrarias() })
      queryClient.invalidateQueries({ queryKey: queryKeys.myConfrarias(user!.id) })
      showSuccess('Você entrou na confraria!')
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : 'Erro ao entrar na confraria')
    },
  })
}
