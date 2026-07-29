"use client"

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { BrandIcon, PasswordIcon } from '@/lib/icons'

export default function SetPasswordPage() {
  const { setPassword, user, loading } = useAuth()
  const router = useRouter()
  const [password, setPasswordValue] = useState('')
  const [confirm, setConfirm] = useState('')
  const [setupToken, setSetupToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem('setup_token')
    const storedEmail = sessionStorage.getItem('setup_email')
    if (!token) {
      router.push('/login')
      return
    }
    setSetupToken(token)
    setEmail(storedEmail)
  }, [router])

  useEffect(() => {
    if (user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!setupToken) return
    if (password !== confirm) {
      setError('As senhas não coincidem')
      return
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await setPassword(setupToken, password)
      sessionStorage.removeItem('setup_token')
      sessionStorage.removeItem('setup_email')
      router.push('/')
    } catch {
      setError('Não foi possível definir a senha. Solicite um novo magic link.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel animate-slide-up">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            <PasswordIcon className="w-8 h-8" strokeWidth={2.25} />
          </div>
          <h1 className="auth-brand-title">Criar senha</h1>
          <p className="auth-brand-subtitle">
            Email confirmado{email ? ` · ${email}` : ''}. Defina a senha para os próximos acessos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPasswordValue(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
              className="field-input"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="confirm">Confirmar senha</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repita a senha"
              required
              minLength={8}
              className="field-input"
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Salvando...' : 'Salvar senha e entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
