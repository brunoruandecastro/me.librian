import { API_URLS } from '@/config/apis';

const API_BASE_URL = API_URLS.INTERNAL;

export type ApiBookStatus =
  | 'OWNED'
  | 'READING'
  | 'READ'
  | 'DONATING'
  | 'SELLING'
  | 'PAUSED_READING'
  | 'WISHLIST';

export type UiBookStatus = 'read' | 'reading' | 'unread' | 'wishlist';

export interface BookSuggestion {
  volumeId: string;
  title: string;
  subtitle?: string;
  authors?: string[];
  author?: string;
  isbn?: string;
  isbn10?: string;
  isbn13?: string;
  publisher?: string;
  year?: number;
  description?: string;
  coverUrl?: string;
  pages?: number;
  categories?: string[];
  genre?: string;
  language?: string;
  averageRating?: number;
  ratingsCount?: number;
}

export interface CreateBookData {
  title: string;
  author: string;
  publisher?: string;
  year?: number;
  isbn?: string;
  status?: ApiBookStatus;
  description?: string;
  coverUrl?: string;
  rating?: number;
  pages?: number;
  notes?: string;
  genre?: string;
  language?: string;
  readDate?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  year?: number;
  isbn?: string;
  status: ApiBookStatus;
  description?: string;
  coverUrl?: string;
  rating?: number;
  pages?: number;
  notes?: string;
  genre?: string;
  language?: string;
  readDate?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookPage {
  content: Book[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export function mapApiStatusToUi(status: ApiBookStatus | string): UiBookStatus {
  switch (status) {
    case 'READ':
      return 'read';
    case 'READING':
    case 'PAUSED_READING':
      return 'reading';
    case 'WISHLIST':
      return 'wishlist';
    case 'OWNED':
    case 'DONATING':
    case 'SELLING':
    default:
      return 'unread';
  }
}

export function mapUiStatusToApi(status: string): ApiBookStatus {
  switch (status) {
    case 'read':
      return 'READ';
    case 'reading':
      return 'READING';
    case 'wishlist':
      return 'WISHLIST';
    case 'unread':
    default:
      return 'OWNED';
  }
}

class BookService {
  private async getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async parseError(response: Response, fallback: string) {
    try {
      const error = await response.json();
      if (typeof error.message === 'string' && error.message.trim()) {
        return error.message;
      }
      if (Array.isArray(error.errors) && error.errors.length > 0) {
        return error.errors
          .map((item: { defaultMessage?: string; field?: string; message?: string } | string) => {
            if (typeof item === 'string') return item;
            if (item.message) return item.message;
            if (item.field && item.defaultMessage) return `${item.field}: ${item.defaultMessage}`;
            return item.defaultMessage || fallback;
          })
          .join('; ');
      }
      return fallback;
    } catch {
      return fallback;
    }
  }

  async getSmartSuggestions(q: string, signal?: AbortSignal): Promise<BookSuggestion[]> {
    const query = q.trim();
    if (!query) return [];

    const response = await fetch(
      `${API_BASE_URL}/book-suggestions/smart?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: await this.getAuthHeaders(),
        signal,
      },
    );
    if (!response.ok) {
      throw new Error(await this.parseError(response, 'Erro ao buscar sugestões'));
    }
    return response.json();
  }

  async getSuggestionDetails(volumeId: string, signal?: AbortSignal): Promise<BookSuggestion> {
    const response = await fetch(
      `${API_BASE_URL}/book-suggestions/details/${encodeURIComponent(volumeId)}`,
      {
        method: 'GET',
        headers: await this.getAuthHeaders(),
        signal,
      },
    );
    if (!response.ok) {
      throw new Error(await this.parseError(response, 'Erro ao buscar detalhes da sugestão'));
    }
    return response.json();
  }

  async createBook(bookData: CreateBookData): Promise<Book> {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(bookData),
    });
    if (!response.ok) {
      throw new Error(await this.parseError(response, 'Erro ao criar livro'));
    }
    return response.json();
  }

  async updateBook(id: string, bookData: CreateBookData): Promise<Book> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(bookData),
    });
    if (!response.ok) {
      throw new Error(await this.parseError(response, 'Erro ao atualizar livro'));
    }
    return response.json();
  }

  async getBooks(options: {
    page?: number
    size?: number
    status?: ApiBookStatus
    q?: string
  } = {}): Promise<BookPage> {
    const params = new URLSearchParams()
    params.set('page', String(options.page ?? 0))
    params.set('size', String(options.size ?? 12))
    if (options.status) params.set('status', options.status)
    if (options.q?.trim()) params.set('q', options.q.trim())

    const response = await fetch(`${API_BASE_URL}/books?${params.toString()}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(await this.parseError(response, 'Erro ao buscar livros'));
    }
    return response.json();
  }

  /** Lista completa (páginas grandes) — home, drawer, etc. */
  async getAllBooks(): Promise<Book[]> {
    const page = await this.getBooks({ page: 0, size: 50 })
    if (page.totalPages <= 1) return page.content

    const books = [...page.content]
    for (let p = 1; p < page.totalPages; p++) {
      const next = await this.getBooks({ page: p, size: 50 })
      books.push(...next.content)
    }
    return books
  }

  async getBookById(id: string): Promise<Book> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(await this.parseError(response, 'Erro ao buscar livro'));
    }
    return response.json();
  }

  async deleteBook(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(await this.parseError(response, 'Erro ao excluir livro'));
    }
  }

  async duplicateBook(book: Book): Promise<Book> {
    return this.createBook({
      title: `${book.title} (cópia)`,
      author: book.author,
      publisher: book.publisher,
      year: book.year,
      isbn: book.isbn,
      status: book.status,
      description: book.description,
      coverUrl: book.coverUrl,
      rating: book.rating,
      pages: book.pages,
      notes: book.notes,
      genre: book.genre,
      language: book.language,
      readDate: book.readDate,
    });
  }

  toUpdatePayload(book: Book, overrides: Partial<CreateBookData> = {}): CreateBookData {
    return {
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      year: book.year,
      isbn: book.isbn,
      status: book.status,
      description: book.description,
      coverUrl: book.coverUrl,
      rating: book.rating,
      pages: book.pages,
      notes: book.notes,
      genre: book.genre,
      language: book.language,
      readDate: book.readDate,
      ...overrides,
    };
  }

  async exportBooksXlsx(): Promise<void> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const response = await fetch(`${API_BASE_URL}/books/export`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) {
      throw new Error(await this.parseError(response, 'Erro ao exportar planilha'));
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'librian-books.xlsx';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async importBooksXlsx(file: File): Promise<BookImportResult> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/books/import`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(await this.parseError(response, 'Erro ao importar planilha'));
    }
    return response.json();
  }
}

export interface BookImportResult {
  imported: number;
  failed: number;
  books: Book[];
  errors: Array<{ row: number; message: string }>;
}

export const bookService = new BookService();
