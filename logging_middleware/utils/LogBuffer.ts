import { LogEntry } from '../types';

export class LogBuffer {
  private buffer: LogEntry[] = [];
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = Math.max(1, maxSize);
  }

  add(entry: LogEntry): void {
    this.buffer.push(entry);
    
    // Auto-flush if buffer exceeds max size
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift(); // Remove oldest entry
    }
  }

  flush(): LogEntry[] {
    const entries = [...this.buffer];
    this.buffer = [];
    return entries;
  }

  peek(): LogEntry[] {
    return [...this.buffer];
  }

  clear(): void {
    this.buffer = [];
  }

  size(): number {
    return this.buffer.length;
  }

  isFull(): boolean {
    return this.buffer.length >= this.maxSize;
  }

  isEmpty(): boolean {
    return this.buffer.length === 0;
  }

  getOldest(): LogEntry | null {
    return this.buffer.length > 0 ? this.buffer[0] : null;
  }

  getNewest(): LogEntry | null {
    return this.buffer.length > 0 ? this.buffer[this.buffer.length - 1] : null;
  }

  removeOldest(): LogEntry | null {
    return this.buffer.shift() || null;
  }

  setMaxSize(maxSize: number): void {
    this.maxSize = Math.max(1, maxSize);
    
    // Trim buffer if it exceeds new max size
    while (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }

  getMaxSize(): number {
    return this.maxSize;
  }
}