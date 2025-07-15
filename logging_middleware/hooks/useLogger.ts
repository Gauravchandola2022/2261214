import { useEffect, useRef, useCallback } from 'react';
import { Logger } from '../core/Logger';
import { LogLevel, LoggerConfig } from '../types';

export function useLogger(config?: Partial<LoggerConfig>) {
  const loggerRef = useRef<Logger | null>(null);

  useEffect(() => {
    if (!loggerRef.current) {
      loggerRef.current = new Logger(config);
    }

    return () => {
      if (loggerRef.current) {
        loggerRef.current.destroy();
      }
    };
  }, []);

  const log = useCallback((level: LogLevel, message: string, component?: string, metadata?: Record<string, any>) => {
    loggerRef.current?.log(level, message, component, metadata);
  }, []);

  const debug = useCallback((message: string, component?: string, metadata?: Record<string, any>) => {
    loggerRef.current?.debug(message, component, metadata);
  }, []);

  const info = useCallback((message: string, component?: string, metadata?: Record<string, any>) => {
    loggerRef.current?.info(message, component, metadata);
  }, []);

  const warn = useCallback((message: string, component?: string, metadata?: Record<string, any>) => {
    loggerRef.current?.warn(message, component, metadata);
  }, []);

  const error = useCallback((message: string, component?: string, metadata?: Record<string, any>) => {
    loggerRef.current?.error(message, component, metadata);
  }, []);

  const fatal = useCallback((message: string, component?: string, metadata?: Record<string, any>) => {
    loggerRef.current?.fatal(message, component, metadata);
  }, []);

  const getLogs = useCallback((filter?: any) => {
    return loggerRef.current?.getLogs(filter) || [];
  }, []);

  const clearLogs = useCallback(() => {
    loggerRef.current?.clearLogs();
  }, []);

  const exportLogs = useCallback((format?: 'json' | 'csv') => {
    return loggerRef.current?.exportLogs(format) || '';
  }, []);

  return {
    logger: loggerRef.current,
    log,
    debug,
    info,
    warn,
    error,
    fatal,
    getLogs,
    clearLogs,
    exportLogs
  };
}