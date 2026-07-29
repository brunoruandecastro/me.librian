export const API_URLS = {
  INTERNAL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  DICEBEAR: 'https://api.dicebear.com/7.x',
  OPEN_LIBRARY: 'https://openlibrary.org/api',
} as const;

export const API_CONFIG = {
  DICEBEAR: {
    INITIALS: {
      style: 'initials',
      backgroundColor: '3b82f6',
      textColor: 'ffffff',
      fontSize: 40,
    },
    AVATAAARS: {
      style: 'avataaars',
      mood: 'happy',
    },
  },
  INTERNAL: {
    TIMEOUT: 5000,
    RETRY_ATTEMPTS: 3,
  },
} as const;

export const buildApiUrl = {
  dicebear: {
    initials: (seed: string) => {
      const config = API_CONFIG.DICEBEAR.INITIALS;
      const params = new URLSearchParams({
        seed: encodeURIComponent(seed),
        backgroundColor: config.backgroundColor,
        textColor: config.textColor,
        fontSize: config.fontSize.toString(),
      });
      return `${API_URLS.DICEBEAR}/${config.style}/svg?${params}`;
    },
    avataaars: (seed: string) => {
      const config = API_CONFIG.DICEBEAR.AVATAAARS;
      const params = new URLSearchParams({
        seed: encodeURIComponent(seed),
        mood: config.mood,
      });
      return `${API_URLS.DICEBEAR}/${config.style}/svg?${params}`;
    },
  },
  internal: {
    books: () => `${API_URLS.INTERNAL}/books`,
    bookSuggestions: () => `${API_URLS.INTERNAL}/book-suggestions`,
    auth: () => `${API_URLS.INTERNAL}/auth`,
    users: () => `${API_URLS.INTERNAL}/users`,
  },
};

export type ApiProvider = keyof typeof API_URLS;
export type DiceBearStyle = 'initials' | 'avataaars';
