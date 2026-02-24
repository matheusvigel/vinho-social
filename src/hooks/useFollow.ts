import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useAuth } from './useAuth'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/lib/queryKeys'
import type { Profile } from '@/types'

async function fetchIsFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .match({ follower_id: followerId, following_id: followingId })
    .maybeSingle()

  return !!data
}

async function fetchFollowers(userId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('profile:profiles!follower_id (*)')
    .eq('following_id', userId)

  if (error) throw error
  return (data ?? []).map((d) => d.profile) as unknown as Profile[]
}

async function fetchFollowing(userId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('profile:profiles!following_id (*)')
    .eq('follower_id', userId)

  if (error) throw error
  return (data ?? []).map((d) => d.profile) as unknown as Profile[]
}

export function useIsFollowing(targetUserId: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: queryKeys.isFollowing(user?.id ?? '', targetUserId),
    queryFn: () => fetchIsFollowing(user!.id, targetUserId),
    enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
  })
}

export function useFollowers(userId: string) {
  return useQuery({
    queryKey: queryKeys.followers(userId),
    queryFn: () => fetchFollowers(userId),
    enabled: !!userId,
  })
}

export function useFollowing(userId: string) {
  return useQuery({
    queryKey: queryKeys.following(userId),
    queryFn: () => fetchFollowing(userId),
    enabled: !!userId,
  })
}

export function useToggleFollow(targetUserId: string) {
  const { user } = useAuth()
  const { showError } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (isFollowing: boolean) => {
      if (!user) throw new Error('Usuário não autenticado')

      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .match({ follower_id: user.id, following_id: targetUserId })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: targetUserId })
        if (error) throw error
      }
    },
    onMutate: async (isFollowing) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.isFollowing(user!.id, targetUserId),
      })

      queryClient.setQueryData(
        queryKeys.isFollowing(user!.id, targetUserId),
        !isFollowing,
      )

      return { previousIsFollowing: isFollowing }
    },
    onError: (_err, _isFollowing, context) => {
      queryClient.setQueryData(
        queryKeys.isFollowing(user!.id, targetUserId),
        context?.previousIsFollowing,
      )
      showError('Erro ao seguir. Tente novamente.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.isFollowing(user!.id, targetUserId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.followers(targetUserId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.following(user!.id),
      })
    },
  })
}
