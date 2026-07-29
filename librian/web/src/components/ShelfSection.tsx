import { ReadingIcon, ReadIcon, UnreadIcon, WishlistIcon, ShelfIcon } from "@/lib/icons"
import BookCard from "./BookCard"

type Book = {
  id: string
  title: string
  author: string
  coverUrl?: string
  status: 'read' | 'reading' | 'unread' | 'wishlist'
  rating?: number
  pages?: number
  year?: number
  publisher?: string
  isbn?: string
}

type ShelfSectionProps = {
  title: string
  books: Book[]
  type: 'reading' | 'read' | 'unread' | 'wishlist' | 'all'
  view: 'grid' | 'list'
}

const sectionConfig = {
  reading: {
    icon: ReadingIcon,
    color: 'text-info',
    bgColor: 'bg-info-light',
    borderColor: 'border-info/20',
    description: 'Livros que você está lendo atualmente'
  },
  read: {
    icon: ReadIcon,
    color: 'text-success',
    bgColor: 'bg-success-light',
    borderColor: 'border-success/20',
    description: 'Livros que você já leu'
  },
  unread: {
    icon: UnreadIcon,
    color: 'text-text-secondary',
    bgColor: 'bg-surface-secondary',
    borderColor: 'border-border-subtle',
    description: 'Livros na sua estante para ler'
  },
  wishlist: {
    icon: WishlistIcon,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Livros que você deseja ler'
  },
  all: {
    icon: ShelfIcon,
    color: 'text-accent',
    bgColor: 'bg-accent-light/10',
    borderColor: 'border-accent/20',
    description: 'Todos os livros da sua biblioteca'
  }
}

export default function ShelfSection({ title, books, type, view }: ShelfSectionProps) {
  if (books.length === 0) return null

  const config = sectionConfig[type]
  const Icon = config.icon

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2.5 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary">{config.description}</p>
        </div>
      </div>

      <div className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'grid-cols-1 gap-3'}`}>
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  )
}
