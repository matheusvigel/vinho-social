import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'rounded-full border-gold-500 border-t-transparent animate-spin',
        SIZE_MAP[size],
        className,
      )}
      role="status"
      aria-label="Carregando..."
    />
  )
}

export function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <Spinner size="lg" />
    </div>
  )
}
