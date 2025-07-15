import { LogLevel, LogEntry, LoggerConfig, LogFilter, LoggerMiddleware } from '../types';
import { StorageAdapter } from '../adapters/StorageAdapter';
import { ConsoleAdapter } from '../adapters/ConsoleAdapter';
import { RemoteAdapter } from '../adapters/RemoteAdapter';
import { LogFormatter } from '../formatters/LogFormatter';
import { LogBuffer } from '../utils/LogBuffer';
import { SessionManager } from '../utils/SessionManager';

export class Logger implements LoggerMiddleware {
  private config: LoggerConfig;
  private storageAdapter: StorageAdapter;
  private consoleAdapter: ConsoleAdapter;
  private remoteAdapter: RemoteAdapter;
  private formatter: LogFormatter;
  private buffer: LogBuffer;
  private sessionManager: SessionManager;
  private flushTimer?: NodeJS.Timeout;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableStorage: true,
      enableRemote: false,
      maxStorageEntries: 1000,
      bufferSize: 50,
      flushInterval: 5000,
      ...config
    };

    this.storageAdapter = new StorageAdapter(this.config.maxStorageEntries);
    this.consoleAdapter = new ConsoleAdapter();
    this.remoteAdapter = new RemoteAdapter(this.config.remoteEndpoint);
    this.formatter = new LogFormatter();
    this.buffer = new LogBuffer(this.config.bufferSize);
    this.sessionManager = new SessionManager();

    this.config.sessionId = this.sessionManager.getSessionId();
    this.initializeAutoFlush();
    this.setupErrorHandlers();
  }

  private initializeAutoFlush(): void {
    if (this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.config.flushInterval);
    }
  }

  private setupErrorHandlers(): void {
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.error('Unhandled JavaScript error', 'GlobalErrorHandler', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', 'GlobalErrorHandler', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    component?: string,
    metadata?: Record<string, any>
  ): LogEntry {
    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message,
      component,
      sessionId: this.config.sessionId,
      userId: this.config.userId,
      metadata,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Add stack trace for errors
    if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
      entry.stack = new Error().stack;
    }

    return entry;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async processLogEntry(entry: LogEntry): Promise<void> {
    // Add to buffer
    this.buffer.add(entry);

    // Console logging
    if (this.config.enableConsole) {
      this.consoleAdapter.log(entry);
    }

    // Storage logging
    if (this.config.enableStorage) {
      this.storageAdapter.store(entry);
    }

    // Remote logging (buffered)
    if (this.config.enableRemote && this.buffer.isFull()) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.config.enableRemote && this.buffer.size() > 0) {
      const entries = this.buffer.flush();
      try {
        await this.remoteAdapter.sendBatch(entries);
      } catch (error) {
        // Re-add entries to buffer if remote logging fails
        entries.forEach(entry => this.buffer.add(entry));
        console.warn('Failed to send logs to remote endpoint:', error);
      }
    }
  }

  public log(
    level: LogLevel,
    message: string,
    component?: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createLogEntry(level, message, component, metadata);
    this.processLogEntry(entry).catch(error => {
      console.error('Failed to process log entry:', error);
    });
  }

  public debug(message: string, component?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, component, metadata);
  }

  public info(message: string, component?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, component, metadata);
  }

  public warn(message: string, component?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, component, metadata);
  }

  public error(message: string, component?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, component, metadata);
  }

  public fatal(message: string, component?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, component, metadata);
  }

  public getLogs(filter?: LogFilter): LogEntry[] {
    let logs = this.storageAdapter.retrieve();

    if (filter) {
      logs = logs.filter(log => {
        if (filter.level && log.level !== filter.level) return false;
        if (filter.component && log.component !== filter.component) return false;
        if (filter.startDate && log.timestamp < filter.startDate) return false;
        if (filter.endDate && log.timestamp > filter.endDate) return false;
        if (filter.searchTerm) {
          const searchLower = filter.searchTerm.toLowerCase();
          return log.message.toLowerCase().includes(searchLower) ||
                 log.component?.toLowerCase().includes(searchLower);
        }
        return true;
      });
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public clearLogs(): void {
    this.storageAdapter.clear();
    this.buffer.clear();
  }

  public exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getLogs();
    return this.formatter.format(logs, format);
  }

  public setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update adapters if needed
    if (config.maxStorageEntries) {
      this.storageAdapter = new StorageAdapter(config.maxStorageEntries);
    }
    
    if (config.remoteEndpoint) {
      this.remoteAdapter = new RemoteAdapter(config.remoteEndpoint);
    }

    // Restart flush timer if interval changed
    if (config.flushInterval !== undefined) {
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
      }
      this.initializeAutoFlush();
    }
  }

  public getConfig(): LoggerConfig {
    return { ...this.config };
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush().catch(console.error);
  }
}