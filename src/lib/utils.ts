import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Merge de classes Tailwind
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Formatar data relativa ("há 2 horas")
export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), {
    addSuffix: true,
    locale: ptBR,
  })
}

// Formatar data completa
export function formatDate(dateStr: string, fmt = "dd 'de' MMMM 'de' yyyy"): string {
  return format(new Date(dateStr), fmt, { locale: ptBR })
}

// Formatar data e hora
export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

// Gerar slug a partir de texto
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Formatar número grande (1200 → "1,2K")
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

// Formatar preço em BRL
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Gerar iniciais do nome
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

// Truncar texto
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length)}...`
}

// Checar se URL é válida
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Comprimir imagem antes do upload
export async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.85,
): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, maxWidth / img.width)
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file)
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          },
          'image/jpeg',
          quality,
        )
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}
