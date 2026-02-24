import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { queryKeys } from '@/lib/queryKeys'
import type { Wine, WineType } from '@/types'

interface CatalogFilters {
  query?: string
  type?: WineType
  country?: string
}

const PAGE_SIZE = 24

async function searchWines(
  filters: CatalogFilters,
  page: number,
): Promise<Wine[]> {
  const { data, error } = await supabase.rpc('search_wines', {
    p_query: filters.query ?? '',
    p_type: filters.type ?? null,
    p_country: filters.country ?? null,
    p_limit: PAGE_SIZE,
    p_offset: page * PAGE_SIZE,
  })

  if (error) throw error
  return (data ?? []) as unknown as Wine[]
}

async function fetchWine(id: string): Promise<Wine> {
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Wine
}

export function useCatalog(filters: CatalogFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.catalog(filters),
    queryFn: ({ pageParam }) => searchWines(filters, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return (lastPageParam as number) + 1
    },
  })
}

export function useCatalogWine(id: string) {
  return useQuery({
    queryKey: queryKeys.catalogWine(id),
    queryFn: () => fetchWine(id),
    enabled: !!id,
  })
}
