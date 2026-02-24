import { cn } from '@/lib/utils'
import type { WineType } from '@/types'
import { WINE_TYPE_LABELS } from '@/types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'gold' | 'wine' | 'success' | 'danger'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-surface-elevated text-white/70 border border-white/10',
    gold: 'bg-gold-500/20 text-gold-400 border border-gold-500/30',
    wine: 'bg-wine-800/50 text-wine-300 border border-wine-700/50',
    success: 'bg-green-900/50 text-green-400 border border-green-800/50',
    danger: 'bg-red-900/50 text-red-400 border border-red-800/50',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

const WINE_TYPE_VARIANT: Record<WineType, BadgeProps['variant']> = {
  tinto: 'wine',
  branco: 'gold',
  rose: 'default',
  espumante: 'success',
  sobremesa: 'gold',
  fortificado: 'wine',
}

export function WineTypeBadge({ type }: { type: WineType }) {
  return (
    <Badge variant={WINE_TYPE_VARIANT[type]}>
      {WINE_TYPE_LABELS[type]}
    </Badge>
  )
}
