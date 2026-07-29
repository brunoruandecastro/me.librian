"use client"

import Layout from "@/components/Layout"
import BookSuggestionSearch from "@/components/BookSuggestionSearch"
import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft,
  BrandIcon,
  ReadIcon,
  ReadingIcon,
  UnreadIcon,
  WishlistIcon,
  RatingIcon,
  UploadIcon,
  SearchIcon,
  ImageIcon,
  NotesIcon,
  AddBookIcon,
} from "@/lib/icons"
import { bookService, mapUiStatusToApi, type BookSuggestion } from "@/services/bookService"

const DESCRIPTION_MAX = 1000
const TITLE_MAX = 150
const AUTHOR_MAX = 120
const PUBLISHER_MAX = 120
const GENRE_MAX = 120
const LANGUAGE_MAX = 80

const EMPTY_FORM = {
  title: "",
  author: "",
  isbn: "",
  publisher: "",
  year: "",
  pages: "",
  description: "",
  status: "unread",
  rating: 0,
  coverUrl: "",
  notes: "",
  genre: "",
  language: "",
}

function clip(value: string, max: number) {
  const trimmed = value.trim()
  if (!trimmed) return ""
  return trimmed.length > max ? trimmed.slice(0, max).trim() : trimmed
}

function normalizeIsbn(value: string) {
  return value.replace(/[\s-]/g, "").toUpperCase()
}

function applySuggestionToForm(suggestion: BookSuggestion) {
  const description = suggestion.description?.trim() || ""
  return {
    title: clip(suggestion.title || "", TITLE_MAX),
    author: clip(suggestion.author || "", AUTHOR_MAX),
    isbn: normalizeIsbn(suggestion.isbn || suggestion.isbn13 || suggestion.isbn10 || ""),
    publisher: clip(suggestion.publisher || "", PUBLISHER_MAX),
    year: suggestion.year != null ? String(suggestion.year) : "",
    pages: suggestion.pages != null && suggestion.pages >= 1 ? String(suggestion.pages) : "",
    description: clip(description, DESCRIPTION_MAX),
    coverUrl: suggestion.coverUrl || "",
    genre: clip(suggestion.genre || "", GENRE_MAX),
    language: clip(suggestion.language || "", LANGUAGE_MAX),
  }
}

