"use client"

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useShelf } from '@/contexts/ShelfContext'
import { bookService, Book } from '@/services/bookService'
import { spineColor, statusLabel } from '@/lib/bookStatus'
import { CloseIcon, ChevronRightIcon, ShelfIcon, AddBookIcon } from '@/lib/icons'

export default function ShelfDrawer() {
  const { user } = useAuth()
  const { isOpen, close } = useShelf()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)

  const loadBooks = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      setBooks(await bookService.getAllBooks())
    } catch {
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (isOpen && user) {
      loadBooks()
    }
  }, [isOpen, user, loadBooks])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  const openFullShelf = () => {
    close()
    router.push('/shelf')
  }

  if (!user) return null

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
        aria-hidden={!isOpen}
      />

      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-[min(100vw,22rem)] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Prévia da estante"
      >
        <div className="relative flex h-full flex-col overflow-hidden border-l border-[var(--border)] bg-[linear-gradient(180deg,#2a241c_0%,#1c1814_45%,#161310_100%)] shadow-2xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-[linear-gradient(90deg,rgba(0,0,0,0.35),transparent)]" />

          <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
            <div className="flex items-center gap-2 text-[var(--accent-light)]">
              <ShelfIcon className="h-5 w-5" />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-serif)' }}>
                  Sua estante
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Prévia de seus livros
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]"
              aria-label="Fechar estante"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </header>

          <button
            type="button"
            onClick={openFullShelf}
            className="group mx-4 mt-4 flex items-center justify-between rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-3 text-left transition hover:bg-[var(--accent)]/20"
          >
            <span className="text-sm text-[var(--accent-light)]">
              Abrir estante completa
            </span>
            <ChevronRightIcon className="h-4 w-4 text-[var(--accent)] transition group-hover:translate-x-0.5" />
          </button>

          <div className="relative mt-4 flex-1 overflow-y-auto px-4 pb-6">
            <div
              className="cursor-pointer rounded-2xl border border-[#5c4a36]/50 bg-[linear-gradient(180deg,#3a2f24_0%,#2b221a_100%)] p-3 shadow-inner"
              onClick={openFullShelf}
              title="Abrir estante completa"
            >
              <div className="mb-2 h-2 rounded-full bg-[#4a3b2c] shadow" />

              {loading ? (
                <div className="flex h-48 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--accent)]" />
                </div>
              ) : books.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-3 px-4 text-center">
                  <p className="text-sm text-[var(--text-secondary)]">Estante vazia por enquanto.</p>
                  <Link
                    href="/books/new"
                    onClick={close}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[#1a1208]"
                  >
                    <AddBookIcon className="h-4 w-4" />
                    Adicionar livro
                  </Link>
                </div>
              ) : (
                <ul className="space-y-2">
                  {books.slice(0, 18).map((book) => (
                    <li key={book.id}>
                      <Link
                        href={`/books/${book.id}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          close()
                        }}
                        className="relative flex h-11 items-center overflow-hidden rounded-lg border border-black/20 shadow-sm transition hover:brightness-110"
                        style={
                          book.coverUrl
                            ? undefined
                            : { backgroundColor: spineColor(book.title) }
                        }
                      >
                        {book.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={book.coverUrl}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : null}
                        <div
                          className={`relative z-10 flex min-w-0 flex-1 items-center gap-3 px-3 ${
                            book.coverUrl ? 'bg-gradient-to-r from-black/75 via-black/55 to-black/25' : ''
                          }`}
                        >
                          <span
                            className={`h-7 w-1 shrink-0 rounded-full ${
                              book.coverUrl ? 'bg-white/35' : 'bg-black/25'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-sm font-semibold ${
                                book.coverUrl ? 'text-white' : 'text-[#1a1208]'
                              }`}
                            >
                              {book.title}
                            </p>
                            <p
                              className={`truncate text-[11px] ${
                                book.coverUrl ? 'text-white/80' : 'text-[#1a1208]/75'
                              }`}
                            >
                              {book.author} · {statusLabel(book.status)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-3 h-2 rounded-full bg-[#4a3b2c] shadow" />
              {books.length > 18 && (
                <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
                  +{books.length - 18} na estante completa
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
