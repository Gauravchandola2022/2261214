import { logger } from '../services/loggingService';

export const generateShortcode = (length: number = 6): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  logger.info('Generated shortcode', 'ShortcodeGenerator', { shortcode: result, length });
  return result;
};

export const isShortcodeUnique = (shortcode: string, existingUrls: { shortCode: string }[]): boolean => {
  const isUnique = !existingUrls.some(url => url.shortCode === shortcode);
  logger.debug('Checking shortcode uniqueness', 'ShortcodeGenerator', { shortcode, isUnique });
  return isUnique;
};

export const generateUniqueShortcode = (existingUrls: { shortCode: string }[]): string => {
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    const shortcode = generateShortcode();
    if (isShortcodeUnique(shortcode, existingUrls)) {
      logger.info('Generated unique shortcode', 'ShortcodeGenerator', { shortcode, attempts: attempts + 1 });
      return shortcode;
    }
    attempts++;
  }
  
  // Fallback to timestamp-based shortcode
  const fallbackShortcode = Date.now().toString(36);
  logger.warn('Using fallback shortcode after max attempts', 'ShortcodeGenerator', { 
    shortcode: fallbackShortcode, 
    attempts 
  });
  return fallbackShortcode;
};