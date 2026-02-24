import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateConfraria } from '@/hooks/useConfraria'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ROUTES, routeTo } from '@/constants/routes'
import type { ConfriariaPrivacy } from '@/types'
// import { CONFRARIA_PRIVACY_LABELS } from '@/types'

const schema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(100),
  description: z.string().max(500).optional(),
  privacy: z.enum(['publica', 'privada', 'oculta'] as const),
  tags: z.string().optional(),
  location: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const privacyOptions: { value: ConfriariaPrivacy; label: string; desc: string }[] = [
  { value: 'publica', label: 'Pública', desc: 'Qualquer pessoa pode entrar' },
  { value: 'privada', label: 'Privada', desc: 'Apenas por convite' },
  { value: 'oculta', label: 'Oculta', desc: 'Não aparece nas buscas' },
]

export default function CreateConfrariaPage() {
  const navigate = useNavigate()
  const { mutateAsync: create, isPending } = useCreateConfraria()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { privacy: 'publica' },
  })

  const selectedPrivacy = watch('privacy')

  const onSubmit = async (data: FormData) => {
    const confraria = await create(data)
    navigate(routeTo(ROUTES.CONFRARIA, { slug: confraria.slug }))
  }

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-display text-2xl font-semibold text-white">Nova confraria</h1>
        <p className="text-white/40 text-sm mt-1">Crie um grupo para reunir amantes de vinho</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-4 pb-8">
        <Input
          label="Nome da confraria *"
          placeholder="Ex: Amantes de Bordeaux"
          error={errors.name?.message}
          {...register('name')}
        />

        <Textarea
          label="Descrição"
          placeholder="Fale sobre o tema, objetivos e cultura da confraria..."
          rows={4}
          {...register('description')}
        />

        {/* Privacidade */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-white/70">Privacidade</p>
          {privacyOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-white/5 cursor-pointer hover:border-gold-500/30 transition-colors">
              <input
                type="radio"
                value={opt.value}
                className="accent-gold-500"
                {...register('privacy')}
              />
              <div>
                <p className={`text-sm font-medium ${selectedPrivacy === opt.value ? 'text-gold-400' : 'text-white'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-white/40">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <Input
          label="Tags"
          placeholder="bordeaux, natural, orgânico"
          hint="Separe por vírgula"
          {...register('tags')}
        />

        <Input
          label="Localização"
          placeholder="São Paulo, SP"
          {...register('location')}
        />

        <Button
          type="submit"
          variant="gold"
          size="lg"
          isLoading={isPending}
          className="w-full"
        >
          Criar confraria
        </Button>
      </form>
    </div>
  )
}
