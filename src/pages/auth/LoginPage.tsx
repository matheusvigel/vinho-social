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
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { showError } = useUIStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await authActions.signIn(data.email, data.password)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao entrar')
    }
  }

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-premium border border-white/10 animate-slide-up">
      <h2 className="font-display text-2xl font-semibold text-white mb-6 text-center">
        Entrar
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
          error={errors.password?.message}
          {...register('password')}
        />

        <Link
          to={ROUTES.FORGOT_PASSWORD}
          className="text-xs text-gold-500/70 hover:text-gold-500 transition-colors text-right"
        >
          Esqueceu a senha?
        </Link>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-white/40 mt-6">
        Não tem conta?{' '}
        <Link to={ROUTES.REGISTER} className="text-gold-500 hover:text-gold-400 transition-colors">
          Cadastre-se
        </Link>
      </p>
    </div>
  )
}
