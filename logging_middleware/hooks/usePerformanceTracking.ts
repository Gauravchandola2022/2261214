import { useCallback, useRef } from 'react';
import { PerformanceTracker } from '../utils/PerformanceTracker';
import { useLogger } from './useLogger';

export function usePerformanceTracking() {
  const { logger } = useLogger();
  const trackerRef = useRef<PerformanceTracker | null>(null);

  if (!trackerRef.current && logger) {
    trackerRef.current = new PerformanceTracker(logger);
  }

  const startTracking = useCallback((label: string) => {
    trackerRef.current?.start(label);
  }, []);

  const endTracking = useCallback((label: string) => {
    return trackerRef.current?.end(label) || 0;
  }, []);

  const measureSync = useCallback(<T>(label: string, fn: () => T): T => {
    if (!trackerRef.current) {
      return fn();
    }
    return trackerRef.current.measure(label, fn);
  }, []);

  const measureAsync = useCallback(async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    if (!trackerRef.current) {
      return fn();
    }
    return trackerRef.current.measure(label, fn);
  }, []);

  const trackWebVitals = useCallback(() => {
    trackerRef.current?.trackWebVitals();
  }, []);

  const getActiveMeasurements = useCallback(() => {
    return trackerRef.current?.getActiveMeasurements() || [];
  }, []);

  const clearMeasurement = useCallback((label: string) => {
    return trackerRef.current?.clearMeasurement(label) || false;
  }, []);

  const clearAllMeasurements = useCallback(() => {
    trackerRef.current?.clearAllMeasurements();
  }, []);

  return {
    startTracking,
    endTracking,
    measureSync,
    measureAsync,
    trackWebVitals,
    getActiveMeasurements,
    clearMeasurement,
    clearAllMeasurements
  };
}