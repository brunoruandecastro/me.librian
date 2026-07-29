"use client"

import Link from "next/link"
import {
  BrandIcon,
  ShelfIcon,
  SearchIcon,
  AddBookIcon,
  ProfileIcon,
  LogoutIcon,
  LoginIcon,
  MenuIcon,
  CloseIcon,
} from "@/lib/icons"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useShelf } from "@/contexts/ShelfContext"
import { buildApiUrl } from "@/config/apis"

const generateAvatarUrl = (name: string, email: string) => {
  const seed = name || email || 'user'
  return buildApiUrl.dicebear.initials(seed)
}

export default function AppHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [search, setSearch] = useState('')
  const { user, logout } = useAuth()
  const { open: openShelf, toggle: toggleShelf } = useShelf()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  const openShelfAndCloseMenu = () => {
    openShelf()
    setIsMobileMenuOpen(false)
  }

  const submitSearch = () => {
    const value = search.trim()
    router.push(value ? `/shelf?q=${encodeURIComponent(value)}` : '/shelf')
  }

  return (
    <header className="w-full px-4 sm:px-6 py-4 bg-surface/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm relative">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-12 h-12 bg-gradient-to-br from-accent via-accent-dark to-accent rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              aria-label="Librian"
            >
              <BrandIcon className="w-6 h-6 text-[#1a1208] group-hover:rotate-6 transition-transform duration-300" strokeWidth={2.25} />
            </Link>

            <Link href="/" className="group flex flex-col leading-none">
              <span
                className="text-2xl font-semibold tracking-tight text-text-primary group-hover:text-accent transition-colors"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Librian
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-text-muted mt-1">
                biblioteca pessoal
              </span>
            </Link>
          </div>

          {user && (
            <nav className="hidden lg:flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleShelf}
                className="flex items-center gap-3 px-5 py-3 text-text-secondary hover:text-accent transition-all duration-200 rounded-2xl hover:bg-accent-light/10 border border-transparent font-semibold text-sm group whitespace-nowrap"
              >
                <ShelfIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Estante
              </button>
              <Link
                href="/shelf"
                className="flex items-center gap-3 px-5 py-3 text-text-secondary hover:text-accent transition-all duration-200 rounded-2xl hover:bg-accent-light/10 border border-transparent font-semibold text-sm whitespace-nowrap"
              >
                Gerenciar
              </Link>
              <Link
                href="/books/new"
                className="flex items-center gap-3 px-5 py-3 text-text-secondary hover:text-accent transition-all duration-200 rounded-2xl hover:bg-accent-light/10 border border-transparent font-semibold text-sm whitespace-nowrap"
              >
                <AddBookIcon className="w-4 h-4" />
                Adicionar
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:block">
              <div className="relative w-72">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar na estante..."
                  className="w-full pl-12 pr-4 h-12 bg-[var(--surface-input)] border border-[var(--border-strong)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25 focus:border-[var(--accent)] text-text-primary placeholder:text-text-muted"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      submitSearch()
                    }
                  }}
                />
              </div>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/books/new"
                className="sm:hidden w-12 h-12 bg-gradient-to-r from-accent to-accent-dark text-[#1a1208] rounded-2xl hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center"
                title="Adicionar livro"
              >
                <AddBookIcon className="w-5 h-5" />
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-3 h-12 px-3 text-text-secondary hover:text-accent transition-all duration-200 hover:bg-accent-light/10 rounded-2xl group"
              >
                <div className="w-10 h-10 rounded-2xl border border-accent/20 overflow-hidden relative">
                  <img
                    src={user.picture || generateAvatarUrl(user.name, user.email)}
                    alt={user.name || 'Avatar'}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                  {imageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-secondary">
                      <ProfileIcon className="w-5 h-5 text-accent" />
                    </div>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-sm font-semibold text-text-primary">{user.name}</span>
                  <p className="text-xs text-text-secondary">Perfil</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="w-12 h-12 text-text-secondary hover:text-rose-400 transition-all duration-200 hover:bg-rose-500/10 rounded-2xl flex items-center justify-center"
                title="Sair"
              >
                <LogoutIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-accent to-accent-dark text-[#1a1208] rounded-2xl hover:shadow-lg font-semibold"
            >
              <LoginIcon className="w-5 h-5" />
              <span className="hidden sm:block">Entrar</span>
            </Link>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-12 h-12 text-text-secondary hover:text-accent hover:bg-accent-light/10 rounded-2xl flex items-center justify-center"
          >
            {isMobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden mt-4 pb-6 border-t border-border-subtle rounded-2xl mx-2 bg-surface">
          <div className="pt-6 px-4 space-y-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={openShelfAndCloseMenu}
                  className="w-full flex items-center gap-4 px-4 py-4 text-text-secondary hover:text-accent rounded-2xl hover:bg-accent-light/10 font-semibold"
                >
                  <ShelfIcon className="w-5 h-5" />
                  <span>Abrir estante</span>
                </button>
                <Link href="/shelf" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-4 text-text-secondary hover:text-accent rounded-2xl hover:bg-accent-light/10 font-semibold">
                  <ShelfIcon className="w-5 h-5" />
                  <span>Gerenciar estante</span>
                </Link>
                <Link href="/books/new" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-4 text-text-secondary hover:text-accent rounded-2xl hover:bg-accent-light/10 font-semibold">
                  <AddBookIcon className="w-5 h-5" />
                  <span>Adicionar livro</span>
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 text-rose-400 rounded-2xl hover:bg-rose-500/10 font-semibold">
                  <LogoutIcon className="w-5 h-5" />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-3 px-4 py-4 text-[#1a1208] bg-gradient-to-r from-accent to-accent-dark rounded-2xl font-semibold"
              >
                <LoginIcon className="w-5 h-5" />
                <span>Entrar</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
