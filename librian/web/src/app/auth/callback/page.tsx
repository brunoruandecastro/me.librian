"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { BrandIcon } from '@/lib/icons'
import { API_URLS } from '@/config/apis'

function AuthCallbackContent() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const token = searchParams.get('token')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      router.push(`/login?error=${errorParam}`)
      return
    }

    if (!token) {
      router.push('/login?error=no_token')
      return
    }

    const verify = async () => {
      try {
        const response = await fetch(`${API_URLS.INTERNAL}/auth/magic-link/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        if (!response.ok) {
          let message = 'Link inválido ou expirado'
          try {
            const body = await response.json()
            message = body.message || message
          } catch {
            // ignore
          }
          throw new Error(message)
        }
        const data = await response.json()

        if (data.needsPassword && data.setupToken) {
          sessionStorage.setItem('setup_token', data.setupToken)
          sessionStorage.setItem('setup_email', data.email)
          router.push('/auth/set-password')
          return
        }

        if (data.token) {
          await login(data.token)
          router.push('/')
          return
        }

        throw new Error('Resposta de verificação incompleta')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha na verificação')
        setTimeout(() => router.push('/login?error=auth_failed'), 2000)
      }
    }

    verify()
  }, [searchParams, login, router])

  return (
    <div className="auth-shell">
      <div className="auth-panel text-center space-y-5">
        <div className="auth-brand-mark mx-auto animate-pulse">
          <BrandIcon className="w-8 h-8" strokeWidth={2.25} />
        </div>
        <div className="space-y-2">
          <h2 className="auth-brand-title text-[1.75rem]">
            {error ? 'Falha na verificação' : 'Confirmando seu email'}
          </h2>
          <p className="auth-brand-subtitle">
            {error || 'Validando o magic link...'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="auth-shell">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
