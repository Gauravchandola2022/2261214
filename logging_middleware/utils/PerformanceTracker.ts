import { LoggerMiddleware } from '../types';

export class PerformanceTracker {
  private logger: LoggerMiddleware;
  private measurements: Map<string, number> = new Map();

  constructor(logger: LoggerMiddleware) {
    this.logger = logger;
  }

  start(label: string): void {
    this.measurements.set(label, performance.now());
    this.logger.debug(`Performance tracking started: ${label}`, 'PerformanceTracker');
  }

  end(label: string): number {
    const startTime = this.measurements.get(label);
    if (!startTime) {
      this.logger.warn(`No start time found for performance label: ${label}`, 'PerformanceTracker');
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.measurements.delete(label);
    
    this.logger.info(`Performance measurement: ${label}`, 'PerformanceTracker', {
      duration: `${duration.toFixed(2)}ms`,
      startTime,
      endTime
    });

    return duration;
  }

  measure<T>(label: string, fn: () => T): T;
  measure<T>(label: string, fn: () => Promise<T>): Promise<T>;
  measure<T>(label: string, fn: () => T | Promise<T>): T | Promise<T> {
    this.start(label);
    
    try {
      const result = fn();
      
      if (result instanceof Promise) {
        return result
          .then(value => {
            this.end(label);
            return value;
          })
          .catch(error => {
            this.end(label);
            this.logger.error(`Performance measurement failed: ${label}`, 'PerformanceTracker', { error });
            throw error;
          });
      } else {
        this.end(label);
        return result;
      }
    } catch (error) {
      this.end(label);
      this.logger.error(`Performance measurement failed: ${label}`, 'PerformanceTracker', { error });
      throw error;
    }
  }

  getActiveMeasurements(): string[] {
    return Array.from(this.measurements.keys());
  }

  clearMeasurement(label: string): boolean {
    return this.measurements.delete(label);
  }

  clearAllMeasurements(): void {
    this.measurements.clear();
    this.logger.debug('All performance measurements cleared', 'PerformanceTracker');
  }

  // Web Vitals tracking
  trackWebVitals(): void {
    // Core Web Vitals
    this.trackLCP();
    this.trackFID();
    this.trackCLS();
    
    // Additional metrics
    this.trackFCP();
    this.trackTTFB();
  }

  private trackLCP(): void {
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.logger.info('Largest Contentful Paint', 'WebVitals', {
          value: lastEntry.startTime,
          rating: this.getLCPRating(lastEntry.startTime)
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      this.logger.warn('LCP tracking not supported', 'WebVitals');
    }
  }

  private trackFID(): void {
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.logger.info('First Input Delay', 'WebVitals', {
            value: entry.processingStart - entry.startTime,
            rating: this.getFIDRating(entry.processingStart - entry.startTime)
          });
        });
      }).observe({ entryTypes: ['first-input'] });
    } catch (error) {
      this.logger.warn('FID tracking not supported', 'WebVitals');
    }
  }

  private trackCLS(): void {
    try {
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        
        this.logger.info('Cumulative Layout Shift', 'WebVitals', {
          value: clsValue,
          rating: this.getCLSRating(clsValue)
        });
      }).observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      this.logger.warn('CLS tracking not supported', 'WebVitals');
    }
  }

  private trackFCP(): void {
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.logger.info('First Contentful Paint', 'WebVitals', {
            value: entry.startTime,
            rating: this.getFCPRating(entry.startTime)
          });
        });
      }).observe({ entryTypes: ['paint'] });
    } catch (error) {
      this.logger.warn('FCP tracking not supported', 'WebVitals');
    }
  }

  private trackTTFB(): void {
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        this.logger.info('Time to First Byte', 'WebVitals', {
          value: ttfb,
          rating: this.getTTFBRating(ttfb)
        });
      }
    } catch (error) {
      this.logger.warn('TTFB tracking failed', 'WebVitals', { error });
    }
  }

  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  private getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  private getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }

  private getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }
}