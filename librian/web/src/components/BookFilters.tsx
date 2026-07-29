import { FilterIcon, GridIcon, ListIcon, SortIcon } from "@/lib/icons"
import { useState } from "react"

type FilterProps = {
  onFilterChange: (filters: FilterState) => void
  onViewChange: (view: 'grid' | 'list') => void
  view: 'grid' | 'list'
}

export type FilterState = {
  status: string
  rating: string
  sortBy: string
}

export default function BookFilters({ onFilterChange, onViewChange, view }: FilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    rating: 'all',
    sortBy: 'title'
  })

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="bg-card border-ultra-subtle rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent-light/20 rounded-xl border border-accent/20">
              <FilterIcon className="w-4 h-4 text-accent" />
            </div>
            <span className="text-sm font-semibold text-text-primary">Filtros</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 bg-[var(--surface-input)] border border-[var(--border-strong)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-text-primary font-medium"
              >
                <option value="all">Todos os status</option>
                <option value="read">Lidos</option>
                <option value="reading">Lendo</option>
                <option value="unread">Não lidos</option>
                <option value="wishlist">Lista de desejos</option>
              </select>
              <SortIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 bg-[var(--surface-input)] border border-[var(--border-strong)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-text-primary font-medium"
              >
                <option value="all">Qualquer nota</option>
                <option value="5">5 estrelas</option>
                <option value="4">4+</option>
                <option value="3">3+</option>
              </select>
              <SortIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 bg-[var(--surface-input)] border border-[var(--border-strong)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-text-primary font-medium"
              >
                <option value="title">Título</option>
                <option value="author">Autor</option>
                <option value="year">Ano</option>
                <option value="rating">Avaliação</option>
              </select>
              <SortIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[var(--surface-input)] border border-[var(--border-strong)] rounded-xl p-1">
          <button
            type="button"
            onClick={() => onViewChange('grid')}
            className={`p-2.5 rounded-lg transition-all ${view === 'grid' ? 'bg-accent text-[#1a1208]' : 'text-text-secondary hover:text-accent'}`}
            title="Grade"
          >
            <GridIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('list')}
            className={`p-2.5 rounded-lg transition-all ${view === 'list' ? 'bg-accent text-[#1a1208]' : 'text-text-secondary hover:text-accent'}`}
            title="Lista"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
