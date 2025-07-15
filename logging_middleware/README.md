# Logging Middleware

A comprehensive, production-ready logging middleware system for React applications with TypeScript support.

## Features

- **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR, FATAL
- **Multiple Adapters**: Console, Local Storage, Remote endpoint
- **Performance Tracking**: Built-in performance measurement and Web Vitals tracking
- **Session Management**: Automatic session tracking and management
- **React Integration**: Custom hooks and components for seamless React integration
- **Filtering & Search**: Advanced log filtering and search capabilities
- **Export Functionality**: Export logs in JSON or CSV format
- **Buffer Management**: Intelligent buffering for remote logging
- **Error Handling**: Automatic error capture and stack trace logging
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Installation

Since this is a custom middleware, copy the `logging_middleware` folder to your project and import as needed.

## Quick Start

### Basic Usage

```typescript
import { defaultLogger, LogLevel } from './logging_middleware';

// Simple logging
defaultLogger.info('Application started', 'App');
defaultLogger.error('Something went wrong', 'ErrorHandler', { error: 'details' });

// Or use convenience functions
import { info, error } from './logging_middleware';

info('User logged in', 'Auth', { userId: '123' });
error('API call failed', 'ApiService', { endpoint: '/users', status: 500 });
```

### React Hook Usage

```typescript
import { useLogger } from './logging_middleware';

function MyComponent() {
  const { info, error, getLogs } = useLogger();

  const handleClick = () => {
    info('Button clicked', 'MyComponent', { buttonId: 'submit' });
  };

  const handleError = (err: Error) => {
    error('Component error', 'MyComponent', { error: err.message });
  };

  return (
    <button onClick={handleClick}>
      Click me
    </button>
  );
}
```

### Performance Tracking

```typescript
import { usePerformanceTracking } from './logging_middleware';

function DataProcessor() {
  const { measureAsync, trackWebVitals } = usePerformanceTracking();

  useEffect(() => {
    trackWebVitals(); // Track Core Web Vitals
  }, []);

  const processData = async (data: any[]) => {
    return measureAsync('data-processing', async () => {
      // Your data processing logic
      return processLargeDataset(data);
    });
  };

  return <div>Processing...</div>;
}
```

### Log Viewer Component

```typescript
import { LogViewer } from './logging_middleware';

function AdminPanel() {
  return (
    <div>
      <h1>Admin Panel</h1>
      <LogViewer
        height={600}
        showExport={true}
        showClear={true}
        autoRefresh={true}
        refreshInterval={5000}
      />
    </div>
  );
}
```

## Configuration

### Logger Configuration

```typescript
import { Logger, LogLevel } from './logging_middleware';

const logger = new Logger({
  level: LogLevel.INFO,           // Minimum log level
  enableConsole: true,            // Enable console output
  enableStorage: true,            // Enable localStorage
  enableRemote: false,            // Enable remote logging
  maxStorageEntries: 1000,        // Max entries in storage
  remoteEndpoint: 'https://api.example.com/logs',
  bufferSize: 50,                 // Buffer size for remote logging
  flushInterval: 5000,            // Auto-flush interval (ms)
  userId: 'user123',              // Optional user ID
  sessionId: 'session456'         // Optional session ID (auto-generated if not provided)
});
```

### Remote Logging Setup

```typescript
import { setLoggerConfig } from './logging_middleware';

setLoggerConfig({
  enableRemote: true,
  remoteEndpoint: 'https://your-logging-service.com/api/logs',
  bufferSize: 100,
  flushInterval: 10000
});
```

## API Reference

### Core Logger Methods

```typescript
// Log with specific level
logger.log(LogLevel.INFO, 'Message', 'Component', { metadata });

// Convenience methods
logger.debug('Debug message', 'Component');
logger.info('Info message', 'Component');
logger.warn('Warning message', 'Component');
logger.error('Error message', 'Component');
logger.fatal('Fatal error', 'Component');

// Retrieve logs
const logs = logger.getLogs();
const filteredLogs = logger.getLogs({
  level: LogLevel.ERROR,
  component: 'ApiService',
  startDate: new Date('2023-01-01'),
  endDate: new Date('2023-12-31'),
  searchTerm: 'failed'
});

// Export logs
const jsonLogs = logger.exportLogs('json');
const csvLogs = logger.exportLogs('csv');

// Clear logs
logger.clearLogs();
```

### Performance Tracking

```typescript
import { PerformanceTracker } from './logging_middleware';

const tracker = new PerformanceTracker(logger);

// Manual tracking
tracker.start('operation');
// ... do work
const duration = tracker.end('operation');

// Automatic tracking
const result = tracker.measure('api-call', () => {
  return fetch('/api/data');
});

// Web Vitals tracking
tracker.trackWebVitals();
```

### Session Management

```typescript
import { SessionManager } from './logging_middleware';

const sessionManager = new SessionManager();

const sessionId = sessionManager.getSessionId();
const sessionInfo = sessionManager.getSessionInfo();
const duration = sessionManager.getSessionDuration();

// Renew session
sessionManager.renewSession();

// Clear session
sessionManager.clearSession();
```

## Log Entry Structure

```typescript
interface LogEntry {
  id: string;                    // Unique identifier
  timestamp: Date;               // When the log was created
  level: LogLevel;               // Log level
  message: string;               // Log message
  component?: string;            // Component name
  userId?: string;               // User identifier
  sessionId?: string;            // Session identifier
  metadata?: Record<string, any>; // Additional data
  stack?: string;                // Stack trace (for errors)
  url?: string;                  // Current URL
  userAgent?: string;            // Browser user agent
}
```

## Advanced Features

### Custom Adapters

You can create custom adapters by implementing the adapter interface:

```typescript
class CustomAdapter {
  async log(entry: LogEntry): Promise<void> {
    // Your custom logging logic
  }

  async logBatch(entries: LogEntry[]): Promise<void> {
    // Your custom batch logging logic
  }
}
```

### Error Boundaries Integration

```typescript
import { error } from './logging_middleware';

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    error('React Error Boundary', 'ErrorBoundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }
}
```

### Global Error Handling

The logger automatically captures:
- Unhandled JavaScript errors
- Unhandled promise rejections
- Page visibility changes

## Best Practices

1. **Use appropriate log levels**: DEBUG for development, INFO for general information, WARN for potential issues, ERROR for errors, FATAL for critical failures.

2. **Include context**: Always provide component names and relevant metadata.

3. **Avoid logging sensitive data**: Never log passwords, tokens, or personal information.

4. **Use performance tracking**: Measure critical operations to identify bottlenecks.

5. **Configure for environment**: Use different configurations for development, staging, and production.

6. **Monitor storage usage**: Regularly clear logs or adjust `maxStorageEntries` to prevent storage issues.

7. **Implement log rotation**: For production applications, implement server-side log rotation.

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

This logging middleware is provided as-is for educational and development purposes.