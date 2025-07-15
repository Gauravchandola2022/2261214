import { LogEntry } from '../types';

export interface RemoteLogPayload {
  entries: LogEntry[];
  timestamp: string;
  sessionId?: string;
  userId?: string;
  userAgent: string;
  url: string;
}

export class RemoteAdapter {
  private endpoint?: string;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;
  private timeout: number = 5000;

  constructor(endpoint?: string) {
    this.endpoint = endpoint;
  }

  async send(entry: LogEntry): Promise<void> {
    if (!this.endpoint) {
      throw new Error('Remote endpoint not configured');
    }

    return this.sendBatch([entry]);
  }

  async sendBatch(entries: LogEntry[]): Promise<void> {
    if (!this.endpoint || entries.length === 0) {
      return;
    }

    const payload: RemoteLogPayload = {
      entries: entries.map(entry => ({
        ...entry,
        timestamp: entry.timestamp.toISOString()
      })) as LogEntry[],
      timestamp: new Date().toISOString(),
      sessionId: entries[0]?.sessionId,
      userId: entries[0]?.userId,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        await this.makeRequest(payload);
        return; // Success
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  private async makeRequest(payload: RemoteLogPayload): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.endpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Log-Client': 'logging-middleware',
          'X-Log-Version': '1.0.0'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Optionally parse response for server feedback
      const responseData = await response.json().catch(() => ({}));
      
      if (responseData.error) {
        throw new Error(`Server error: ${responseData.error}`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
  }

  setRetryConfig(attempts: number, delay: number): void {
    this.retryAttempts = Math.max(1, attempts);
    this.retryDelay = Math.max(100, delay);
  }

  setTimeout(timeout: number): void {
    this.timeout = Math.max(1000, timeout);
  }

  isConfigured(): boolean {
    return !!this.endpoint;
  }
}