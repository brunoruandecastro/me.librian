"use client"

import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BrandIcon } from '@/lib/icons'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-accent via-accent-dark to-accent rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
            <BrandIcon className="w-10 h-10 text-[#1a1208]" strokeWidth={2.25} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-text-primary">Carregando...</h2>
            <p className="text-text-secondary">Verificando autenticação</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}