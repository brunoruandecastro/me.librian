import type { ApiBookStatus } from '@/services/bookService'

export type { ApiBookStatus }

export const BOOK_STATUS_OPTIONS: Array<{ value: ApiBookStatus; label: string }> = [
  { value: 'OWNED', label: 'Na estante' },
  { value: 'READING', label: 'Lendo' },
  { value: 'PAUSED_READING', label: 'Pausado' },
  { value: 'READ', label: 'Lido' },
  { value: 'WISHLIST', label: 'Desejos' },
  { value: 'DONATING', label: 'Doando' },
  { value: 'SELLING', label: 'À venda' },
]

export function statusLabel(status: string): string {
  return BOOK_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}

/** Cores de lombada derivadas do título — tom acolhedor alinhado ao Librian */
export function spineColor(seed: string): string {
  const palette = ['#b8895a', '#c49a6c', '#9a7b5a', '#8b6f4e', '#d4a574', '#a67c52', '#7d6548']
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return palette[Math.abs(hash) % palette.length]
}
