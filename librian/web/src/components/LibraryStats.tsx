"use client"

import {
  BrandIcon,
  ReadIcon,
  ReadingIcon,
  UnreadIcon,
  WishlistIcon,
  RatingIcon,
  ProgressIcon,
} from "@/lib/icons"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { API_URLS } from "@/config/apis"

interface UserStats {
  totalBooks: number
  readBooks: number
  readingBooks: number
  ownedBooks: number
  wishlistBooks: number
  averageRating: number | null
  pagesRead: number
}

export default function LibraryStats() {
  const { token } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const load = async () => {
      try {
        const response = await fetch(`${API_URLS.INTERNAL}/users/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          setStats(await response.json())
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (loading || !stats) {
    return (
      <section className="mb-12">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </section>
    )
  }

  const completion = stats.totalBooks > 0
    ? Math.round((stats.readBooks / stats.totalBooks) * 100)
    : 0

  const statCards = [
    { label: "Total de Livros", value: stats.totalBooks, icon: BrandIcon },
    { label: "Livros Lidos", value: stats.readBooks, icon: ReadIcon },
    { label: "Lendo Agora", value: stats.readingBooks, icon: ReadingIcon },
    { label: "Para Ler", value: stats.ownedBooks, icon: UnreadIcon },
    { label: "Lista de Desejos", value: stats.wishlistBooks, icon: WishlistIcon },
    {
      label: "Avaliação Média",
      value: stats.averageRating != null ? `${stats.averageRating}/5` : "—",
      icon: RatingIcon,
    },
  ]

  return (
    <section className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-text-primary mb-2">Estatísticas da Biblioteca</h2>
        <p className="text-text-secondary">Visão geral do seu progresso de leitura</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="group bg-card border border-[var(--border-subtle)] rounded-2xl p-5 hover:border-accent/30 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] text-accent">
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-secondary font-medium truncate">{stat.label}</p>
                  <p className="text-2xl font-serif font-bold text-text-primary">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-card border border-[var(--border-subtle)] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] text-accent">
            <ProgressIcon className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-text-primary">Progresso de Leitura</h3>
            <p className="text-sm text-text-secondary">Dados reais da sua estante</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex justify-between items-center md:block">
            <span className="text-sm text-text-secondary font-medium">Páginas lidas</span>
            <span className="font-bold text-text-primary block md:mt-1">{stats.pagesRead.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center md:block">
            <span className="text-sm text-text-secondary font-medium">Taxa de conclusão</span>
            <span className="font-bold text-accent block md:mt-1">{completion}%</span>
          </div>
          <div className="flex justify-between items-center md:block">
            <span className="text-sm text-text-secondary font-medium">Avaliação média</span>
            <span className="font-bold text-text-primary block md:mt-1">
              {stats.averageRating != null ? `${stats.averageRating}/5` : "—"}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
