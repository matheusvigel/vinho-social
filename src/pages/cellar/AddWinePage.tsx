import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAddWine } from '@/hooks/useCellar'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { WineGlassRating } from '@/components/ui/WineGlassRating'
import { LabelScanner } from '@/components/ui/LabelScanner'
import { ROUTES } from '@/constants/routes'
import { COUNTRIES } from '@/constants/wines'
import type { WineType } from '@/types'
import { WINE_TYPE_LABELS } from '@/types'
import { compressImage } from '@/lib/utils'
import type { WineLabelData } from '@/services/gemini.service'

const schema = z.object({
  custom_name: z.string().min(1, 'Nome obrigatório').max(200),
  custom_producer: z.string().optional(),
  custom_country: z.string().optional(),
  custom_region: z.string().optional(),
  custom_vintage: z.coerce.number().int().min(1900).max(new Date().getFullYear()).optional().or(z.literal('')),
  custom_wine_type: z.enum(['tinto', 'branco', 'rose', 'espumante', 'sobremesa', 'fortificado'] as const).optional(),
  custom_grape_varieties: z.string().optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  purchase_price: z.coerce.number().min(0).optional().or(z.literal('')),
  storage_location: z.string().optional(),
  tasting_notes: z.string().max(1000).optional(),
  pairing_notes: z.string().max(500).optional(),
  is_public: z.boolean().default(true),
  is_favorite: z.boolean().default(false),
})

type FormData = z.infer<typeof schema>

export default function AddWinePage() {
  const navigate = useNavigate()
  const { mutateAsync: addWine, isPending } = useAddWine()
  const [rating, setRating] = useState<number>(0)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setPhotoFile(compressed)
    setPhotoPreview(URL.createObjectURL(compressed))
  }

  const handleScanComplete = (data: WineLabelData) => {
    if (data.name) setValue('custom_name', data.name)
    if (data.producer) setValue('custom_producer', data.producer)
    if (data.country) setValue('custom_country', data.country)
    if (data.region) setValue('custom_region', data.region)
    if (data.vintage) setValue('custom_vintage', data.vintage)
    if (data.wine_type) setValue('custom_wine_type', data.wine_type)
    if (data.grape_varieties?.length) setValue('custom_grape_varieties', data.grape_varieties.join(', '))
    if (data.description) setValue('tasting_notes', data.description)
    setScanSuccess(true)
    setShowScanner(false)
  }

  const onSubmit = async (data: FormData) => {
    await addWine({
      formData: {
        ...data,
        custom_vintage: data.custom_vintage ? Number(data.custom_vintage) : undefined,
        purchase_price: data.purchase_price ? Number(data.purchase_price) : undefined,
        rating: rating > 0 ? rating : undefined,
        quantity: data.quantity,
        is_public: data.is_public,
        is_favorite: data.is_favorite,
      },
      photoFile: photoFile ?? undefined,
    })
    navigate(ROUTES.CELLAR)
  }

  const wineTypes: WineType[] = ['tinto', 'branco', 'rose', 'espumante', 'sobremesa', 'fortificado']

  return (
    <div className="flex flex-col">
      {showScanner && (
        <LabelScanner
          onScanComplete={handleScanComplete}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div className="px-4 pt-4 pb-2">
        <h1 className="font-display text-2xl font-semibold text-white">Adicionar vinho</h1>
        <p className="text-white/40 text-sm mt-1">Registre um vinho na sua adega</p>
      </div>

      {/* Botão de scanner */}
      <div className="px-4 mb-4">
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="w-full py-3 rounded-xl border border-gold-500/40 bg-gold-500/5 text-gold-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-gold-500/10 transition-colors"
        >
          <span className="text-lg">✨</span>
          {scanSuccess ? 'Escanear outro rótulo' : 'Escanear rótulo com IA'}
        </button>
        {scanSuccess && (
          <p className="text-center text-xs text-green-400 mt-2">
            ✓ Rótulo lido com sucesso! Confira os dados abaixo.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-4 pb-8">
        {/* Foto */}
        <div>
          <p className="text-sm font-medium text-white/70 mb-2">Foto do vinho</p>
          <label className="relative block">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="sr-only"
            />
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-2xl border border-white/10 cursor-pointer"
              />
            ) : (
              <div className="w-full h-48 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gold-500/50 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white/20" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <p className="text-xs text-white/30">Toque para adicionar foto</p>
              </div>
            )}
          </label>
        </div>

        <Input
          label="Nome do vinho *"
          placeholder="Ex: Château Margaux"
          error={errors.custom_name?.message}
          {...register('custom_name')}
        />

        <Input
          label="Produtor / Vinícola"
          placeholder="Ex: Château Margaux"
          {...register('custom_producer')}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">País</label>
            <select
              className="h-10 bg-surface border border-white/10 rounded-xl px-3 text-sm text-white outline-none focus:border-gold-500/50"
              {...register('custom_country')}
            >
              <option value="">Selecione</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <Input
            label="Safra"
            type="number"
            placeholder="2020"
            {...register('custom_vintage')}
          />
        </div>

        <Input
          label="Região"
          placeholder="Ex: Serra Gaúcha, Mendoza"
          {...register('custom_region')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white/70">Tipo</label>
          <div className="flex flex-wrap gap-2">
            {wineTypes.map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  value={type}
                  className="sr-only"
                  {...register('custom_wine_type')}
                />
                <span className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border border-white/10 text-white/50 hover:text-white/80">
                  {WINE_TYPE_LABELS[type]}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Input
          label="Uvas"
          placeholder="Cabernet Sauvignon, Merlot"
          hint="Separe por vírgula"
          {...register('custom_grape_varieties')}
        />

        {/* Avaliação */}
        <div className="bg-surface rounded-2xl p-4 border border-white/5">
          <p className="text-sm font-medium text-white/70 mb-3">Como foi esse vinho?</p>
          <WineGlassRating value={rating} onChange={setRating} size="lg" showLabel />
        </div>

        <Textarea
          label="Notas de degustação"
          placeholder="Aromas de frutas vermelhas maduras, tânicas presentes mas sedosas..."
          rows={4}
          {...register('tasting_notes')}
        />

        <Textarea
          label="Harmonização"
          placeholder="Ótimo com carnes vermelhas, queijos curados..."
          rows={2}
          {...register('pairing_notes')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Quantidade" type="number" defaultValue={1} {...register('quantity')} />
          <Input label="Preço pago (R$)" type="number" placeholder="0,00" {...register('purchase_price')} />
        </div>

        <Input
          label="Localização na adega"
          placeholder="Ex: Prateleira 2, posição A3"
          {...register('storage_location')}
        />

        <div className="flex items-center justify-between bg-surface rounded-xl p-3 border border-white/5">
          <div>
            <p className="text-sm font-medium text-white">Compartilhar no feed</p>
            <p className="text-xs text-white/40">Outros usuários poderão ver este vinho</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only" defaultChecked {...register('is_public')} />
            <div className="w-10 h-6 bg-surface-elevated rounded-full border border-white/10 relative">
              <div className="absolute top-1 left-1 w-4 h-4 bg-white/30 rounded-full transition-transform peer-checked:translate-x-4" />
            </div>
          </label>
        </div>

        <Button type="submit" variant="gold" size="lg" isLoading={isPending} className="w-full">
          Adicionar à adega
        </Button>
      </form>
    </div>
  )
}
