"use client"

import Link from 'next/link'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import BookXlsxActions from '@/components/BookXlsxActions'
import BookEditModal from '@/components/BookEditModal'
import Pagination from '@/components/Pagination'
import {
  AddBookIcon,
  CloseIcon,
  DeleteIcon,
  DuplicateIcon,
  EditIcon,
  ShelfIcon,
  SuccessIcon,
} from '@/lib/icons'
import { BOOK_STATUS_OPTIONS, spineColor, statusLabel } from '@/lib/bookStatus'
import { ApiBookStatus, Book, BookPage, bookService } from '@/services/bookService'

type DialogState = {
  title: string
  message: string
  tone: 'success' | 'warning' | 'error'
}

type StatusFilter = 'ALL' | ApiBookStatus

const PAGE_SIZE = 8

function ShelfPageContent() {
  const searchParams = useSearchParams()
  const query = (searchParams.get('q') || '').trim()

  const [books, setBooks] = useState<Book[]>([])
  const [pageMeta, setPageMeta] = useState<Pick<BookPage, 'page' | 'totalPages' | 'totalElements' | 'first' | 'last'>>({
    page: 0,
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: true,
  })
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>('ALL')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Book | null>(null)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [dialog, setDialog] = useState<DialogState | null>(null)

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await bookService.getBooks({
        page,
        size: PAGE_SIZE,
        status: filter === 'ALL' ? undefined : filter,
        q: query || undefined,
      })
      setBooks(result.content)
      setPageMeta({
        page: result.page,
        totalPages: result.totalPages,
        totalElements: result.totalElements,
        first: result.first,
        last: result.last,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estante')
    } finally {
      setLoading(false)
    }
  }, [page, filter, query])

  useEffect(() => {
    setPage(0)
  }, [filter, query])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStatusChange = async (book: Book, status: ApiBookStatus) => {
    try {
      setBusyId(book.id)
      await bookService.updateBook(book.id, bookService.toUpdatePayload(book, { status }))
      await loadBooks()
      setDialog({
        tone: 'success',
        title: 'Status atualizado',
        message: `“${book.title}” agora está como ${statusLabel(status)}.`,
      })
    } catch (err) {
      setDialog({
        tone: 'error',
        title: 'Não foi possível atualizar',
        message: err instanceof Error ? err.message : 'Erro ao alterar status',
      })
    } finally {
      setBusyId(null)
    }
  }

  const handleDuplicate = async (book: Book) => {
    try {
      setBusyId(book.id)
      const copy = await bookService.duplicateBook(book)
      await loadBooks()
      setDialog({
        tone: 'success',
        title: 'Livro duplicado',
        message: `Criamos “${copy.title}”. Você pode editar só o que precisar na cópia.`,
      })
    } catch (err) {
      setDialog({
        tone: 'error',
        title: 'Falha ao duplicar',
        message: err instanceof Error ? err.message : 'Erro ao duplicar livro',
      })
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    const book = confirmDelete
    try {
      setBusyId(book.id)
      await bookService.deleteBook(book.id)
      setConfirmDelete(null)
      // se apagar o último da página, volta uma
      if (books.length === 1 && page > 0) {
        setPage((current) => current - 1)
      } else {
        await loadBooks()
      }
      setDialog({
        tone: 'success',
        title: 'Livro removido',
        message: `“${book.title}” saiu da sua estante.`,
      })
    } catch (err) {
      setDialog({
        tone: 'error',
        title: 'Falha ao excluir',
        message: err instanceof Error ? err.message : 'Erro ao excluir livro',
      })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <section className="mb-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent-muted)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--accent-light)]">
                <ShelfIcon className="h-3.5 w-3.5" />
                Estante completa
              </div>
              <h1
                className="text-4xl font-semibold text-[var(--text-primary)]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Gerencie suas leituras
              </h1>
              <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
                Altere status, edite detalhes, duplique para variar só o necessário ou remova volumes da estante.
              </p>
              {query && (
                <p className="mt-2 text-sm text-[var(--accent-light)]">
                  Busca: “{query}” · {pageMeta.totalElements} resultado(s)
                </p>
              )}
            </div>
            <Link
              href="/books/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3 font-semibold text-[#1a1208] transition hover:bg-[var(--accent-light)]"
            >
              <AddBookIcon className="h-5 w-5" />
              Adicionar livro
            </Link>
          </div>
        </section>

        <div className="mb-8 rounded-3xl border border-[var(--border)] bg-[linear-gradient(135deg,#2a241c_0%,#1c1814_55%,#161310_100%)] p-5 md:p-6">
          <p className="mb-4 text-sm text-[var(--accent-light)]">
            {pageMeta.totalElements} volume(s) na madeira
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                title={book.title}
                className="group relative aspect-[2/3] overflow-hidden rounded-lg border border-[#5c4a36]/60 bg-[#3a2f24] shadow-md transition hover:-translate-y-0.5 hover:border-[var(--accent)]/50 hover:shadow-lg"
              >
                {book.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="flex h-full w-full flex-col items-center justify-end px-1.5 pb-2 text-center"
                    style={{
                      background: `linear-gradient(180deg, ${spineColor(book.title)} 0%, #8b6f4e 100%)`,
                    }}
                  >
                    <span className="line-clamp-4 text-[10px] font-semibold leading-tight text-[#1a1208]">
                      {book.title}
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1.5 pt-6 opacity-0 transition group-hover:opacity-100">
                  <p className="truncate text-[10px] font-medium text-white">{book.title}</p>
                </div>
              </Link>
            ))}
            {!loading && books.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-[var(--text-muted)]">
                Sua estante ainda está vazia.
              </p>
            )}
          </div>
          <Pagination
            className="mt-5"
            page={pageMeta.page}
            totalPages={pageMeta.totalPages}
            totalElements={pageMeta.totalElements}
            onPageChange={handlePageChange}
          />
        </div>

        <div className="mb-8">
          <BookXlsxActions bookCount={pageMeta.totalElements} onImported={loadBooks} />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <FilterChip active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="Todos" />
          {BOOK_STATUS_OPTIONS.map((option) => (
            <FilterChip
              key={option.value}
              active={filter === option.value}
              onClick={() => setFilter(option.value)}
              label={option.label}
            />
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[var(--accent)]" />
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger-light)] p-4 text-[var(--danger)]">
            {error}
          </div>
        )}

        {!loading && (
        <div className="space-y-3">
          {books.map((book) => (
            <article
              key={book.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <Link href={`/books/${book.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)]">
                      {book.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-[var(--text-muted)]">
                          Sem capa
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--accent-light)]">
                        {book.title}
                      </h2>
                      <p className="truncate text-sm text-[var(--text-secondary)]">{book.author}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {book.year ? `${book.year} · ` : ''}
                        {statusLabel(book.status)}
                      </p>
                    </div>
                  </Link>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="sr-only" htmlFor={`status-${book.id}`}>Status</label>
                  <select
                    id={`status-${book.id}`}
                    value={book.status}
                    disabled={busyId === book.id}
                    onChange={(event) => handleStatusChange(book, event.target.value as ApiBookStatus)}
                    className="field-input min-w-[10rem] rounded-xl px-3 py-2 text-sm"
                  >
                    {BOOK_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === book.id}
                      onClick={() => setEditingBook(book)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
                      title="Editar livro"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={busyId === book.id}
                      onClick={() => handleDuplicate(book)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
                      title="Duplicar livro"
                    >
                      <DuplicateIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={busyId === book.id}
                      onClick={() => setConfirmDelete(book)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:opacity-50"
                      title="Excluir livro"
                    >
                      <DeleteIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {books.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-16 text-center">
              <p className="text-[var(--text-secondary)]">Nenhum livro neste filtro.</p>
            </div>
          )}

          <Pagination
            className="pt-4"
            page={pageMeta.page}
            totalPages={pageMeta.totalPages}
            totalElements={pageMeta.totalElements}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {editingBook && (
        <BookEditModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSaved={async (updated) => {
            setEditingBook(null)
            await loadBooks()
            setDialog({
              tone: 'success',
              title: 'Livro atualizado',
              message: `As alterações em “${updated.title}” foram salvas.`,
            })
          }}
        />
      )}

        {confirmDelete && (
          <Modal
            title="Excluir da estante?"
            message={`Remover “${confirmDelete.title}”? Essa ação não pode ser desfeita.`}
            confirmLabel="Excluir"
            danger
            onClose={() => setConfirmDelete(null)}
            onConfirm={handleDelete}
          />
        )}

      {dialog && (
        <Modal
          title={dialog.title}
          message={dialog.message}
          confirmLabel="Entendi"
          onClose={() => setDialog(null)}
          onConfirm={() => setDialog(null)}
          icon
        />
      )}
    </>
  )
}

export default function ShelfPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[var(--accent)]" />
            </div>
          }
        >
          <ShelfPageContent />
        </Suspense>
      </Layout>
    </ProtectedRoute>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm transition ${
        active
          ? 'bg-[var(--accent)] font-semibold text-[#1a1208]'
          : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent-light)]'
      }`}
    >
      {label}
    </button>
  )
}

function Modal({
  title,
  message,
  confirmLabel,
  onClose,
  onConfirm,
  danger,
  icon,
}: {
  title: string
  message: string
  confirmLabel: string
  onClose: () => void
  onConfirm: () => void
  danger?: boolean
  icon?: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 pb-6 pt-8 text-center shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--hover)]"
          aria-label="Fechar"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
        {icon && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success-light)] ring-4 ring-[var(--success)]/20">
            <SuccessIcon className="h-6 w-6 text-[var(--success)]" />
          </div>
        )}
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h3>
        <p className="mt-2 text-[var(--text-secondary)]">{message}</p>
        <div className="mt-6 flex gap-3">
          {danger && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-[var(--text-secondary)]"
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl px-4 py-3 font-semibold ${
              danger
                ? 'bg-[var(--danger)] text-white'
                : 'bg-[var(--accent)] text-[#1a1208] hover:bg-[var(--accent-light)]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
