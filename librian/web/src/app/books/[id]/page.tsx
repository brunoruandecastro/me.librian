"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import Layout from "@/components/Layout"
import ProtectedRoute from "@/components/ProtectedRoute"
import BookEditModal from "@/components/BookEditModal"
import type { BookEditFocusField } from "@/components/BookEditModal"
import {
  CloseIcon,
  DateIcon,
  DeleteIcon,
  DuplicateIcon,
  EditIcon,
  ImageIcon,
  PublisherIcon,
  RatingIcon,
  ReadIcon,
  ReadingIcon,
  SuccessIcon,
  UnreadIcon,
  WishlistIcon,
} from "@/lib/icons"
import { BOOK_STATUS_OPTIONS, statusLabel } from "@/lib/bookStatus"
import {
  ApiBookStatus,
  Book,
  bookService,
  mapApiStatusToUi,
  UiBookStatus,
} from "@/services/bookService"

type Props = {
  params: Promise<{ id: string }>
}

const statusConfig = {
  read: { label: 'Lido', icon: ReadIcon, color: 'text-success', bgColor: 'bg-success-light', borderColor: 'border-success/20' },
  reading: { label: 'Lendo', icon: ReadingIcon, color: 'text-info', bgColor: 'bg-info-light', borderColor: 'border-info/20' },
  unread: { label: 'Não lido', icon: UnreadIcon, color: 'text-text-secondary', bgColor: 'bg-surface-secondary', borderColor: 'border-border' },
  wishlist: { label: 'Lista de desejos', icon: WishlistIcon, color: 'text-pink-500', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
}

export default function BookDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [editFocus, setEditFocus] = useState<BookEditFocusField | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [dialog, setDialog] = useState<{ title: string; message: string } | null>(null)

  const openEdit = (field: BookEditFocusField = 'title') => setEditFocus(field)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        setBook(await bookService.getBookById(id))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar livro')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const uiStatus: UiBookStatus = book ? mapApiStatusToUi(book.status) : 'unread'
  const status = statusConfig[uiStatus]
  const StatusIcon = status.icon

  const handleStatusChange = async (nextStatus: ApiBookStatus) => {
    if (!book || book.status === nextStatus) return
    try {
      setBusy(true)
      const updated = await bookService.updateBook(book.id, bookService.toUpdatePayload(book, { status: nextStatus }))
      setBook(updated)
      setDialog({
        title: 'Status atualizado',
        message: `Agora está como ${statusLabel(nextStatus)}.`,
      })
    } catch (err) {
      setDialog({
        title: 'Falha ao atualizar',
        message: err instanceof Error ? err.message : 'Não foi possível alterar o status.',
      })
    } finally {
      setBusy(false)
    }
  }

  const handleDuplicate = async () => {
    if (!book) return
    try {
      setBusy(true)
      const copy = await bookService.duplicateBook(book)
      setDialog({
        title: 'Livro duplicado',
        message: `Criamos “${copy.title}”.`,
      })
      router.push(`/books/${copy.id}`)
    } catch (err) {
      setDialog({
        title: 'Falha ao duplicar',
        message: err instanceof Error ? err.message : 'Não foi possível duplicar.',
      })
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!book) return
    try {
      setBusy(true)
      await bookService.deleteBook(book.id)
      router.push('/shelf')
    } catch (err) {
      setConfirmDelete(false)
      setDialog({
        title: 'Falha ao excluir',
        message: err instanceof Error ? err.message : 'Não foi possível excluir.',
      })
      setBusy(false)
    }
  }

  const metaItems = book
    ? [
        book.publisher
          ? { icon: PublisherIcon, label: 'Editora', value: book.publisher, field: 'publisher' as const }
          : null,
        book.year
          ? { icon: DateIcon, label: 'Ano', value: String(book.year), field: 'year' as const }
          : null,
        book.pages != null
          ? { icon: null, label: 'Páginas', value: String(book.pages), field: 'pages' as const }
          : null,
        book.isbn
          ? { icon: null, label: 'ISBN', value: book.isbn, field: 'isbn' as const }
          : null,
        book.genre
          ? { icon: null, label: 'Gênero', value: book.genre, field: 'genre' as const }
          : null,
        book.language
          ? { icon: null, label: 'Idioma', value: book.language, field: 'language' as const }
          : null,
        book.readDate
          ? { icon: DateIcon, label: 'Lido em', value: book.readDate, field: 'readDate' as const }
          : null,
      ].filter(Boolean) as Array<{
        icon: typeof PublisherIcon | null
        label: string
        value: string
        field: BookEditFocusField
      }>
    : []

  return (
    <ProtectedRoute>
      <Layout>
        <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
          <nav className="mb-8">
            <Link
              href="/shelf"
              className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent-light)]"
            >
              ← Voltar para a estante
            </Link>
          </nav>

          {loading && (
            <div className="flex justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[var(--accent)]" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-light)] p-4 text-[var(--danger)]">
              {error}
            </div>
          )}

          {!loading && book && (
            <div className="space-y-12">
              {/* Hero: capa + identidade */}
              <section className="grid items-start gap-8 md:grid-cols-[minmax(0,220px)_1fr] lg:grid-cols-[minmax(0,260px)_1fr] lg:gap-12">
                <div className="mx-auto w-full max-w-[260px] md:mx-0">
                  <div className="group relative aspect-[2/3] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)] shadow-[0_20px_50px_-28px_rgba(0,0,0,0.65)]">
                    {book.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={book.coverUrl}
                        alt={`Capa de ${book.title}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                        <ImageIcon className="h-10 w-10 text-[var(--text-muted)]" />
                        <p className="text-sm text-[var(--text-muted)]">Sem capa</p>
                        <button
                          type="button"
                          onClick={() => openEdit('coverUrl')}
                          className="text-xs font-medium text-[var(--accent-light)] underline-offset-2 hover:underline"
                        >
                          Adicionar capa
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => openEdit('coverUrl')}
                      className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:bg-[var(--accent)] hover:text-[#1a1208] hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50"
                      title="Editar capa"
                      aria-label="Editar capa"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="min-w-0 space-y-7">
                  <div>
                    <div
                      className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${status.bgColor} ${status.color} ${status.borderColor}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </div>

                    <button
                      type="button"
                      onClick={() => openEdit('title')}
                      className="mb-3 block w-full text-left"
                    >
                      <h1
                        className="text-3xl font-semibold leading-tight text-[var(--text-primary)] transition hover:text-[var(--accent-light)] md:text-4xl lg:text-5xl"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {book.title}
                      </h1>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit('author')}
                      className="text-left text-lg text-[var(--text-secondary)] transition hover:text-[var(--accent-light)] md:text-xl"
                    >
                      {book.author}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => openEdit('rating')}
                      className="flex items-center gap-1 rounded-lg transition hover:opacity-90"
                      aria-label={`Avaliação: ${book.rating ?? 0} de 5 — editar`}
                    >
                      {[...Array(5)].map((_, i) => (
                        <RatingIcon
                          key={i}
                          className={`h-5 w-5 ${
                            book.rating != null && i < book.rating
                              ? 'fill-current text-amber-500'
                              : 'text-[var(--text-muted)]'
                          }`}
                        />
                      ))}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => openEdit('title')}
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#1a1208] transition hover:bg-[var(--accent-light)] disabled:opacity-60"
                      >
                        <EditIcon className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={handleDuplicate}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition hover:border-[var(--accent)]/50 hover:text-[var(--accent-light)] disabled:opacity-60"
                        title="Duplicar livro"
                        aria-label="Duplicar livro"
                      >
                        <DuplicateIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirmDelete(true)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:opacity-60"
                        title="Excluir livro"
                        aria-label="Excluir livro"
                      >
                        <DeleteIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      Status na estante
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {BOOK_STATUS_OPTIONS.map((option) => {
                        const active = book.status === option.value
                        return (
                          <button
                            key={option.value}
                            type="button"
                            disabled={busy}
                            onClick={() => handleStatusChange(option.value)}
                            className={`rounded-full px-3.5 py-1.5 text-sm transition disabled:opacity-60 ${
                              active
                                ? 'bg-[var(--accent)] font-semibold text-[#1a1208]'
                                : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent-light)]'
                            }`}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* Conteúdo */}
              <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
                <div className="space-y-10">
                  <section>
                    <h2
                      className="mb-3 text-xl font-semibold text-[var(--text-primary)]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      Sinopse
                    </h2>
                    {book.description ? (
                      <button
                        type="button"
                        onClick={() => openEdit('description')}
                        className="block max-w-prose text-left text-base leading-relaxed text-[var(--text-secondary)] transition hover:text-[var(--accent-light)]"
                      >
                        {book.description}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openEdit('description')}
                        className="text-sm text-[var(--text-muted)] transition hover:text-[var(--accent-light)]"
                      >
                        Sem sinopse ainda — tocar para adicionar
                      </button>
                    )}
                  </section>

                  <section>
                    <h2
                      className="mb-3 text-xl font-semibold text-[var(--text-primary)]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      Anotações
                    </h2>
                    {book.notes ? (
                      <button
                        type="button"
                        onClick={() => openEdit('notes')}
                        className="block max-w-prose whitespace-pre-wrap text-left text-base leading-relaxed text-[var(--text-secondary)] transition hover:text-[var(--accent-light)]"
                      >
                        {book.notes}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openEdit('notes')}
                        className="text-sm text-[var(--text-muted)] transition hover:text-[var(--accent-light)]"
                      >
                        Nenhuma anotação — tocar para escrever
                      </button>
                    )}
                  </section>
                </div>

                <aside>
                  <h2
                    className="mb-4 text-xl font-semibold text-[var(--text-primary)]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Detalhes
                  </h2>
                  {metaItems.length > 0 ? (
                    <div className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
                      {metaItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => openEdit(item.field)}
                            className="flex w-full items-start justify-between gap-4 py-3.5 text-left transition hover:bg-white/[0.02]"
                          >
                            <span className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                              {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
                              {item.label}
                            </span>
                            <span className="text-right text-sm font-medium text-[var(--text-primary)]">
                              {item.value}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openEdit('publisher')}
                      className="text-sm text-[var(--text-muted)] transition hover:text-[var(--accent-light)]"
                    >
                      Sem detalhes cadastrados — editar
                    </button>
                  )}
                </aside>
              </div>
            </div>
          )}
        </div>

        {editFocus && book && (
          <BookEditModal
            book={book}
            focusField={editFocus}
            onClose={() => setEditFocus(null)}
            onSaved={(updated) => {
              setBook(updated)
              setEditFocus(null)
              setDialog({
                title: 'Livro atualizado',
                message: `As alterações em “${updated.title}” foram salvas.`,
              })
            }}
          />
        )}

        {confirmDelete && book && (
          <ConfirmDialog
            title="Excluir da estante?"
            message={`Remover “${book.title}”? Essa ação não pode ser desfeita.`}
            confirmLabel="Excluir"
            danger
            busy={busy}
            onClose={() => setConfirmDelete(false)}
            onConfirm={handleDelete}
          />
        )}

        {dialog && (
          <ConfirmDialog
            title={dialog.title}
            message={dialog.message}
            confirmLabel="Entendi"
            onClose={() => setDialog(null)}
            onConfirm={() => setDialog(null)}
            success
          />
        )}
      </Layout>
    </ProtectedRoute>
  )
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onClose,
  onConfirm,
  danger,
  success,
  busy,
}: {
  title: string
  message: string
  confirmLabel: string
  onClose: () => void
  onConfirm: () => void
  danger?: boolean
  success?: boolean
  busy?: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-4"
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
        {success && (
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
              disabled={busy}
              className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-[var(--text-secondary)]"
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`flex-1 rounded-xl px-4 py-3 font-semibold disabled:opacity-60 ${
              danger
                ? 'bg-[var(--danger)] text-white'
                : 'bg-[var(--accent)] text-[#1a1208] hover:bg-[var(--accent-light)]'
            }`}
          >
            {busy ? 'Aguarde…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
