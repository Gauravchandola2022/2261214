import React, { useState } from 'react';
import { Container, Box, Alert } from '@mui/material';
import URLForm from '../components/URLForm';
import URLResults from '../components/URLResults';
import { ShortenedURL, URLFormData } from '../types';
import { urlService } from '../services/urlService';
import { logger } from '../services/loggingService';

const URLShortenerPage: React.FC = () => {
  const [results, setResults] = useState<ShortenedURL[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    logger.info('URLShortenerPage mounted', 'URLShortenerPage');
  }, []);

  const handleURLSubmit = async (urlsData: URLFormData[]) => {
    logger.info('Processing URL shortening request', 'URLShortenerPage', { 
      urlsCount: urlsData.length 
    });

    setIsLoading(true);
    setError(null);

    try {
      const newResults: ShortenedURL[] = [];
      
      for (const urlData of urlsData) {
        try {
          const result = urlService.shortenURL(urlData);
          newResults.push(result);
          logger.info('URL shortened successfully', 'URLShortenerPage', { 
            originalUrl: urlData.originalUrl,
            shortCode: result.shortCode 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.error('Failed to shorten URL', 'URLShortenerPage', { 
            originalUrl: urlData.originalUrl,
            error: errorMessage 
          });
          throw new Error(`Failed to shorten "${urlData.originalUrl}": ${errorMessage}`);
        }
      }

      setResults(newResults);
      logger.info('All URLs processed successfully', 'URLShortenerPage', { 
        totalResults: newResults.length 
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      logger.error('URL shortening process failed', 'URLShortenerPage', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearResults = () => {
    setResults([]);
    setError(null);
    logger.info('Results cleared', 'URLShortenerPage');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" flexDirection="column" gap={4}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <URLForm onSubmit={handleURLSubmit} isLoading={isLoading} />
        
        <URLResults results={results} onClear={handleClearResults} />
      </Box>
    </Container>
  );
};

export default URLShortenerPage;