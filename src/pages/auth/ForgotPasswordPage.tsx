import { useState } from 'react'
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
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { showError } = useUIStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await authActions.resetPassword(data.email)
      setSent(true)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao enviar email')
    }
  }

  if (sent) {
    return (
      <div className="bg-surface rounded-2xl p-6 shadow-premium border border-white/10 text-center animate-slide-up">
        <div className="w-16 h-16 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-gold-500" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-semibold text-white mb-2">Email enviado!</h2>
        <p className="text-white/50 text-sm mb-6">
          Verifique sua caixa de entrada e clique no link para redefinir sua senha.
        </p>
        <Link to={ROUTES.LOGIN} className="text-gold-500 hover:text-gold-400 text-sm transition-colors">
          Voltar para o login
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-premium border border-white/10 animate-slide-up">
      <h2 className="font-display text-2xl font-semibold text-white mb-2 text-center">
        Esqueceu a senha?
      </h2>
      <p className="text-white/50 text-sm text-center mb-6">
        Informe seu email e enviaremos um link para redefinir sua senha.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          variant="gold"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Enviar link
        </Button>
      </form>

      <p className="text-center text-sm text-white/40 mt-4">
        <Link to={ROUTES.LOGIN} className="text-gold-500 hover:text-gold-400 transition-colors">
          Voltar para o login
        </Link>
      </p>
    </div>
  )
}
