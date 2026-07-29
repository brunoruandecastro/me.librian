"use client"

import { ShelfIcon } from "@/lib/icons"

type Shelf = {
  id: string
  name: string
  description?: string
  bookCount: number
}

type ShelfGridProps = {
  shelves?: Shelf[]
}

export default function ShelfGrid({ shelves = [] }: ShelfGridProps) {
  if (shelves.length === 0) {
    return (
      <div className="text-center py-12 bg-card border-ultra-subtle rounded-2xl">
        <ShelfIcon className="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary">Nenhuma estante personalizada ainda.</p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {shelves.map((shelf) => (
        <div key={shelf.id} className="bg-card border-ultra-subtle rounded-2xl p-5">
          <h3 className="font-semibold text-text-primary">{shelf.name}</h3>
          {shelf.description && (
            <p className="text-sm text-text-secondary mt-1">{shelf.description}</p>
          )}
          <p className="text-sm text-text-muted mt-3">{shelf.bookCount} livros</p>
        </div>
      ))}
    </div>
  )
}
