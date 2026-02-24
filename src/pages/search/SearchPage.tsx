import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/services/supabase'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import { ROUTES, routeTo } from '@/constants/routes'
import type { Profile, Wine, Confraria } from '@/types'

interface SearchResults {
  profiles: Profile[]
  wines: Wine[]
  confrarias: Confraria[]
}

async function search(query: string): Promise<SearchResults> {
  if (!query || query.length < 2) {
    return { profiles: [], wines: [], confrarias: [] }
  }

  const [profilesRes, winesRes, confrariasRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, is_verified, followers_count')
      .ilike('username', `%${query}%`)
      .limit(5),
    supabase
      .from('wines')
      .select('id, name, producer, country, wine_type, label_url')
      .ilike('name', `%${query}%`)
      .limit(5),
    supabase
      .from('confrarias')
      .select('id, name, slug, avatar_url, privacy, members_count')
      .eq('privacy', 'publica')
      .ilike('name', `%${query}%`)
      .limit(5),
  ])

  return {
    profiles: (profilesRes.data ?? []) as Profile[],
    wines: (winesRes.data ?? []) as Wine[],
    confrarias: (confrariasRes.data ?? []) as Confraria[],
  }
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 400)

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })

  const hasResults = data && (
    data.profiles.length > 0 || data.wines.length > 0 || data.confrarias.length > 0
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="font-display text-2xl font-semibold text-white">Buscar</h1>

      <Input
        placeholder="Buscar pessoas, vinhos, confrarias..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        leftIcon={
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        }
      />

      {isLoading && debouncedQuery.length >= 2 && (
        <div className="flex justify-center py-8"><Spinner /></div>
      )}

      {!isLoading && debouncedQuery.length >= 2 && !hasResults && (
        <p className="text-white/40 text-sm text-center py-8">
          Nenhum resultado para "{debouncedQuery}"
        </p>
      )}

      {data?.profiles && data.profiles.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">Pessoas</h2>
          <div className="flex flex-col gap-3">
            {data.profiles.map((p) => (
              <Link
                key={p.id}
                to={routeTo(ROUTES.PROFILE, { username: p.username })}
                className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-white/5 hover:border-wine-800/50 transition-colors"
              >
                <Avatar src={p.avatar_url} name={p.display_name} size="md" />
                <div>
                  <p className="text-sm font-medium text-white">{p.display_name}</p>
                  <p className="text-xs text-white/40">@{p.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {data?.wines && data.wines.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">Vinhos</h2>
          <div className="flex flex-col gap-2">
            {data.wines.map((w) => (
              <Link
                key={w.id}
                to={routeTo(ROUTES.CATALOG_WINE, { id: w.id })}
                className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-white/5 hover:border-wine-800/50 transition-colors"
              >
                {w.label_url ? (
                  <img src={w.label_url} alt={w.name} className="w-10 h-10 object-cover rounded-lg" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-wine rounded-lg" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">{w.name}</p>
                  <p className="text-xs text-white/40">{w.country} · {w.wine_type}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {data?.confrarias && data.confrarias.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">Confrarias</h2>
          <div className="flex flex-col gap-2">
            {data.confrarias.map((c) => (
              <Link
                key={c.id}
                to={routeTo(ROUTES.CONFRARIA, { slug: c.slug })}
                className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-white/5 hover:border-wine-800/50 transition-colors"
              >
                <Avatar src={c.avatar_url} name={c.name} size="md" />
                <div>
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-xs text-white/40">{c.members_count} membros</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!query && (
        <div className="text-center py-12 text-white/30">
          <p className="text-sm">Busque por pessoas, vinhos ou confrarias</p>
        </div>
      )}
    </div>
  )
}
