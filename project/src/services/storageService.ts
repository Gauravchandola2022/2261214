import { ShortenedURL } from '../types';
import { logger } from './loggingService';

class StorageService {
  private readonly STORAGE_KEY = 'url_shortener_data';

  saveURLs(urls: ShortenedURL[]): void {
    try {
      const serializedData = JSON.stringify(urls.map(url => ({
        ...url,
        createdAt: url.createdAt.toISOString(),
        expiresAt: url.expiresAt.toISOString(),
        clicks: url.clicks.map(click => ({
          ...click,
          timestamp: click.timestamp.toISOString()
        }))
      })));
      localStorage.setItem(this.STORAGE_KEY, serializedData);
      logger.info('URLs saved to localStorage', 'StorageService', { count: urls.length });
    } catch (error) {
      logger.error('Failed to save URLs to localStorage', 'StorageService', { error });
      throw new Error('Failed to save data');
    }
  }

  loadURLs(): ShortenedURL[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        logger.info('No stored URLs found', 'StorageService');
        return [];
      }

      const parsed = JSON.parse(data);
      const urls = parsed.map((url: any) => ({
        ...url,
        createdAt: new Date(url.createdAt),
        expiresAt: new Date(url.expiresAt),
        isExpired: new Date() > new Date(url.expiresAt),
        clicks: url.clicks.map((click: any) => ({
          ...click,
          timestamp: new Date(click.timestamp)
        }))
      }));

      logger.info('URLs loaded from localStorage', 'StorageService', { count: urls.length });
      return urls;
    } catch (error) {
      logger.error('Failed to load URLs from localStorage', 'StorageService', { error });
      return [];
    }
  }

  clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      logger.info('Storage cleared', 'StorageService');
    } catch (error) {
      logger.error('Failed to clear storage', 'StorageService', { error });
    }
  }
}

export const storageService = new StorageService();