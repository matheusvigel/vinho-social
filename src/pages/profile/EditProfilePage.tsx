import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth, authActions } from '@/hooks/useAuth'
import { StorageService } from '@/services/storage.service'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useUIStore } from '@/stores/uiStore'
import { ROUTES, routeTo } from '@/constants/routes'
import { compressImage } from '@/lib/utils'
import { useState } from 'react'

const schema = z.object({
  display_name: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  bio: z.string().max(300).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url('URL inválida').or(z.literal('')).optional(),
})

type FormData = z.infer<typeof schema>

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { showSuccess, showError } = useUIStore()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: profile?.display_name ?? '',
      bio: profile?.bio ?? '',
      location: profile?.location ?? '',
      website: profile?.website ?? '',
    },
  })

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file, 400, 0.9)
    setAvatarFile(compressed)
    setAvatarPreview(URL.createObjectURL(compressed))
  }

  const onSubmit = async (data: FormData) => {
    try {
      let avatar_url = profile?.avatar_url

      if (avatarFile && profile?.id) {
        avatar_url = await StorageService.uploadAvatar(avatarFile, profile.id)
      }

      await authActions.updateProfile({
        ...data,
        avatar_url,
        bio: data.bio || null,
        location: data.location || null,
        website: data.website || null,
      })

      showSuccess('Perfil atualizado!')
      navigate(routeTo(ROUTES.PROFILE, { username: profile?.username ?? '' }))
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao atualizar perfil')
    }
  }

  if (!profile) return null

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-display text-2xl font-semibold text-white">Editar perfil</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-4 pb-8">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
            <div className="relative">
              <Avatar
                src={avatarPreview ?? profile.avatar_url}
                name={profile.display_name}
                size="xl"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
                </svg>
              </div>
            </div>
          </label>
          <p className="text-xs text-white/40">Toque para alterar</p>
        </div>

        <Input
          label="Nome de exibição *"
          error={errors.display_name?.message}
          {...register('display_name')}
        />

        <Textarea
          label="Bio"
          placeholder="Fale um pouco sobre você e seus vinhos favoritos..."
          rows={3}
          error={errors.bio?.message}
          {...register('bio')}
        />

        <Input
          label="Localização"
          placeholder="São Paulo, SP"
          {...register('location')}
        />

        <Input
          label="Website"
          type="url"
          placeholder="https://seusite.com"
          error={errors.website?.message}
          {...register('website')}
        />

        <Button
          type="submit"
          variant="gold"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Salvar alterações
        </Button>
      </form>
    </div>
  )
}
