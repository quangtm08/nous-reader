export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  progress: number; // 0-100
  timeRemaining: string;
  lastRead: string;
  streak?: number;
}

export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'The Nature of Things',
    author: 'Lucretius',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop', // Placeholder high-quality cover
    progress: 74,
    timeRemaining: '2h 15m',
    lastRead: '2026-01-24',
    streak: 12
  },
  {
    id: '2',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
    progress: 45,
    timeRemaining: '1h 20m',
    lastRead: '2026-01-23'
  },
  {
    id: '3',
    title: 'Beyond Good and Evil',
    author: 'Friedrich Nietzsche',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop',
    progress: 10,
    timeRemaining: '5h 45m',
    lastRead: '2026-01-20'
  }
];

export const WELCOME_MESSAGES = [
  "Welcome back, Quang",
  "Ready for another chapter?",
  "The library awaits.",
  "Continue your journey.",
  "Your books wait.",
  "Time to read."
];
