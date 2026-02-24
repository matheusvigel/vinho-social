import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { StorageService } from '@/services/storage.service'
import { useAuth } from './useAuth'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/lib/queryKeys'
import type { CellarWine, AddWineFormData } from '@/types'

// ============================================================
// FETCHERS
// ============================================================

async function fetchCellar(userId: string): Promise<CellarWine[]> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .select(`
      *,
      wine:wines (
        id, name, producer, country, region, vintage,
        grape_varieties, wine_type, wine_color, label_url, avg_rating
      )
    `)
    .eq('user_id', userId)
    .order('added_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as CellarWine[]
}

async function fetchCellarWine(id: string): Promise<CellarWine> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .select(`
      *,
      wine:wines (*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as unknown as CellarWine
}

// ============================================================
// HOOKS
// ============================================================

export function useCellar(userId?: string) {
  const { user } = useAuth()
  const targetId = userId ?? user?.id ?? ''

  return useQuery({
    queryKey: queryKeys.cellar(targetId),
    queryFn: () => fetchCellar(targetId),
    enabled: !!targetId,
  })
}

export function useCellarWine(id: string) {
  return useQuery({
    queryKey: queryKeys.cellarWine(id),
    queryFn: () => fetchCellarWine(id),
    enabled: !!id,
  })
}

export function useAddWine() {
  const { user } = useAuth()
  const { showSuccess, showError } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      formData,
      photoFile,
    }: {
      formData: AddWineFormData
      photoFile?: File
    }) => {
      if (!user) throw new Error('Usuário não autenticado')

      let photo_url: string | undefined

      if (photoFile) {
        photo_url = await StorageService.uploadWinePhoto(photoFile, user.id)
      }

      const { grape_varieties_raw, ...rest } = formData as AddWineFormData & { grape_varieties_raw?: string }

      const payload = {
        user_id: user.id,
        ...rest,
        photo_url,
        custom_grape_varieties: grape_varieties_raw
          ? grape_varieties_raw.split(',').map((g) => g.trim()).filter(Boolean)
          : undefined,
      }

      const { data, error } = await supabase
        .from('cellar_wines')
        .insert(payload)
        .select()
        .single()

      if (error) throw error

      // Criar atividade no feed
      await supabase.from('activities').insert({
        user_id: user.id,
        activity_type: formData.rating ? 'wine_reviewed' : 'wine_added',
        cellar_wine_id: data.id,
        wine_id: formData.wine_id ?? null,
      })

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cellar(user!.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.feed(user!.id) })
      showSuccess('Vinho adicionado à adega!')
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : 'Erro ao adicionar vinho')
    },
  })
}

export function useUpdateWine() {
  const { user } = useAuth()
  const { showSuccess, showError } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
      photoFile,
    }: {
      id: string
      updates: Partial<CellarWine>
      photoFile?: File
    }) => {
      if (!user) throw new Error('Usuário não autenticado')

      let photo_url = updates.photo_url

      if (photoFile) {
        photo_url = await StorageService.uploadWinePhoto(photoFile, user.id)
      }

      const { error } = await supabase
        .from('cellar_wines')
        .update({ ...updates, photo_url })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cellarWine(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.cellar(user!.id) })
      showSuccess('Vinho atualizado!')
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : 'Erro ao atualizar vinho')
    },
  })
}

export function useDeleteWine() {
  const { user } = useAuth()
  const { showSuccess, showError } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('cellar_wines')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cellar(user!.id) })
      showSuccess('Vinho removido da adega')
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : 'Erro ao remover vinho')
    },
  })
}
