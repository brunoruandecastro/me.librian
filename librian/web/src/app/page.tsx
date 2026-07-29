"use client"

import Layout from "@/components/Layout"
import ProtectedRoute from "@/components/ProtectedRoute"
import LibraryStats from "@/components/LibraryStats"
import ShelfSection from "@/components/ShelfSection"
import HighlightsCarousel from "@/components/HighlightsCarousel"
import CountUp from "@/components/CountUp"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { AddBookIcon, BrandIcon, ShelfIcon } from "@/lib/icons"
import { useShelf } from "@/contexts/ShelfContext"
import { bookService, mapApiStatusToUi, UiBookStatus } from "@/services/bookService"

type UiBook = {
  id: string
  title: string
  author: string
  coverUrl?: string
  status: UiBookStatus
  year?: number
  publisher?: string
  isbn?: string
}

export default function HomePage() {
  const { open: openShelf } = useShelf()
  const [books, setBooks] = useState<UiBook[]>([])
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBooks = useCallback(async () => {
    try {
      setLoadingBooks(true)
      setError(null)
      const apiBooks = await bookService.getAllBooks()
      setBooks(apiBooks.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        status: mapApiStatusToUi(book.status),
        year: book.year,
        publisher: book.publisher,
        isbn: book.isbn,
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar livros')
    } finally {
      setLoadingBooks(false)
    }
  }, [])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const readingBooks = books.filter(book => book.status === 'reading')
  const readBooks = books.filter(book => book.status === 'read')
  const recentBooks = books.slice(0, 4)

  return (
    <ProtectedRoute>
      <Layout>
        <section className="relative mb-12 -mx-4 overflow-hidden rounded-b-3xl border-b border-[var(--border-subtle)] bg-[var(--background-elevated)] px-4 py-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 animate-hero-glow bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(212,165,116,0.22),transparent_55%)]"
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Librian</p>
            <h1
              className="mb-4 text-5xl font-semibold leading-tight text-[var(--text-primary)] md:text-6xl"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Sua biblioteca
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-[var(--text-secondary)]">
              Abra a estante para ver seus volumes, ou entre na estante completa para editar, duplicar e organizar leituras.
            </p>

            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openShelf}
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-7 py-4 text-lg font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)]/40 hover:bg-[var(--hover)]"
              >
                <ShelfIcon className="h-6 w-6 text-[var(--accent)]" />
                Abrir estante
              </button>
              <Link
                href="/shelf"
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[var(--accent)] px-7 py-4 text-lg font-semibold text-[#1a1208] transition hover:bg-[var(--accent-light)]"
              >
                Gerenciar estante
              </Link>
              <Link
                href="/books/new"
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-transparent px-7 py-4 text-lg font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent-light)]"
              >
                <AddBookIcon className="h-6 w-6" />
                Adicionar
              </Link>
            </div>

            <div className="mx-auto grid max-w-xl grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-[var(--text-primary)]">
                  <CountUp value={loadingBooks ? 0 : books.length} />
                </div>
                <div className="text-sm text-[var(--text-muted)]">Volumes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[var(--text-primary)]">
                  <CountUp value={loadingBooks ? 0 : readingBooks.length} />
                </div>
                <div className="text-sm text-[var(--text-muted)]">Lendo</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[var(--text-primary)]">
                  <CountUp value={loadingBooks ? 0 : readBooks.length} />
                </div>
                <div className="text-sm text-[var(--text-muted)]">Lidos</div>
              </div>
            </div>
          </div>
        </section>

        <LibraryStats />

        {error && (
          <div className="mb-8 rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger-light)] p-4 text-[var(--danger)]">
            {error}
          </div>
        )}

        {loadingBooks ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-accent" />
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--border)] px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-muted)]">
              <BrandIcon className="h-8 w-8 text-accent" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-serif)' }}>
              Comece sua estante
            </h2>
            <p className="mx-auto mb-6 max-w-md text-[var(--text-secondary)]">
              Adicione o primeiro livro ou importe uma planilha na estante completa.
            </p>
            <Link
              href="/books/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-6 py-3 font-semibold text-[#1a1208]"
            >
              <AddBookIcon className="h-5 w-5" />
              Adicionar livro
            </Link>
          </div>
        ) : (
          <>
            {readBooks.length > 0 && <HighlightsCarousel books={readBooks.slice(0, 3)} />}
            {readingBooks.length > 0 && (
              <ShelfSection title="Lendo agora" books={readingBooks} type="reading" view="grid" />
            )}
            <ShelfSection title="Na madeira recentemente" books={recentBooks} type="all" view="grid" />

            <div className="mt-4 mb-8 flex justify-center">
              <Link
                href="/shelf"
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent-light)]"
              >
                <ShelfIcon className="h-4 w-4" />
                Ver e gerenciar todos os livros
              </Link>
            </div>
          </>
        )}
      </Layout>
    </ProtectedRoute>
  )
}
