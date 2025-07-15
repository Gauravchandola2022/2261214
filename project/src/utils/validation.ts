import { logger } from '../services/loggingService';

export const validateURL = (url: string): { isValid: boolean; error?: string } => {
  logger.debug('Validating URL', 'ValidationUtils', { url });
  
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    logger.info('URL validation successful', 'ValidationUtils', { url });
    return { isValid: true };
  } catch (error) {
    logger.warn('URL validation failed', 'ValidationUtils', { url, error });
    return { isValid: false, error: 'Invalid URL format' };
  }
};

export const validateShortcode = (shortcode: string): { isValid: boolean; error?: string } => {
  logger.debug('Validating shortcode', 'ValidationUtils', { shortcode });
  
  if (!shortcode) {
    return { isValid: true }; // Optional field
  }

  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  
  if (shortcode.length < 3 || shortcode.length > 20) {
    return { isValid: false, error: 'Shortcode must be between 3 and 20 characters' };
  }

  if (!alphanumericRegex.test(shortcode)) {
    return { isValid: false, error: 'Shortcode must contain only letters and numbers' };
  }

  logger.info('Shortcode validation successful', 'ValidationUtils', { shortcode });
  return { isValid: true };
};

export const validateValidityMinutes = (minutes: number): { isValid: boolean; error?: string } => {
  logger.debug('Validating validity minutes', 'ValidationUtils', { minutes });
  
  if (!Number.isInteger(minutes) || minutes <= 0) {
    return { isValid: false, error: 'Validity must be a positive integer' };
  }

  if (minutes > 43200) { // 30 days max
    return { isValid: false, error: 'Validity cannot exceed 30 days (43200 minutes)' };
  }

  logger.info('Validity minutes validation successful', 'ValidationUtils', { minutes });
  return { isValid: true };
};