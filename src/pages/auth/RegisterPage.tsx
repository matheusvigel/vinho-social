import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { authActions } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/uiStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'

const schema = z.object({
  displayName: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Apenas letras minúsculas, números e _'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { showSuccess, showError } = useUIStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await authActions.signUp(data.email, data.password, data.username, data.displayName)
      showSuccess('Conta criada! Verifique seu email para confirmar.')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao criar conta')
    }
  }

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-premium border border-white/10 animate-slide-up">
      <h2 className="font-display text-2xl font-semibold text-white mb-6 text-center">
        Criar conta
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nome de exibição"
          placeholder="João Sommelier"
          error={errors.displayName?.message}
          {...register('displayName')}
        />

        <Input
          label="Username"
          placeholder="joao_sommelier"
          hint="Apenas letras minúsculas, números e _"
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          hint="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirmar senha"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="gold"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          Criar conta
        </Button>
      </form>

      <p className="text-center text-sm text-white/40 mt-6">
        Já tem conta?{' '}
        <Link to={ROUTES.LOGIN} className="text-gold-500 hover:text-gold-400 transition-colors">
          Entrar
        </Link>
      </p>
    </div>
  )
}
