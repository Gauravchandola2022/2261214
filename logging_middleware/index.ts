// Core exports
export { Logger } from './core/Logger';

// Type exports
export type {
  LogEntry,
  LoggerConfig,
  LogFilter,
  LoggerMiddleware
} from './types';

export { LogLevel } from './types';

// Adapter exports
export { StorageAdapter } from './adapters/StorageAdapter';
export { ConsoleAdapter } from './adapters/ConsoleAdapter';
export { RemoteAdapter } from './adapters/RemoteAdapter';

// Utility exports
export { LogBuffer } from './utils/LogBuffer';
export { SessionManager } from './utils/SessionManager';
export { PerformanceTracker } from './utils/PerformanceTracker';

// Formatter exports
export { LogFormatter } from './formatters/LogFormatter';

// Hook exports
export { useLogger } from './hooks/useLogger';
export { usePerformanceTracking } from './hooks/usePerformanceTracking';

// Component exports
export { default as LogViewer } from './components/LogViewer';

// Create default logger instance
export const defaultLogger = new Logger({
  level: LogLevel.INFO,
  enableConsole: true,
  enableStorage: true,
  enableRemote: false,
  maxStorageEntries: 1000,
  bufferSize: 50,
  flushInterval: 5000
});

// Convenience functions using default logger
export const log = (level: LogLevel, message: string, component?: string, metadata?: Record<string, any>) => {
  defaultLogger.log(level, message, component, metadata);
};

export const debug = (message: string, component?: string, metadata?: Record<string, any>) => {
  defaultLogger.debug(message, component, metadata);
};

export const info = (message: string, component?: string, metadata?: Record<string, any>) => {
  defaultLogger.info(message, component, metadata);
};

export const warn = (message: string, component?: string, metadata?: Record<string, any>) => {
  defaultLogger.warn(message, component, metadata);
};

export const error = (message: string, component?: string, metadata?: Record<string, any>) => {
  defaultLogger.error(message, component, metadata);
};

export const fatal = (message: string, component?: string, metadata?: Record<string, any>) => {
  defaultLogger.fatal(message, component, metadata);
};

export const getLogs = (filter?: LogFilter) => {
  return defaultLogger.getLogs(filter);
};

export const clearLogs = () => {
  defaultLogger.clearLogs();
};

export const exportLogs = (format?: 'json' | 'csv') => {
  return defaultLogger.exportLogs(format);
};

export const setLoggerConfig = (config: Partial<LoggerConfig>) => {
  defaultLogger.setConfig(config);
};

export const getLoggerConfig = () => {
  return defaultLogger.getConfig();
};