export default function AddBookPage() {
  const [formData, setFormData] = useState({ ...EMPTY_FORM })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [suggestionApplied, setSuggestionApplied] = useState(false)
  const [searchResetKey, setSearchResetKey] = useState(0)

  const handleSuggestionSelect = (suggestion: BookSuggestion) => {
    const filled = applySuggestionToForm(suggestion)
    setFormData((prev) => ({
      ...prev,
      ...filled,
    }))
    setSuggestionApplied(true)
    setSuccessMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    setSuccessMessage(null)

    const savedTitle = clip(formData.title, TITLE_MAX)

    try {
      await bookService.createBook({
        title: savedTitle,
        author: clip(formData.author, AUTHOR_MAX),
        isbn: formData.isbn ? normalizeIsbn(formData.isbn) || undefined : undefined,
        publisher: formData.publisher ? clip(formData.publisher, PUBLISHER_MAX) || undefined : undefined,
        year: formData.year ? Number(formData.year) : undefined,
        description: formData.description ? clip(formData.description, DESCRIPTION_MAX) || undefined : undefined,
        coverUrl: formData.coverUrl || undefined,
        status: mapUiStatusToApi(formData.status),
        rating: formData.rating > 0 ? formData.rating : undefined,
        pages: formData.pages ? Number(formData.pages) : undefined,
        notes: formData.notes || undefined,
        genre: formData.genre ? clip(formData.genre, GENRE_MAX) || undefined : undefined,
        language: formData.language ? clip(formData.language, LANGUAGE_MAX) || undefined : undefined,
      })

      setFormData({ ...EMPTY_FORM })
      setActiveStep(1)
      setSuggestionApplied(false)
      setSearchResetKey((k) => k + 1)
      setSuccessMessage(`“${savedTitle}” foi adicionado. Pode cadastrar o próximo.`)
      setIsSubmitting(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao criar livro")
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const steps = [
    { id: 1, title: 'Informações Básicas', icon: BrandIcon },
    { id: 2, title: 'Avaliação', icon: RatingIcon },
    { id: 3, title: 'Capa e Anotações', icon: ImageIcon }
  ]

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-text-secondary hover:text-accent transition-all duration-200 mb-6 group"
          >
            <div className="p-2 bg-surface-secondary rounded-xl group-hover:bg-accent-light/10 transition-all duration-200">
              <ArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            </div>
            <span className="font-medium">Voltar para Minha Estante</span>
          </Link>

          <div className="text-center mb-8">

            <h1 className="text-4xl font-serif font-bold text-text-primary mb-3">Novo Livro</h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Adicione um novo livro à sua estante pessoal e comece sua próxima aventura literária
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = activeStep === step.id
                const isCompleted = activeStep > step.id

                return (
                  <div key={step.id} className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive
                        ? 'bg-gradient-to-r from-accent to-accent-dark text-white shadow-lg'
                        : isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                          : 'bg-surface-secondary text-text-secondary'
                        }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-sm font-medium ${isActive ? 'text-accent' : isCompleted ? 'text-emerald-600' : 'text-text-secondary'
                        }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-surface-secondary'
                        }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Basic Information */}
          <div className={`bg-card border-ultra-subtle rounded-3xl p-8 ${activeStep === 1 ? 'block' : 'hidden'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl border border-violet-200">
                <BrandIcon className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-text-primary">Informações Básicas</h2>
                <p className="text-text-secondary">Detalhes principais do livro</p>
              </div>
            </div>

            <BookSuggestionSearch key={searchResetKey} onSelect={handleSuggestionSelect} />

            {successMessage && (
              <div className="mb-6 px-4 py-3 rounded-xl border border-emerald-800/40 bg-emerald-900/20 text-sm text-emerald-300">
                {successMessage}
              </div>
            )}

            {suggestionApplied && (
              <div className="mb-6 px-4 py-3 rounded-xl border border-emerald-800/40 bg-emerald-900/20 text-sm text-emerald-300">
                Metadados preenchidos a partir do catálogo. Revise e ajuste o que precisar.
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-text-primary">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
                  placeholder="Digite o título do livro"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-text-primary">Autor *</label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
                  placeholder="Digite o nome do autor"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-text-primary">ISBN</label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => handleInputChange('isbn', e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
                  placeholder="978-0-000-00000-0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-text-primary">Editora</label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => handleInputChange('publisher', e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
                  placeholder="Nome da editora"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-text-primary">Ano de Publicação</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
                  placeholder="2024"
                  min="1000"
                  max="2030"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-text-primary">Número de Páginas</label>
                <input
                  type="number"
                  value={formData.pages}
                  onChange={(e) => handleInputChange('pages', e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
                  placeholder="300"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-text-primary">Gênero</label>
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
                  placeholder="Ficção, biografia…"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-text-primary">Idioma</label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
                  placeholder="pt, en…"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold mb-3 text-text-primary">Sinopse</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                maxLength={DESCRIPTION_MAX}
                className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 resize-none"
                placeholder="Breve descrição do livro..."
              />
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                disabled={!formData.title || !formData.author}
                className="px-8 py-3 bg-gradient-to-r from-accent to-accent-dark text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>
          {/* Step 2: Status and Rating */}
          <div className={`bg-card border-ultra-subtle rounded-3xl p-8 ${activeStep === 2 ? 'block' : 'hidden'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-slate-800/40 to-slate-800/60 rounded-xl border border-slate-700 shadow-sm">
                <RatingIcon className="w-6 h-6 text-amber-400 fill-current drop-shadow-sm" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-text-primary">Status e Avaliação</h2>
                <p className="text-text-secondary">Como você se relaciona com este livro</p>
              </div>
            </div>

            <div className={`grid gap-8 ${formData.status === 'read' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
              <div>
                <label className="block text-sm font-semibold mb-4 text-text-primary">Status de Leitura</label>
                <div className="space-y-2">
                  {[
                    { value: 'unread', label: 'Não lido', icon: UnreadIcon, color: 'text-slate-400', bgColor: 'bg-slate-800/50', borderColor: 'border-slate-700', hoverBg: 'hover:bg-slate-800/70' },
                    { value: 'reading', label: 'Lendo agora', icon: ReadingIcon, color: 'text-blue-400', bgColor: 'bg-blue-900/30', borderColor: 'border-blue-800', hoverBg: 'hover:bg-blue-900/50' },
                    { value: 'read', label: 'Lido', icon: ReadIcon, color: 'text-emerald-400', bgColor: 'bg-emerald-900/30', borderColor: 'border-emerald-800', hoverBg: 'hover:bg-emerald-900/50' },
                    { value: 'wishlist', label: 'Lista de desejos', icon: WishlistIcon, color: 'text-purple-400', bgColor: 'bg-purple-900/30', borderColor: 'border-purple-800', hoverBg: 'hover:bg-purple-900/50' }
                  ].map((status) => {
                    const Icon = status.icon
                    const isSelected = formData.status === status.value
                    return (
                      <label key={status.value} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? `${status.bgColor} ${status.borderColor} shadow-sm`
                          : `bg-slate-800/20 border-slate-700 ${status.hoverBg} hover:border-slate-600`
                        }`}>
                        <input
                          type="radio"
                          name="status"
                          value={status.value}
                          checked={isSelected}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`p-1.5 rounded-md transition-all duration-200 ${
                          isSelected 
                            ? `${status.bgColor} ${status.borderColor} border` 
                            : `bg-slate-800/30 border border-slate-700`
                        }`}>
                          <Icon className={`w-4 h-4 transition-colors duration-200 ${
                            isSelected ? status.color : 'text-slate-500'
                          }`} />
                        </div>
                        <span className={`flex-1 font-medium transition-colors duration-200 ${
                          isSelected ? 'text-slate-200' : 'text-slate-400'
                        }`}>{status.label}</span>
                        {isSelected && (
                          <div className={`w-3 h-3 ${status.bgColor} rounded-full flex items-center justify-center border ${status.borderColor}`}>
                            <div className={`w-1 h-1 ${status.color.replace('text-', 'bg-')} rounded-full`}></div>
                          </div>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Avaliação - só aparece quando status é 'read' */}
              {formData.status === 'read' && (
                <div>
                  <label className="block text-sm font-semibold mb-4 text-text-primary">Avaliação</label>
                  <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleInputChange('rating', star)}
                          className="p-2 hover:scale-110 transition-all duration-200 rounded-lg hover:bg-slate-700/50"
                        >
                          <RatingIcon
                            className={`w-6 h-6 transition-all duration-200 ${
                              star <= formData.rating
                                ? 'text-amber-400 fill-current drop-shadow-sm'
                                : 'text-slate-500 hover:text-amber-500'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-300">
                        {formData.rating > 0 ? (
                          <span className="flex items-center justify-center gap-2">
                            <RatingIcon className="w-4 h-4 text-amber-400 fill-current" />
                            {formData.rating}/5 estrelas
                          </span>
                        ) : (
                          'Clique nas estrelas para avaliar'
                        )}
                      </p>
                      {formData.rating > 0 && (
                        <p className="text-xs text-slate-400 mt-1">
                          {
                            formData.rating === 1 ? 'Não gostei' :
                            formData.rating === 2 ? 'Não foi para mim' :
                            formData.rating === 3 ? 'Gostei' :
                            formData.rating === 4 ? 'Gostei muito' :
                            'Uma obra-prima!'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-8 py-3 border border-border-subtle text-text-secondary rounded-2xl hover:bg-surface-secondary transition-all duration-200 font-semibold"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-8 py-3 bg-gradient-to-r from-accent to-accent-dark text-white rounded-2xl hover:shadow-lg transition-all duration-200 font-semibold"
              >
                Próximo
              </button>
            </div>
          </div>

          {/* Step 3: Cover and Notes */}
          <div className={`bg-card border-ultra-subtle rounded-3xl p-8 ${activeStep === 3 ? 'block' : 'hidden'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-text-primary">Capa e Anotações</h2>
                <p className="text-text-secondary">Personalize sua experiência</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-4 text-text-primary">Capa do Livro</label>
                
                {/* Preview da capa */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Área de preview */}
                  <div className="flex-shrink-0">
                    <div className="w-48 h-64 bg-slate-800/20 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center p-4 transition-all duration-200 hover:border-slate-500 hover:bg-slate-800/30">
                      {formData.coverUrl ? (
                        <div className="relative w-full h-full">
                          <img
                            src={formData.coverUrl}
                            alt="Pré-visualização da capa"
                            className="w-full h-full object-cover rounded-lg shadow-md"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              if (e.currentTarget.nextElementSibling) {
(e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                          <div className="hidden w-full h-full flex-col items-center justify-center text-slate-400">
                            <ImageIcon className="w-12 h-12 mb-2" />
                            <span className="text-sm text-center">Erro ao carregar imagem</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleInputChange('coverUrl', '')}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            title="Remover capa"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 text-center">
                          <ImageIcon className="w-12 h-12 mb-3" />
                          <span className="text-sm font-medium mb-1">Nenhuma capa selecionada</span>
                          <span className="text-xs text-slate-500">Cole uma URL de capa no campo abaixo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Opções de capa */}
                  <div className="flex-1 space-y-4">
                    <div className="p-4 bg-slate-800/20 border border-slate-700 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-900/30 rounded-lg">
                          <SearchIcon className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-200">URL da capa</h4>
                          <p className="text-xs text-slate-400">Use um link direto para a imagem da capa</p>
                        </div>
                      </div>
                      <input
                        type="url"
                        value={formData.coverUrl}
                        onChange={(e) => handleInputChange('coverUrl', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-slate-800/30 border border-slate-600 rounded-lg text-sm text-slate-200"
                      />
                    </div>

                    {/* Upload manual (placeholder para futura implementação) */}
                    <div className="p-4 bg-slate-800/20 border border-slate-700 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-900/30 rounded-lg">
                          <UploadIcon className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-200">Upload personalizado</h4>
                          <p className="text-xs text-slate-400">Envie sua própria imagem da capa</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled
                        className="w-full p-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <UploadIcon className="w-5 h-5" />
                          <span className="text-sm">Clique para fazer upload</span>
                          <span className="text-xs text-slate-500">JPG, PNG até 2MB (Em breve)</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-4 text-text-primary">Minhas Anotações</label>
                <div className="p-4 bg-slate-800/20 border border-slate-700 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-900/30 rounded-lg">
                      <NotesIcon className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">Anotações Pessoais</h4>
                      <p className="text-xs text-slate-400">Suas reflexões, citações favoritas ou até um resumo...</p>
                    </div>
                  </div>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-800/30 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 resize-none text-sm text-slate-200 placeholder:text-slate-500"
                    placeholder="'Mudou minha perspectiva sobre...', 'Personagem principal me lembrou de...', 'Frases marcantes: ...', "
                  />
                </div>
              </div>
            </div>

            {submitError && (
              <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">
                {submitError}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-8 py-3 border border-border-subtle text-text-secondary rounded-2xl hover:bg-surface-secondary transition-all duration-200 font-semibold"
              >
                Anterior
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.author}
                className="group relative px-8 py-3 bg-gradient-to-r from-accent to-accent-dark text-white rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2 transform active:scale-95 overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">{isSubmitting ? 'Adicionando...' : 'Adicionar Livro'}</span>
                {!isSubmitting && <AddBookIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300 relative z-10" />}
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10"></div>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}