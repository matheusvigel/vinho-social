import { useState } from 'react'
import { cn } from '@/lib/utils'
import { WINE_GLASS_LABELS } from '@/types'

interface WineGlassRatingProps {
  value?: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const SIZE_MAP = {
  sm: 'w-5 h-7',
  md: 'w-7 h-9',
  lg: 'w-10 h-14',
}

function WineGlassSVG({
  filled,
  isHovered,
  size,
}: {
  filled: boolean
  isHovered: boolean
  size: 'sm' | 'md' | 'lg'
}) {


  return (
    <svg
      viewBox="0 0 28 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        SIZE_MAP[size],
        'transition-all duration-200',
        isHovered && 'drop-shadow-[0_0_8px_rgba(212,175,55,0.8)] scale-110',
      )}
      aria-hidden="true"
    >
      {/* Copa */}
      <path
        d="M5 3 H23 Q23 3 21 18 Q19 25 14 27 Q9 25 7 18 Q5 3 5 3 Z"
        fill={filled ? '#d4af37' : 'transparent'}
        stroke={filled ? '#d4af37' : '#3a3a3c'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="transition-all duration-200"
        opacity={filled ? 0.9 : 1}
      />
      {/* Haste */}
      <line
        x1="14" y1="27"
        x2="14" y2="36"
        stroke={filled ? '#d4af37' : '#3a3a3c'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Base */}
      <line
        x1="8" y1="36"
        x2="20" y2="36"
        stroke={filled ? '#d4af37' : '#3a3a3c'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Brilho interno (quando preenchida) */}
      {filled && (
        <path
          d="M9 8 Q10 6 12 7"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

export function WineGlassRating({
  value = 0,
  onChange,
  readonly = false,
  size = 'md',
  showLabel = true,
  className,
}: WineGlassRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  const displayValue = hovered ?? value
  const roundedDisplay = Math.round(displayValue) as 1 | 2 | 3 | 4 | 5

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div
        className="flex items-center gap-1"
        role={readonly ? undefined : 'radiogroup'}
        aria-label="Avaliação em taças"
      >
        {([1, 2, 3, 4, 5] as const).map((glass) => (
          <button
            key={glass}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(glass)}
            onMouseEnter={() => !readonly && setHovered(glass)}
            onMouseLeave={() => !readonly && setHovered(null)}
            className={cn(
              'flex items-center justify-center transition-transform duration-150',
              readonly ? 'cursor-default' : 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded',
            )}
            aria-label={`${glass} taça${glass > 1 ? 's' : ''} — ${WINE_GLASS_LABELS[glass]}`}
            aria-pressed={!readonly ? glass === value : undefined}
          >
            <WineGlassSVG
              filled={glass <= displayValue}
              isHovered={glass === hovered}
              size={size}
            />
          </button>
        ))}
      </div>

      {showLabel && displayValue > 0 && (
        <p className="text-xs text-gold-500 font-medium animate-fade-in">
          {WINE_GLASS_LABELS[roundedDisplay]}
        </p>
      )}
    </div>
  )
}
