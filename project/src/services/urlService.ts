import { ShortenedURL, URLFormData, ClickData } from '../types';
import { logger } from './loggingService';
import { storageService } from './storageService';
import { generateUniqueShortcode, isShortcodeUnique } from '../utils/shortcodeGenerator';

class URLService {
  private urls: ShortenedURL[] = [];

  constructor() {
    this.loadURLs();
  }

  private loadURLs(): void {
    this.urls = storageService.loadURLs();
    logger.info('URLService initialized', 'URLService', { urlCount: this.urls.length });
  }

  private saveURLs(): void {
    storageService.saveURLs(this.urls);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  shortenURL(formData: URLFormData): ShortenedURL {
    logger.info('Starting URL shortening process', 'URLService', { formData });

    const validityMinutes = formData.validityMinutes || 30; // Default 30 minutes
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + validityMinutes * 60 * 1000);

    let shortCode: string;
    
    if (formData.customShortcode) {
      if (!isShortcodeUnique(formData.customShortcode, this.urls)) {
        logger.error('Custom shortcode collision', 'URLService', { shortcode: formData.customShortcode });
        throw new Error('Custom shortcode already exists. Please choose a different one.');
      }
      shortCode = formData.customShortcode;
      logger.info('Using custom shortcode', 'URLService', { shortcode: shortCode });
    } else {
      shortCode = generateUniqueShortcode(this.urls);
      logger.info('Generated automatic shortcode', 'URLService', { shortcode: shortCode });
    }

    const shortenedURL: ShortenedURL = {
      id: this.generateId(),
      originalUrl: formData.originalUrl,
      shortCode,
      shortUrl: `http://localhost:3000/${shortCode}`,
      createdAt,
      expiresAt,
      isExpired: false,
      clicks: []
    };

    this.urls.push(shortenedURL);
    this.saveURLs();

    logger.info('URL shortened successfully', 'URLService', { 
      shortCode, 
      originalUrl: formData.originalUrl,
      expiresAt: expiresAt.toISOString()
    });

    return shortenedURL;
  }

  getAllURLs(): ShortenedURL[] {
    // Update expired status before returning
    const now = new Date();
    this.urls = this.urls.map(url => ({
      ...url,
      isExpired: now > url.expiresAt
    }));
    
    logger.debug('Retrieved all URLs', 'URLService', { count: this.urls.length });
    return [...this.urls];
  }

  getURLByShortCode(shortCode: string): ShortenedURL | null {
    const url = this.urls.find(url => url.shortCode === shortCode);
    logger.debug('Retrieved URL by shortcode', 'URLService', { shortCode, found: !!url });
    return url || null;
  }

  recordClick(shortCode: string): { success: boolean; redirectUrl?: string; error?: string } {
    logger.info('Recording click', 'URLService', { shortCode });

    const urlIndex = this.urls.findIndex(url => url.shortCode === shortCode);
    
    if (urlIndex === -1) {
      logger.warn('Shortcode not found for click recording', 'URLService', { shortCode });
      return { success: false, error: 'Short URL not found' };
    }

    const url = this.urls[urlIndex];
    const now = new Date();

    if (now > url.expiresAt) {
      logger.warn('Attempted click on expired URL', 'URLService', { shortCode, expiresAt: url.expiresAt });
      return { success: false, error: 'Short URL has expired' };
    }

    // Generate mock geographical and source data
    const mockLocations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'];
    const mockSources = ['Direct', 'Google', 'Facebook', 'Twitter', 'Email', 'LinkedIn'];
    const mockUserAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    ];

    const clickData: ClickData = {
      id: this.generateId(),
      timestamp: now,
      source: mockSources[Math.floor(Math.random() * mockSources.length)],
      location: mockLocations[Math.floor(Math.random() * mockLocations.length)],
      userAgent: mockUserAgents[Math.floor(Math.random() * mockUserAgents.length)]
    };

    this.urls[urlIndex].clicks.push(clickData);
    this.saveURLs();

    logger.info('Click recorded successfully', 'URLService', { 
      shortCode, 
      totalClicks: this.urls[urlIndex].clicks.length,
      clickData 
    });

    return { success: true, redirectUrl: url.originalUrl };
  }

  getStatistics(): { totalUrls: number; totalClicks: number; activeUrls: number } {
    const now = new Date();
    const activeUrls = this.urls.filter(url => now <= url.expiresAt).length;
    const totalClicks = this.urls.reduce((sum, url) => sum + url.clicks.length, 0);

    const stats = {
      totalUrls: this.urls.length,
      totalClicks,
      activeUrls
    };

    logger.debug('Generated statistics', 'URLService', stats);
    return stats;
  }

  clearAllData(): void {
    this.urls = [];
    this.saveURLs();
    logger.info('All URL data cleared', 'URLService');
  }
}

export const urlService = new URLService();