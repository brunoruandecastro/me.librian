"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { BrandIcon, MagicLinkIcon, LoginIcon } from '@/lib/icons'
import Link from 'next/link'

type Mode = 'magic' | 'password'

export default function LoginPage() {
  const { user, loading, loginWithPassword, requestMagicLink } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('magic')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPasswordValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [devLink, setDevLink] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setDevLink(null)
    setSubmitting(true)
    try {
      const result = await requestMagicLink(email, name || undefined)
      setInfo(result.message)
      if (result.magicLinkUrl) {
        setDevLink(result.magicLinkUrl)
      }
    } catch {
      setError('Não foi possível enviar o magic link. Verifique se a API está rodando.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await loginWithPassword(email, password)
      router.push('/')
    } catch {
      setError('Login inválido. Confirme o email pelo magic link e use a senha cadastrada.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="auth-shell">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
      </div>
    )
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel animate-slide-up">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            <BrandIcon className="w-8 h-8" strokeWidth={2.25} />
          </div>
          <h1 className="auth-brand-title">Librian</h1>
          <p className="auth-brand-subtitle">Sua biblioteca pessoal, com curadoria</p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            data-active={mode === 'magic'}
            className="auth-tab"
            onClick={() => setMode('magic')}
          >
            Magic link
          </button>
          <button
            type="button"
            role="tab"
            data-active={mode === 'password'}
            className="auth-tab"
            onClick={() => setMode('password')}
          >
            Email e senha
          </button>
        </div>

        {mode === 'magic' ? (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <p className="auth-hint">
              Enviamos um link para confirmar seu email. Depois você define a senha e pode entrar normalmente.
            </p>
            <div>
              <label className="field-label" htmlFor="name">Nome (opcional)</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como quer ser chamado"
                className="field-input"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
                className="field-input"
                autoComplete="email"
              />
            </div>
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            {info && <p className="text-sm text-[var(--success)]">{info}</p>}
            {devLink && (
              <p className="text-xs text-text-muted break-all">
                Dev:{' '}
                <Link href={devLink} className="text-accent underline underline-offset-2">
                  abrir magic link
                </Link>
              </p>
            )}
            <button type="submit" disabled={submitting} className="btn-primary">
              <MagicLinkIcon className="w-4 h-4" />
              {submitting ? 'Enviando...' : 'Enviar magic link'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <p className="auth-hint">
              Disponível depois de confirmar o email pelo magic link e cadastrar uma senha.
            </p>
            <div>
              <label className="field-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
                className="field-input"
                autoComplete="email"
              />
            </div>
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
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <button type="submit" disabled={submitting} className="btn-primary">
              <LoginIcon className="w-4 h-4" />
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
