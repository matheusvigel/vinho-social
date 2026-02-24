import { useParams, useNavigate } from 'react-router-dom'
import { useCellarWine, useDeleteWine } from '@/hooks/useCellar'
import { WineGlassRating } from '@/components/ui/WineGlassRating'
import { WineTypeBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { ROUTES } from '@/constants/routes'
import { getCellarWineName, getCellarWineCountry, getCellarWineVintage } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function WineDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: wine, isLoading } = useCellarWine(id ?? '')
  const { mutate: deleteWine, isPending: isDeleting } = useDeleteWine()

  if (isLoading) return <PageSpinner />
  if (!wine) return <div className="p-4 text-white/50">Vinho não encontrado</div>

  const name = getCellarWineName(wine)
  const country = getCellarWineCountry(wine)
  const vintage = getCellarWineVintage(wine)
  const wineType = wine.wine?.wine_type ?? wine.custom_wine_type

  const handleDelete = () => {
    if (!confirm('Remover este vinho da adega?')) return
    deleteWine(wine.id, {
      onSuccess: () => navigate(ROUTES.CELLAR),
    })
  }

  return (
    <div className="flex flex-col">
      {/* Imagem */}
      {wine.photo_url ? (
        <img
          src={wine.photo_url}
          alt={name}
          className="w-full h-72 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-wine flex items-center justify-center">
          <svg viewBox="0 0 24 32" fill="none" className="w-16 h-24 text-white/20" stroke="currentColor" strokeWidth={0.8}>
            <path strokeLinecap="round" d="M4 2 H20 L16 16 Q12 22 12 24 M12 24 L12 30 M8 30 H16" />
          </svg>
        </div>
      )}

      <div className="px-4 py-4 flex flex-col gap-5">
        {/* Cabeçalho */}
        <div className="flex items-start gap-3 justify-between">
          <div className="flex-1">
            <h1 className="font-display text-2xl font-semibold text-white leading-tight">{name}</h1>
            {wine.wine?.producer ?? wine.custom_producer ? (
              <p className="text-white/50 text-sm mt-0.5">
                {wine.wine?.producer ?? wine.custom_producer}
              </p>
            ) : null}
          </div>
          {wine.is_favorite && (
            <span className="text-gold-500 text-xl" title="Favorito">★</span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {wineType && <WineTypeBadge type={wineType} />}
          {country && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-surface-elevated text-white/60 border border-white/10">
              {country}{vintage ? ` · ${vintage}` : ''}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-surface-elevated text-white/60 border border-white/10">
            {wine.quantity} {wine.quantity === 1 ? 'garrafa' : 'garrafas'}
          </span>
        </div>

        {/* Avaliação */}
        {wine.rating && (
          <div className="bg-surface rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-white/40 mb-2 uppercase tracking-wide">Avaliação</p>
            <WineGlassRating value={wine.rating} readonly size="md" showLabel />
          </div>
        )}

        {/* Notas de degustação */}
        {wine.tasting_notes && (
          <div className="bg-surface rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-white/40 mb-2 uppercase tracking-wide">Notas de degustação</p>
            <p className="text-white/80 text-sm leading-relaxed italic">"{wine.tasting_notes}"</p>
          </div>
        )}

        {/* Harmonização */}
        {wine.pairing_notes && (
          <div className="bg-surface rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-white/40 mb-2 uppercase tracking-wide">Harmonização</p>
            <p className="text-white/80 text-sm">{wine.pairing_notes}</p>
          </div>
        )}

        {/* Detalhes da adega */}
        <div className="bg-surface rounded-2xl p-4 border border-white/5">
          <p className="text-xs text-white/40 mb-3 uppercase tracking-wide">Detalhes</p>
          <div className="grid grid-cols-2 gap-3">
            {wine.purchase_price && (
              <div>
                <p className="text-xs text-white/30">Preço pago</p>
                <p className="text-sm text-white">{formatCurrency(wine.purchase_price)}</p>
              </div>
            )}
            {wine.purchase_date && (
              <div>
                <p className="text-xs text-white/30">Data de compra</p>
                <p className="text-sm text-white">{formatDate(wine.purchase_date, 'MM/yyyy')}</p>
              </div>
            )}
            {wine.storage_location && (
              <div>
                <p className="text-xs text-white/30">Localização</p>
                <p className="text-sm text-white">{wine.storage_location}</p>
              </div>
            )}
            {(wine.drink_from || wine.drink_until) && (
              <div>
                <p className="text-xs text-white/30">Janela de consumo</p>
                <p className="text-sm text-white">
                  {wine.drink_from ?? '—'} – {wine.drink_until ?? '—'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Uvas */}
        {(wine.wine?.grape_varieties ?? wine.custom_grape_varieties) && (
          <div>
            <p className="text-xs text-white/40 mb-2 uppercase tracking-wide">Uvas</p>
            <div className="flex flex-wrap gap-2">
              {(wine.wine?.grape_varieties ?? wine.custom_grape_varieties ?? []).map((grape) => (
                <span
                  key={grape}
                  className="px-2 py-0.5 rounded-full text-xs bg-wine-900/50 text-wine-300 border border-wine-800/50"
                >
                  {grape}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Remover
          </Button>
        </div>
      </div>
    </div>
  )
}
