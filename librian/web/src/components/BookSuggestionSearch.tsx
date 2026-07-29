"use client"

import { useEffect, useId, useRef, useState } from "react"
import { SearchIcon, ImageIcon } from "@/lib/icons"
import { bookService, type BookSuggestion } from "@/services/bookService"

type BookSuggestionSearchProps = {
  onSelect: (suggestion: BookSuggestion) => void
}

const DEBOUNCE_MS = 350
const MIN_QUERY_LENGTH = 3

export default function BookSuggestionSearch({ onSelect }: BookSuggestionSearchProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([])
      setOpen(false)
      setLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const results = await bookService.getSmartSuggestions(trimmed, controller.signal)
        setSuggestions(results)
        setOpen(true)
        setActiveIndex(-1)
      } catch (err) {
        if (controller.signal.aborted) return
        setSuggestions([])
        setOpen(false)
        setError(err instanceof Error ? err.message : "Falha ao buscar catálogo")
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }, DEBOUNCE_MS)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  const applySuggestion = async (suggestion: BookSuggestion) => {
    setOpen(false)
    setSuggestions([])
    setActiveIndex(-1)
    setQuery(suggestion.title || "")

    if (!suggestion.volumeId) {
      onSelect(suggestion)
      return
    }

    setLoading(true)
    try {
      const detailed = await bookService.getSuggestionDetails(suggestion.volumeId)
      onSelect(detailed)
    } catch {
      onSelect(suggestion)
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % suggestions.length)
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
      return
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault()
      applySuggestion(suggestions[activeIndex])
      return
    }
    if (event.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative mb-8">
      <label htmlFor={`${listId}-input`} className="block text-sm font-semibold mb-3 text-text-primary">
        Buscar no catálogo
      </label>
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
        <input
          id={`${listId}-input`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true)
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder="Título, autor ou ISBN…"
          className="w-full pl-11 pr-12 py-3 bg-surface border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        )}
      </div>
      <p className="mt-2 text-xs text-text-secondary">
        Selecione uma sugestão para pré-preencher o formulário. Você pode editar tudo depois.
      </p>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 w-full max-h-80 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
        >
          {suggestions.map((suggestion, index) => {
            const active = index === activeIndex
            return (
              <li key={suggestion.volumeId || `${suggestion.title}-${index}`} role="option" aria-selected={active}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => applySuggestion(suggestion)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                    active ? "bg-[var(--hover)]" : "hover:bg-[var(--hover)]"
                  }`}
                >
                  <div className="w-10 h-14 shrink-0 rounded-md overflow-hidden bg-surface-secondary border border-border-subtle flex items-center justify-center">
                    {suggestion.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={suggestion.coverUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-text-secondary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-primary truncate">{suggestion.title}</p>
                    <p className="text-sm text-text-secondary truncate">
                      {suggestion.author || "Autor desconhecido"}
                      {suggestion.year ? ` · ${suggestion.year}` : ""}
                    </p>
                    {suggestion.isbn && (
                      <p className="text-xs text-text-secondary/80 mt-0.5 truncate">ISBN {suggestion.isbn}</p>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {open && !loading && query.trim().length >= MIN_QUERY_LENGTH && suggestions.length === 0 && !error && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-text-secondary shadow-xl">
          Nenhum resultado no catálogo para “{query.trim()}”.
        </div>
      )}
    </div>
  )
}
