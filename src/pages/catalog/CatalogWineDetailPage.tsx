import { useParams, Link } from 'react-router-dom'
import { useCatalogWine } from '@/hooks/useCatalog'
import { WineTypeBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { ROUTES } from '@/constants/routes'
import { WINE_TYPE_LABELS } from '@/types'

export default function CatalogWineDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: wine, isLoading } = useCatalogWine(id ?? '')

  if (isLoading) return <PageSpinner />
  if (!wine) return <div className="p-4 text-white/50">Vinho não encontrado</div>

  return (
    <div className="flex flex-col">
      {wine.label_url ? (
        <img src={wine.label_url} alt={wine.name} className="w-full h-72 object-cover" />
      ) : (
        <div className="w-full h-48 bg-gradient-wine flex items-center justify-center">
          <span className="text-6xl text-white/10">🍷</span>
        </div>
      )}

      <div className="px-4 py-4 flex flex-col gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white leading-tight">{wine.name}</h1>
          {wine.producer && <p className="text-white/50 mt-0.5">{wine.producer}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          <WineTypeBadge type={wine.wine_type} />
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-surface-elevated text-white/60 border border-white/10">
            {wine.country}
          </span>
          {wine.vintage && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-surface-elevated text-white/60 border border-white/10">
              {wine.vintage}
            </span>
          )}
          {wine.alcohol_pct && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-surface-elevated text-white/60 border border-white/10">
              {wine.alcohol_pct}% alc
            </span>
          )}
        </div>

        {wine.avg_rating > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gold-500 text-lg">★</span>
            <span className="text-white font-semibold">{wine.avg_rating.toFixed(1)}</span>
            <span className="text-white/40 text-sm">({wine.ratings_count} avaliações)</span>
          </div>
        )}

        {wine.region && (
          <div className="bg-surface rounded-xl p-3 border border-white/5">
            <p className="text-xs text-white/40 mb-1">Região</p>
            <p className="text-sm text-white">
              {wine.region}{wine.sub_region ? ` · ${wine.sub_region}` : ''}
            </p>
            {wine.appellation && (
              <p className="text-xs text-white/40 mt-0.5">{wine.appellation}</p>
            )}
          </div>
        )}

        {wine.grape_varieties && wine.grape_varieties.length > 0 && (
          <div>
            <p className="text-xs text-white/40 mb-2 uppercase tracking-wide">Uvas</p>
            <div className="flex flex-wrap gap-2">
              {wine.grape_varieties.map((grape) => (
                <span key={grape} className="px-2 py-0.5 rounded-full text-xs bg-wine-900/50 text-wine-300 border border-wine-800/50">
                  {grape}
                </span>
              ))}
            </div>
          </div>
        )}

        {wine.description && (
          <div className="bg-surface rounded-xl p-3 border border-white/5">
            <p className="text-sm text-white/70 leading-relaxed">{wine.description}</p>
          </div>
        )}

        <Link to={`${ROUTES.CELLAR_ADD}?wine=${wine.id}`}>
          <Button variant="gold" size="lg" className="w-full">
            Adicionar à minha adega
          </Button>
        </Link>
      </div>
    </div>
  )
}
