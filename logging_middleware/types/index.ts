export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  component?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  stack?: string;
  url?: string;
  userAgent?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  maxStorageEntries: number;
  remoteEndpoint?: string;
  sessionId?: string;
  userId?: string;
  bufferSize: number;
  flushInterval: number;
}

export interface LogFilter {
  level?: LogLevel;
  component?: string;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

export interface LoggerMiddleware {
  log(level: LogLevel, message: string, component?: string, metadata?: Record<string, any>): void;
  debug(message: string, component?: string, metadata?: Record<string, any>): void;
  info(message: string, component?: string, metadata?: Record<string, any>): void;
  warn(message: string, component?: string, metadata?: Record<string, any>): void;
  error(message: string, component?: string, metadata?: Record<string, any>): void;
  fatal(message: string, component?: string, metadata?: Record<string, any>): void;
  getLogs(filter?: LogFilter): LogEntry[];
  clearLogs(): void;
  exportLogs(format?: 'json' | 'csv'): string;
  setConfig(config: Partial<LoggerConfig>): void;
  getConfig(): LoggerConfig;
}