"use client"

import Layout from "@/components/Layout"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProfileIcon, BrandIcon, ReadIcon, ReadingIcon, RatingIcon, DateIcon, SettingsIcon } from "@/lib/icons"
import { API_URLS, buildApiUrl } from "@/config/apis"

interface UserStats {
  totalBooks: number
  readBooks: number
  readingBooks: number
  ownedBooks: number
  wishlistBooks: number
  donatingBooks: number
  sellingBooks: number
  averageRating: number | null
  pagesRead: number
  joinDate: string
}

const generateAvatarUrl = (name: string, email: string) => {
  const seed = name || email || 'user'
  return buildApiUrl.dicebear.initials(seed)
}

type TabId = 'overview' | 'preferences'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const { user: authUser, loading: authLoading, token } = useAuth()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!authUser || !token) return
      try {
        setStatsLoading(true)
        const response = await fetch(`${API_URLS.INTERNAL}/users/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          setUserStats(await response.json())
        }
      } finally {
        setStatsLoading(false)
      }
    }
    fetchUserStats()
  }, [authUser, token])

  if (authLoading || statsLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!authUser) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-text-secondary">
          Você precisa estar logado para ver seu perfil.
        </div>
      </Layout>
    )
  }

  const stats = userStats || {
    totalBooks: 0,
    readBooks: 0,
    readingBooks: 0,
    ownedBooks: 0,
    wishlistBooks: 0,
    donatingBooks: 0,
    sellingBooks: 0,
    averageRating: null,
    pagesRead: 0,
    joinDate: '',
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative mb-8">
          <div className="h-48 bg-gradient-to-br from-accent via-accent-dark to-accent rounded-3xl" />
          <div className="relative -mt-20 px-8 pb-8">
            <div className="bg-card border-ultra-subtle rounded-3xl p-8 shadow-xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-surface shadow-lg bg-surface-secondary flex items-center justify-center">
                  {!imageError ? (
                    <img
                      src={generateAvatarUrl(authUser.name, authUser.email)}
                      alt={authUser.name || 'Avatar'}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <ProfileIcon className="w-12 h-12 text-accent" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-serif font-bold text-text-primary mb-2">{authUser.name}</h1>
                  <p className="text-text-secondary mb-3">{authUser.email}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                    {stats.joinDate && (
                      <div className="flex items-center gap-2">
                        <DateIcon className="w-4 h-4" />
                        <span>Membro desde {new Date(stats.joinDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                    <span className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                      {authUser.emailVerified ? 'Email confirmado' : 'Email pendente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-border-subtle mb-8">
          {[
            { id: 'overview' as const, label: 'Visão Geral', icon: ProfileIcon },
            { id: 'preferences' as const, label: 'Preferências', icon: SettingsIcon },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 border-b-2 transition-all duration-200 font-semibold ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-secondary hover:text-accent'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total de Livros', value: stats.totalBooks, icon: BrandIcon },
              { label: 'Livros Lidos', value: stats.readBooks, icon: ReadIcon },
              { label: 'Lendo Agora', value: stats.readingBooks, icon: ReadingIcon },
              {
                label: 'Avaliação Média',
                value: stats.averageRating != null ? `${stats.averageRating}/5` : '—',
                icon: RatingIcon,
              },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-card border-ultra-subtle rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary font-medium">{stat.label}</p>
                      <p className="text-2xl font-serif font-bold text-text-primary">{stat.value}</p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div className="bg-card border-ultra-subtle rounded-2xl p-6 col-span-2 lg:col-span-4">
              <p className="text-sm text-text-secondary mb-1">Páginas lidas</p>
              <p className="text-2xl font-serif font-bold text-text-primary">
                {stats.pagesRead.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="bg-card border-ultra-subtle rounded-3xl p-8">
            <h2 className="text-2xl font-serif font-bold text-text-primary mb-2">Preferências</h2>
            <p className="text-text-secondary">
              Configurações avançadas serão adicionadas em breve. Sua conta já usa magic link + senha.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}
