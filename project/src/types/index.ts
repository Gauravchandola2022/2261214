export interface ShortenedURL {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: Date;
  expiresAt: Date;
  isExpired: boolean;
  clicks: ClickData[];
}

export interface ClickData {
  id: string;
  timestamp: Date;
  source: string;
  location: string;
  userAgent: string;
}

export interface URLFormData {
  originalUrl: string;
  validityMinutes: number;
  customShortcode?: string;
}

export interface LogLevel {
  INFO: 'INFO';
  WARN: 'WARN';
  ERROR: 'ERROR';
  DEBUG: 'DEBUG';
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: keyof LogLevel;
  message: string;
  component?: string;
  data?: any;
}