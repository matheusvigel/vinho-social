import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useAuth } from './useAuth'
import { useUIStore } from '@/stores/uiStore'
import { queryKeys } from '@/lib/queryKeys'
import type { Notification } from '@/types'

// Buscar notificações
async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      sender:profiles!sender_id (
        id, username, display_name, avatar_url
      )
    `)
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return (data ?? []) as unknown as Notification[]
}

async function fetchUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('is_read', false)

  if (error) throw error
  return count ?? 0
}

async function markAllRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', userId)
    .eq('is_read', false)

  if (error) throw error
}

export function useNotifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: queryKeys.notifications(user?.id ?? ''),
    queryFn: () => fetchNotifications(user!.id),
    enabled: !!user?.id,
  })

  const { data: unreadCount = 0 } = useQuery({
    queryKey: queryKeys.unreadCount(user?.id ?? ''),
    queryFn: () => fetchUnreadCount(user!.id),
    enabled: !!user?.id,
    refetchInterval: 60_000, // Refetch a cada minuto
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllRead(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user!.id) })
      queryClient.setQueryData(queryKeys.unreadCount(user!.id), 0)
    },
  })

  return {
    notifications,
    unreadCount,
    isLoading,
    markAllRead: markAllReadMutation.mutate,
  }
}

// Realtime: escutar novas notificações
export function useRealtimeNotifications() {
  const { user } = useAuth()
  const { showInfo } = useUIStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.notifications(user.id),
          })
          queryClient.invalidateQueries({
            queryKey: queryKeys.unreadCount(user.id),
          })

          const n = payload.new as { notification_type: string }
          const messages: Record<string, string> = {
            like: 'Alguém curtiu sua atividade',
            comment: 'Alguém comentou na sua atividade',
            follow: 'Você tem um novo seguidor',
            confraria_invite: 'Você foi convidado para uma confraria',
          }
          showInfo(messages[n.notification_type] ?? 'Nova notificação')
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, queryClient, showInfo])
}

// Realtime: escutar novas atividades no feed
export function useRealtimeFeed() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('activities-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
        },
        () => {
          // Invalidar feed para exibir novo conteúdo
          queryClient.invalidateQueries({
            queryKey: queryKeys.feed(user.id),
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, queryClient])
}
