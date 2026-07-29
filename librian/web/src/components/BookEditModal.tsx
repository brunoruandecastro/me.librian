"use client"

import { useEffect, useRef, useState } from 'react'
import { CloseIcon, RatingIcon } from '@/lib/icons'
import { BOOK_STATUS_OPTIONS } from '@/lib/bookStatus'
import { ApiBookStatus, Book, bookService, CreateBookData } from '@/services/bookService'

export type BookEditFocusField =
  | 'title'
  | 'author'
  | 'status'
  | 'isbn'
  | 'publisher'
  | 'year'
  | 'pages'
  | 'genre'
  | 'language'
  | 'readDate'
  | 'coverUrl'
  | 'rating'
  | 'description'
  | 'notes'

type Props = {
  book: Book
  onClose: () => void
  onSaved: (book: Book) => void
  /** Campo que deve receber foco ao abrir o modal */
  focusField?: BookEditFocusField
}

type FormState = {
  title: string
  author: string
  isbn: string
  publisher: string
  year: string
  pages: string
  description: string
  coverUrl: string
  status: ApiBookStatus
  rating: number
  notes: string
  genre: string
  language: string
  readDate: string
}

function toForm(book: Book): FormState {
  return {
    title: book.title || '',
    author: book.author || '',
    isbn: book.isbn || '',
    publisher: book.publisher || '',
    year: book.year != null ? String(book.year) : '',
    pages: book.pages != null ? String(book.pages) : '',
    description: book.description || '',
    coverUrl: book.coverUrl || '',
    status: book.status,
    rating: book.rating || 0,
    notes: book.notes || '',
    genre: book.genre || '',
    language: book.language || '',
    readDate: book.readDate || '',
  }
}

export default function BookEditModal({ book, onClose, onSaved, focusField = 'title' }: Props) {
  const [form, setForm] = useState<FormState>(() => toForm(book))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setForm(toForm(book))
    setError(null)
  }, [book])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const root = scrollRef.current
      if (!root) return
      const target = root.querySelector<HTMLElement>(`[data-edit-field="${focusField}"]`)
      if (!target) return
      target.scrollIntoView({ block: 'center', behavior: 'smooth' })
      target.focus({ preventScroll: true })
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        const end = target.value.length
        try {
          target.setSelectionRange(end, end)
        } catch {
          // inputs type number/date podem não permitir selection
        }
      }
    }, 40)
    return () => window.clearTimeout(timer)
  }, [focusField])

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.title.trim() || !form.author.trim()) {
      setError('Título e autor são obrigatórios.')
      return
    }

    const payload: CreateBookData = {
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim() || undefined,
      publisher: form.publisher.trim() || undefined,
      year: form.year ? Number(form.year) : undefined,
      pages: form.pages ? Number(form.pages) : undefined,
      description: form.description.trim() || undefined,
      coverUrl: form.coverUrl.trim() || undefined,
      status: form.status,
      rating: form.rating > 0 ? form.rating : undefined,
      notes: form.notes.trim() || undefined,
      genre: form.genre.trim() || undefined,
      language: form.language.trim() || undefined,
      readDate: form.readDate || undefined,
    }

    try {
      setSaving(true)
      setError(null)
      const updated = await bookService.updateBook(book.id, payload)
      onSaved(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar as alterações.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-edit-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-5">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.18em] text-[var(--accent-light)]">
              Editar volume
            </p>
            <h2
              id="book-edit-title"
              className="text-2xl font-semibold text-[var(--text-primary)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {book.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--text-muted)] transition hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
            aria-label="Fechar"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Título *" className="sm:col-span-2">
                <input
                  data-edit-field="title"
                  className="field-input w-full"
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  required
                />
              </Field>
              <Field label="Autor *">
                <input
                  data-edit-field="author"
                  className="field-input w-full"
                  value={form.author}
                  onChange={(e) => setField('author', e.target.value)}
                  required
                />
              </Field>
              <Field label="Status">
                <select
                  data-edit-field="status"
                  className="field-input w-full"
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value as ApiBookStatus)}
                >
                  {BOOK_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="ISBN">
                <input
                  data-edit-field="isbn"
                  className="field-input w-full"
                  value={form.isbn}
                  onChange={(e) => setField('isbn', e.target.value)}
                />
              </Field>
              <Field label="Editora">
                <input
                  data-edit-field="publisher"
                  className="field-input w-full"
                  value={form.publisher}
                  onChange={(e) => setField('publisher', e.target.value)}
                />
              </Field>
              <Field label="Ano">
                <input
                  data-edit-field="year"
                  type="number"
                  className="field-input w-full"
                  value={form.year}
                  onChange={(e) => setField('year', e.target.value)}
                  min={1450}
                  max={2100}
                />
              </Field>
              <Field label="Páginas">
                <input
                  data-edit-field="pages"
                  type="number"
                  className="field-input w-full"
                  value={form.pages}
                  onChange={(e) => setField('pages', e.target.value)}
                  min={1}
                />
              </Field>
              <Field label="Gênero">
                <input
                  data-edit-field="genre"
                  className="field-input w-full"
                  value={form.genre}
                  onChange={(e) => setField('genre', e.target.value)}
                />
              </Field>
              <Field label="Idioma">
                <input
                  data-edit-field="language"
                  className="field-input w-full"
                  value={form.language}
                  onChange={(e) => setField('language', e.target.value)}
                />
              </Field>
              <Field label="Data de leitura">
                <input
                  data-edit-field="readDate"
                  type="date"
                  className="field-input w-full"
                  value={form.readDate}
                  onChange={(e) => setField('readDate', e.target.value)}
                />
              </Field>
              <Field label="URL da capa" className="sm:col-span-2">
                <input
                  data-edit-field="coverUrl"
                  className="field-input w-full"
                  value={form.coverUrl}
                  onChange={(e) => setField('coverUrl', e.target.value)}
                  placeholder="https://..."
                />
              </Field>
            </div>

            <Field label="Avaliação">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    data-edit-field={star === 1 ? 'rating' : undefined}
                    onClick={() => setField('rating', form.rating === star ? 0 : star)}
                    className="rounded-lg p-1 transition hover:scale-110"
                    aria-label={`${star} estrela(s)`}
                  >
                    <RatingIcon
                      className={`h-6 w-6 ${
                        star <= form.rating ? 'fill-current text-[var(--accent)]' : 'text-[var(--text-muted)]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Descrição">
              <textarea
                data-edit-field="description"
                className="field-input min-h-[88px] w-full resize-y"
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                maxLength={1000}
              />
            </Field>

            <Field label="Notas">
              <textarea
                data-edit-field="notes"
                className="field-input min-h-[88px] w-full resize-y"
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
              />
            </Field>

            {error && (
              <p className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-light)] px-3 py-2 text-sm text-[var(--danger)]">
                {error}
              </p>
            )}
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-[var(--border)] px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--border)] px-5 py-3 text-[var(--text-secondary)] transition hover:border-[var(--accent)]/40"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--accent)] px-5 py-3 font-semibold text-[#1a1208] transition hover:bg-[var(--accent-light)] disabled:opacity-60"
            >
              {saving ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
      {children}
    </label>
  )
}
