import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCellar } from '@/hooks/useCellar'
import { useAuth } from '@/hooks/useAuth'
import { WineGlassRating } from '@/components/ui/WineGlassRating'
import { WineTypeBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ROUTES, routeTo } from '@/constants/routes'
import { getCellarWineName, getCellarWineCountry, getCellarWineVintage } from '@/types'
import type { CellarWine, WineType } from '@/types'
import { WINE_TYPE_LABELS } from '@/types'

type FilterType = 'todos' | WineType

function WineCard({ wine }: { wine: CellarWine }) {
  const name = getCellarWineName(wine)
  const country = getCellarWineCountry(wine)
  const vintage = getCellarWineVintage(wine)
  const wineType = wine.wine?.wine_type ?? wine.custom_wine_type

  return (
    <Link to={routeTo(ROUTES.CELLAR_WINE, { id: wine.id })}>
      <Card hover className="h-full">
        {wine.photo_url ? (
          <img
            src={wine.photo_url}
            alt={name}
            className="w-full h-36 object-cover rounded-t-2xl"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-36 bg-gradient-wine rounded-t-2xl flex items-center justify-center">
            <svg viewBox="0 0 24 32" fill="none" className="w-10 h-14 text-white/20" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" d="M4 2 H20 L16 16 Q12 22 12 24 M12 24 L12 30 M8 30 H16" />
            </svg>
          </div>
        )}
        <CardBody className="flex flex-col gap-2">
          <p className="font-display font-semibold text-white text-sm leading-tight line-clamp-2">
            {name}
          </p>
          <p className="text-xs text-white/40">
            {country}{vintage ? ` · ${vintage}` : ''}
          </p>
          <div className="flex items-center justify-between mt-auto">
            {wineType && <WineTypeBadge type={wineType} />}
            {wine.rating && (
              <WineGlassRating value={wine.rating} readonly size="sm" showLabel={false} />
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}

export default function CellarPage() {
  const { profile } = useAuth()
  const { data: wines = [], isLoading } = useCellar()
  const [filter, setFilter] = useState<FilterType>('todos')

  const filtered = filter === 'todos'
    ? wines
    : wines.filter((w) => (w.wine?.wine_type ?? w.custom_wine_type) === filter)

  const filterOptions: FilterType[] = ['todos', 'tinto', 'branco', 'rose', 'espumante']

  return (
    <div className="flex flex-col">
      {/* Header da adega */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white">
              Minha Adega
            </h1>
            <p className="text-sm text-white/40">
              {profile?.wines_count ?? 0} {profile?.wines_count === 1 ? 'vinho' : 'vinhos'}
            </p>
          </div>
          <Link to={ROUTES.CELLAR_ADD}>
            <Button variant="gold" size="sm">
              + Adicionar
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                filter === opt
                  ? 'bg-wine-800 text-white shadow-glow-wine'
                  : 'bg-surface text-white/50 hover:text-white/80'
              }`}
            >
              {opt === 'todos' ? 'Todos' : WINE_TYPE_LABELS[opt as WineType]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de vinhos */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <p className="text-white/50 text-sm mb-4">
            {filter === 'todos'
              ? 'Sua adega está vazia. Adicione seu primeiro vinho!'
              : `Nenhum ${WINE_TYPE_LABELS[filter as WineType].toLowerCase()} na adega.`}
          </p>
          {filter === 'todos' && (
            <Link to={ROUTES.CELLAR_ADD}>
              <Button variant="gold">Adicionar primeiro vinho</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
          {filtered.map((wine) => (
            <WineCard key={wine.id} wine={wine} />
          ))}
        </div>
      )}
    </div>
  )
}
