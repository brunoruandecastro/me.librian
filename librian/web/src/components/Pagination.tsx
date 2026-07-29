"use client"

import { ChevronLeft, ChevronRight } from '@/lib/icons'

type Props = {
  page: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
  className?: string
}

export default function Pagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
  className = '',
}: Props) {
  if (totalPages <= 1) {
    return totalElements > 0 ? (
      <p className={`text-center text-sm text-[var(--text-muted)] ${className}`}>
        {totalElements} item(ns)
      </p>
    ) : null
  }

  const pages = visiblePages(page, totalPages)

  return (
    <nav
      className={`flex flex-col items-center gap-3 sm:flex-row sm:justify-between ${className}`}
      aria-label="Paginação"
    >
      <p className="text-sm text-[var(--text-muted)]">
        Página <span className="text-[var(--text-primary)]">{page + 1}</span> de{' '}
        <span className="text-[var(--text-primary)]">{totalPages}</span>
        <span className="mx-2 text-[var(--border)]">·</span>
        {totalElements} no total
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((item, index) =>
          item === '…' ? (
            <span key={`ellipsis-${index}`} className="px-1 text-[var(--text-muted)]">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                item === page
                  ? 'bg-[var(--accent)] text-[#1a1208]'
                  : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent-light)]'
              }`}
              aria-current={item === page ? 'page' : undefined}
            >
              {item + 1}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}

function visiblePages(current: number, total: number): Array<number | '…'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i)
  }

  const items: Array<number | '…'> = [0]
  const start = Math.max(1, current - 1)
  const end = Math.min(total - 2, current + 1)

  if (start > 1) items.push('…')
  for (let i = start; i <= end; i++) items.push(i)
  if (end < total - 2) items.push('…')
  items.push(total - 1)
  return items
}
