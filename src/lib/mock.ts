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

export const WELCOME_MESSAGES = [
  "Welcome back, Quang",
  "Ready for another chapter?",
  "The library awaits.",
  "Continue your journey.",
  "Your books wait.",
  "Time to read."
];
