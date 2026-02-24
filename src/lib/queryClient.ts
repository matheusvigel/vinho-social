import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutos
      gcTime: 1000 * 60 * 30,     // 30 minutos
      retry: (failureCount, error: unknown) => {
        const err = error as { status?: number }
        if (err?.status === 401 || err?.status === 403) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})
