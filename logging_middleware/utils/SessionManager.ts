export class SessionManager {
  private readonly sessionKey = 'logging_middleware_session';
  private sessionId: string;
  private sessionStartTime: Date;

  constructor() {
    this.sessionStartTime = new Date();
    this.sessionId = this.loadOrCreateSession();
    this.trackPageVisibility();
  }

  private loadOrCreateSession(): string {
    try {
      const stored = sessionStorage.getItem(this.sessionKey);
      if (stored) {
        const session = JSON.parse(stored);
        // Validate session (check if it's from today)
        const sessionDate = new Date(session.startTime);
        const now = new Date();
        
        if (this.isSameDay(sessionDate, now)) {
          return session.id;
        }
      }
    } catch (error) {
      console.warn('Failed to load existing session:', error);
    }

    // Create new session
    return this.createNewSession();
  }

  private createNewSession(): string {
    const sessionId = this.generateSessionId();
    const sessionData = {
      id: sessionId,
      startTime: this.sessionStartTime.toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    try {
      sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    } catch (error) {
      console.warn('Failed to store session data:', error);
    }

    return sessionId;
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${random}`;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private trackPageVisibility(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.updateSessionActivity('hidden');
      } else {
        this.updateSessionActivity('visible');
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.updateSessionActivity('unload');
    });
  }

  private updateSessionActivity(activity: string): void {
    try {
      const stored = sessionStorage.getItem(this.sessionKey);
      if (stored) {
        const session = JSON.parse(stored);
        session.lastActivity = new Date().toISOString();
        session.lastActivityType = activity;
        sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
      }
    } catch (error) {
      console.warn('Failed to update session activity:', error);
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getSessionStartTime(): Date {
    return this.sessionStartTime;
  }

  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime.getTime();
  }

  renewSession(): string {
    this.sessionId = this.createNewSession();
    this.sessionStartTime = new Date();
    return this.sessionId;
  }

  clearSession(): void {
    try {
      sessionStorage.removeItem(this.sessionKey);
    } catch (error) {
      console.warn('Failed to clear session:', error);
    }
  }

  getSessionInfo(): {
    id: string;
    startTime: Date;
    duration: number;
    userAgent: string;
    currentUrl: string;
  } {
    return {
      id: this.sessionId,
      startTime: this.sessionStartTime,
      duration: this.getSessionDuration(),
      userAgent: navigator.userAgent,
      currentUrl: window.location.href
    };
  }
}