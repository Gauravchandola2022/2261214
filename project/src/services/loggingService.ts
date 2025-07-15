import { useLogger } from './logging_middleware';

// In your components
const { info, error, warn } = useLogger();

// Use throughout your app
info('URL shortened successfully', 'URLService', { shortCode: 'abc123' });
error('Validation failed', 'URLForm', { errors: validationErrors });