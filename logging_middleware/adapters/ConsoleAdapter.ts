import { LogEntry, LogLevel } from '../types';

export class ConsoleAdapter {
  private readonly colors = {
    [LogLevel.DEBUG]: '#6B7280', // Gray
    [LogLevel.INFO]: '#3B82F6',  // Blue
    [LogLevel.WARN]: '#F59E0B',  // Amber
    [LogLevel.ERROR]: '#EF4444', // Red
    [LogLevel.FATAL]: '#DC2626'  // Dark Red
  };

  private readonly icons = {
    [LogLevel.DEBUG]: '🔍',
    [LogLevel.INFO]: 'ℹ️',
    [LogLevel.WARN]: '⚠️',
    [LogLevel.ERROR]: '❌',
    [LogLevel.FATAL]: '💀'
  };

  log(entry: LogEntry): void {
    const color = this.colors[entry.level];
    const icon = this.icons[entry.level];
    const timestamp = entry.timestamp.toISOString();
    
    const baseMessage = `${icon} [${timestamp}] ${entry.level}${entry.component ? ` [${entry.component}]` : ''}: ${entry.message}`;

    // Choose appropriate console method
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(
          `%c${baseMessage}`,
          `color: ${color}`,
          entry.metadata || {}
        );
        break;
      case LogLevel.INFO:
        console.info(
          `%c${baseMessage}`,
          `color: ${color}`,
          entry.metadata || {}
        );
        break;
      case LogLevel.WARN:
        console.warn(
          `%c${baseMessage}`,
          `color: ${color}`,
          entry.metadata || {}
        );
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(
          `%c${baseMessage}`,
          `color: ${color}`,
          entry.metadata || {}
        );
        if (entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
        break;
      default:
        console.log(
          `%c${baseMessage}`,
          `color: ${color}`,
          entry.metadata || {}
        );
    }

    // Log additional context if available
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      console.groupCollapsed(`%cMetadata for: ${entry.message}`, `color: ${color}`);
      console.table(entry.metadata);
      console.groupEnd();
    }
  }

  logBatch(entries: LogEntry[]): void {
    if (entries.length === 0) return;

    console.group(`📦 Batch Log (${entries.length} entries)`);
    entries.forEach(entry => this.log(entry));
    console.groupEnd();
  }

  logPerformance(label: string, startTime: number, endTime: number): void {
    const duration = endTime - startTime;
    const color = duration > 1000 ? this.colors[LogLevel.WARN] : this.colors[LogLevel.INFO];
    
    console.log(
      `%c⏱️ Performance [${label}]: ${duration.toFixed(2)}ms`,
      `color: ${color}; font-weight: bold`
    );
  }

  group(label: string, level: LogLevel = LogLevel.INFO): void {
    const color = this.colors[level];
    const icon = this.icons[level];
    console.group(`%c${icon} ${label}`, `color: ${color}; font-weight: bold`);
  }

  groupEnd(): void {
    console.groupEnd();
  }
}