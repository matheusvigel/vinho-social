import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '@/hooks/useCatalog'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/ui/Input'
import { WineTypeBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ROUTES, routeTo } from '@/constants/routes'
import { COUNTRIES } from '@/constants/wines'
import type { WineType, Wine } from '@/types'
import { WINE_TYPE_LABELS } from '@/types'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

function WineCatalogCard({ wine }: { wine: Wine }) {
  return (
    <Link to={routeTo(ROUTES.CATALOG_WINE, { id: wine.id })}>
      <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden hover:border-wine-800/50 transition-all duration-200">
        {wine.label_url ? (
          <img
            src={wine.label_url}
            alt={wine.name}
            className="w-full h-32 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-wine flex items-center justify-center">
            <span className="text-3xl text-white/20">🍷</span>
          </div>
        )}
        <div className="p-3 flex flex-col gap-1.5">
          <p className="text-white font-medium text-sm leading-tight line-clamp-2">{wine.name}</p>
          {wine.producer && (
            <p className="text-xs text-white/40 truncate">{wine.producer}</p>
          )}
          <div className="flex items-center justify-between">
            <WineTypeBadge type={wine.wine_type} />
            {wine.avg_rating > 0 && (
              <span className="text-xs text-gold-500">★ {wine.avg_rating.toFixed(1)}</span>
            )}
          </div>
          <p className="text-xs text-white/30">
            {wine.country}{wine.vintage ? ` · ${wine.vintage}` : ''}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function CatalogPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<WineType | undefined>()
  const [country, setCountry] = useState<string | undefined>()
  const debouncedQuery = useDebounce(query, 400)

  const { ref, inView } = useInView({ threshold: 0.1 })
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useCatalog({
    query: debouncedQuery,
    type,
    country,
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const wines = data?.pages.flatMap((p) => p) ?? []
  const wineTypes: WineType[] = ['tinto', 'branco', 'rose', 'espumante']

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="font-display text-2xl font-semibold text-white">Catálogo</h1>

      {/* Busca */}
      <Input
        placeholder="Buscar vinhos, produtores..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        leftIcon={
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        }
      />

      {/* Filtros de tipo */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setType(undefined)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            !type ? 'bg-wine-800 text-white' : 'bg-surface text-white/50'
          }`}
        >
          Todos
        </button>
        {wineTypes.map((t) => (
          <button
            key={t}
            onClick={() => setType(t === type ? undefined : t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              type === t ? 'bg-wine-800 text-white' : 'bg-surface text-white/50'
            }`}
          >
            {WINE_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Filtro de país */}
      <select
        value={country ?? ''}
        onChange={(e) => setCountry(e.target.value || undefined)}
        className="h-9 bg-surface border border-white/10 rounded-xl px-3 text-sm text-white/60 outline-none focus:border-gold-500/50"
      >
        <option value="">Todos os países</option>
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : wines.length === 0 ? (
        <p className="text-white/40 text-sm text-center py-16">
          Nenhum vinho encontrado para essa busca.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {wines.map((wine) => (
              <WineCatalogCard key={wine.id} wine={wine} />
            ))}
          </div>
          <div ref={ref} className="flex justify-center py-4">
            {isFetchingNextPage && <Spinner />}
          </div>
        </>
      )}
    </div>
  )
}
