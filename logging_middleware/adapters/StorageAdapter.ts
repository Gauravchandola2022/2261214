import { LogEntry } from '../types';

export class StorageAdapter {
  private readonly storageKey = 'logging_middleware_entries';
  private maxEntries: number;

  constructor(maxEntries: number = 1000) {
    this.maxEntries = maxEntries;
  }

  store(entry: LogEntry): void {
    try {
      const existingLogs = this.retrieve();
      existingLogs.push(entry);

      // Maintain max entries limit
      if (existingLogs.length > this.maxEntries) {
        existingLogs.splice(0, existingLogs.length - this.maxEntries);
      }

      const serialized = JSON.stringify(existingLogs.map(log => ({
        ...log,
        timestamp: log.timestamp.toISOString()
      })));

      localStorage.setItem(this.storageKey, serialized);
    } catch (error) {
      // Handle storage quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearOldEntries();
        this.store(entry); // Retry
      } else {
        console.error('Failed to store log entry:', error);
      }
    }
  }

  retrieve(): LogEntry[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return parsed.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    } catch (error) {
      console.error('Failed to retrieve log entries:', error);
      return [];
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear log entries:', error);
    }
  }

  private clearOldEntries(): void {
    const logs = this.retrieve();
    const reducedLogs = logs.slice(-Math.floor(this.maxEntries / 2));
    
    try {
      const serialized = JSON.stringify(reducedLogs.map(log => ({
        ...log,
        timestamp: log.timestamp.toISOString()
      })));
      localStorage.setItem(this.storageKey, serialized);
    } catch (error) {
      // If still failing, clear all logs
      this.clear();
    }
  }

  getStorageSize(): number {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? stored.length : 0;
    } catch {
      return 0;
    }
  }

  getEntryCount(): number {
    return this.retrieve().length;
  }
}