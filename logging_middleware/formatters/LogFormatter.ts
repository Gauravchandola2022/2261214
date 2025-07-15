import { LogEntry } from '../types';

export class LogFormatter {
  format(entries: LogEntry[], format: 'json' | 'csv'): string {
    switch (format) {
      case 'csv':
        return this.formatCSV(entries);
      case 'json':
      default:
        return this.formatJSON(entries);
    }
  }

  private formatJSON(entries: LogEntry[]): string {
    const serializable = entries.map(entry => ({
      ...entry,
      timestamp: entry.timestamp.toISOString(),
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : undefined
    }));

    return JSON.stringify(serializable, null, 2);
  }

  private formatCSV(entries: LogEntry[]): string {
    if (entries.length === 0) return '';

    const headers = [
      'id',
      'timestamp',
      'level',
      'message',
      'component',
      'userId',
      'sessionId',
      'url',
      'userAgent',
      'metadata'
    ];

    const csvRows = [headers.join(',')];

    entries.forEach(entry => {
      const row = [
        this.escapeCsvValue(entry.id),
        this.escapeCsvValue(entry.timestamp.toISOString()),
        this.escapeCsvValue(entry.level),
        this.escapeCsvValue(entry.message),
        this.escapeCsvValue(entry.component || ''),
        this.escapeCsvValue(entry.userId || ''),
        this.escapeCsvValue(entry.sessionId || ''),
        this.escapeCsvValue(entry.url || ''),
        this.escapeCsvValue(entry.userAgent || ''),
        this.escapeCsvValue(entry.metadata ? JSON.stringify(entry.metadata) : '')
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  formatSingleEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const component = entry.component ? ` [${entry.component}]` : '';
    const metadata = entry.metadata ? ` | ${JSON.stringify(entry.metadata)}` : '';
    
    return `[${timestamp}] ${entry.level}${component}: ${entry.message}${metadata}`;
  }

  formatForDisplay(entry: LogEntry): {
    timestamp: string;
    level: string;
    component: string;
    message: string;
    metadata: string;
  } {
    return {
      timestamp: entry.timestamp.toLocaleString(),
      level: entry.level,
      component: entry.component || '-',
      message: entry.message,
      metadata: entry.metadata ? JSON.stringify(entry.metadata, null, 2) : '-'
    };
  }

  formatMetadata(metadata: Record<string, any> | undefined): string {
    if (!metadata || Object.keys(metadata).length === 0) {
      return '';
    }

    try {
      return JSON.stringify(metadata, null, 2);
    } catch {
      return String(metadata);
    }
  }

  formatStackTrace(stack: string | undefined): string[] {
    if (!stack) return [];
    
    return stack
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());
  }
}