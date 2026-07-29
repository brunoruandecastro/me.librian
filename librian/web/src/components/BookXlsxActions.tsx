"use client"

import { useRef, useState } from 'react'
import {
  CloseIcon,
  DownloadIcon,
  ErrorIcon,
  SuccessIcon,
  UploadIcon,
  WarningIcon,
} from '@/lib/icons'
import { bookService, BookImportResult } from '@/services/bookService'

type Props = {
  bookCount?: number
  onImported?: () => void
  className?: string
}

type DialogState = {
  title: string
  message: string
  detail?: string
  tone: 'success' | 'warning' | 'error'
}

export default function BookXlsxActions({ bookCount = 0, onImported, className = '' }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<'export' | 'import' | null>(null)
  const [dialog, setDialog] = useState<DialogState | null>(null)

  const closeDialog = () => setDialog(null)

  const handleExport = async () => {
    if (bookCount <= 0) {
      setDialog({
        tone: 'warning',
        title: 'Nada para exportar',
        message:
          'Você ainda não tem livros cadastrados na biblioteca. Adicione pelo menos um livro antes de exportar a planilha.',
      })
      return
    }

    try {
      setBusy('export')
      await bookService.exportBooksXlsx()
      setDialog({
        tone: 'success',
        title: 'Exportação concluída',
        message: `${bookCount} livro(s) exportado(s) com sucesso.`,
      })
    } catch (err) {
      setDialog({
        tone: 'error',
        title: 'Falha na exportação',
        message: err instanceof Error ? err.message : 'Não foi possível exportar a planilha.',
      })
    } finally {
      setBusy(null)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      setBusy('import')
      const result: BookImportResult = await bookService.importBooksXlsx(file)
      const detail = result.errors.length > 0
        ? result.errors.slice(0, 5).map((e) => `Linha ${e.row}: ${e.message}`).join('\n')
        : undefined

      if (result.imported > 0 && result.failed === 0) {
        setDialog({
          tone: 'success',
          title: 'Importação concluída',
          message: `${result.imported} livro(s) importado(s).`,
        })
      } else if (result.imported > 0) {
        setDialog({
          tone: 'warning',
          title: 'Importação parcial',
          message: `${result.imported} importado(s), ${result.failed} com erro.`,
          detail,
        })
      } else {
        setDialog({
          tone: 'error',
          title: 'Nenhum livro importado',
          message: result.failed > 0
            ? `${result.failed} linha(s) com erro.`
            : 'O arquivo não continha livros válidos para importar.',
          detail,
        })
      }
      onImported?.()
    } catch (err) {
      setDialog({
        tone: 'error',
        title: 'Falha na importação',
        message: err instanceof Error ? err.message : 'Não foi possível importar a planilha.',
      })
    } finally {
      setBusy(null)
    }
  }

  const toneIcon =
    dialog?.tone === 'success' ? (
      <SuccessIcon className="w-7 h-7 text-[var(--success)]" strokeWidth={2} />
    ) : dialog?.tone === 'warning' ? (
      <WarningIcon className="w-7 h-7 text-[var(--accent)]" strokeWidth={2} />
    ) : (
      <ErrorIcon className="w-7 h-7 text-[var(--danger)]" strokeWidth={2} />
    )

  const toneRing =
    dialog?.tone === 'success'
      ? 'bg-[var(--success-light)] ring-[var(--success)]/25'
      : dialog?.tone === 'warning'
        ? 'bg-[var(--warning-light)] ring-[var(--accent)]/25'
        : 'bg-[var(--danger-light)] ring-[var(--danger)]/25'

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={handleExport}
          disabled={busy !== null}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/25 bg-white/10 text-white font-medium hover:bg-white/20 transition disabled:opacity-60"
        >
          <DownloadIcon className="w-5 h-5" />
          {busy === 'export' ? 'Exportando…' : 'Exportar Excel'}
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          disabled={busy !== null}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/25 bg-white/10 text-white font-medium hover:bg-white/20 transition disabled:opacity-60"
        >
          <UploadIcon className="w-5 h-5" />
          {busy === 'import' ? 'Importando…' : 'Importar Excel'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="xlsx-dialog-title"
          onClick={closeDialog}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 pb-6 pt-8 shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeDialog}
              className="absolute right-4 top-4 rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
              aria-label="Fechar"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            <div
              className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ring-4 ${toneRing}`}
              aria-hidden
            >
              {toneIcon}
            </div>

            <h3 id="xlsx-dialog-title" className="text-xl font-semibold text-[var(--text-primary)]">
              {dialog.title}
            </h3>
            <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
              {dialog.message}
            </p>

            {dialog.detail && (
              <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-[var(--surface-input)] p-3 text-left text-xs text-[var(--text-muted)] whitespace-pre-wrap">
                {dialog.detail}
              </pre>
            )}

            <button
              type="button"
              onClick={closeDialog}
              className="mt-6 w-full rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-[#1a1208] hover:bg-[var(--accent-light)] transition"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
