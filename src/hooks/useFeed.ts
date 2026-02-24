import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useAuth } from './useAuth'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/lib/queryKeys'
import type { Activity, Comment } from '@/types'

const PAGE_SIZE = 20

// ============================================================
// FEED
// ============================================================

async function fetchFeed(userId: string, page: number): Promise<Activity[]> {
  const { data, error } = await supabase.rpc('get_user_feed', {
    p_user_id: userId,
    p_limit: PAGE_SIZE,
    p_offset: page * PAGE_SIZE,
  })

  if (error) throw error
  return (data ?? []) as unknown as Activity[]
}

export function useFeed() {
  const { user } = useAuth()

  return useInfiniteQuery({
    queryKey: queryKeys.feed(user?.id ?? ''),
    queryFn: ({ pageParam }) => fetchFeed(user!.id, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return (lastPageParam as number) + 1
    },
    enabled: !!user?.id,
  })
}

// ============================================================
// LIKES (com optimistic update)
// ============================================================

export function useLike() {
  const { user } = useAuth()
  const { showError } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ activityId, isLiked }: { activityId: string; isLiked: boolean }) => {
      if (!user) throw new Error('Usuário não autenticado')

      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ user_id: user.id, activity_id: activityId })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, activity_id: activityId })
        if (error) throw error
      }
    },
    onMutate: async ({ activityId, isLiked }) => {
      // Optimistic update no feed
      await queryClient.cancelQueries({ queryKey: queryKeys.feed(user!.id) })

      const previous = queryClient.getQueryData(queryKeys.feed(user!.id))

      queryClient.setQueryData(queryKeys.feed(user!.id), (old: { pages: Activity[][] } | undefined) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((activity) => {
              if (activity.id !== activityId) return activity
              return {
                ...activity,
                likes_count: isLiked
                  ? Math.max(0, activity.likes_count - 1)
                  : activity.likes_count + 1,
                user_liked: !isLiked,
              }
            }),
          ),
        }
      })

      return { previous }
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(queryKeys.feed(user!.id), context?.previous)
      showError('Erro ao curtir. Tente novamente.')
    },
  })
}

// ============================================================
// COMMENTS
// ============================================================

async function fetchComments(activityId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!user_id (id, username, display_name, avatar_url)
    `)
    .eq('activity_id', activityId)
    .is('parent_id', null)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as unknown as Comment[]
}

export function useComments(activityId: string) {
  return useQuery({
    queryKey: queryKeys.comments(activityId),
    queryFn: () => fetchComments(activityId),
    enabled: !!activityId,
  })
}

export function useAddComment() {
  const { user } = useAuth()
  const { showError } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      activityId,
      content,
      parentId,
    }: {
      activityId: string
      content: string
      parentId?: string
    }) => {
      if (!user) throw new Error('Usuário não autenticado')

      const { error } = await supabase.from('comments').insert({
        activity_id: activityId,
        user_id: user.id,
        content,
        parent_id: parentId ?? null,
      })

      if (error) throw error
    },
    onSuccess: (_data, { activityId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(activityId) })
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : 'Erro ao comentar')
    },
  })
}
