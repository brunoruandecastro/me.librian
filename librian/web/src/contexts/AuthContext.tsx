"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { API_URLS } from '@/config/apis'

export interface User {
  id: string
  email: string
  name: string
  picture?: string
  emailVerified: boolean
  hasPassword: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string) => Promise<void>
  loginWithPassword: (email: string, password: string) => Promise<void>
  requestMagicLink: (email: string, name?: string) => Promise<{ message: string; magicLinkUrl?: string }>
  setPassword: (setupToken: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE = API_URLS.INTERNAL

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((response) => {
          if (response.ok) return response.json()
          localStorage.removeItem('auth_token')
          throw new Error('Token inválido')
        })
        .then((userData) => {
          setToken(savedToken)
          setUser(userData)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [mounted])

  const persistSession = (authToken: string, userData: User) => {
    if (mounted) {
      localStorage.setItem('auth_token', authToken)
    }
    setToken(authToken)
    setUser(userData)
  }

  const login = async (authToken: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (!response.ok) {
        throw new Error(`Falha ao buscar perfil: ${response.status}`)
      }
      const userData = await response.json()
      persistSession(authToken, userData)
    } catch (error) {
      console.error('Erro no login:', error)
      logout()
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithPassword = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Falha no login')
      }
      const data = await response.json()
      persistSession(data.token, data.user)
    } finally {
      setLoading(false)
    }
  }

  const requestMagicLink = async (email: string, name?: string) => {
    const response = await fetch(`${API_BASE}/auth/magic-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    })
    if (!response.ok) {
      throw new Error('Não foi possível enviar o magic link')
    }
    return response.json()
  }

  const setPassword = async (setupToken: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupToken, password }),
      })
      if (!response.ok) {
        throw new Error('Não foi possível definir a senha')
      }
      const data = await response.json()
      persistSession(data.token, data.user)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    if (mounted) {
      localStorage.removeItem('auth_token')
    }
    setToken(null)
    setUser(null)
    setLoading(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        loginWithPassword,
        requestMagicLink,
        setPassword,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
