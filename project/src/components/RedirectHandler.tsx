import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Container, Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { ExternalLink, Clock } from 'lucide-react';
import { urlService } from '../services/urlService';
import { logger } from '../services/loggingService';

const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!shortCode) {
      setError('Invalid short code');
      setIsLoading(false);
      return;
    }

    logger.info('Processing redirect request', 'RedirectHandler', { shortCode });

    const handleRedirect = async () => {
      try {
        const result = urlService.recordClick(shortCode);
        
        if (result.success && result.redirectUrl) {
          logger.info('Redirect successful', 'RedirectHandler', { 
            shortCode, 
            redirectUrl: result.redirectUrl 
          });
          
          setRedirectUrl(result.redirectUrl);
          
          // Redirect after a brief delay to show the redirect page
          setTimeout(() => {
            window.location.href = result.redirectUrl!;
          }, 2000);
        } else {
          logger.warn('Redirect failed', 'RedirectHandler', { 
            shortCode, 
            error: result.error 
          });
          setError(result.error || 'Short URL not found');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Redirect handler error', 'RedirectHandler', { 
          shortCode, 
          error: errorMessage 
        });
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    handleRedirect();
  }, [shortCode]);

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <CircularProgress size={60} />
          <Typography variant="h5" textAlign="center">
            Redirecting...
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Please wait while we redirect you to your destination.
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <Clock size={60} color="#f44336" />
          <Typography variant="h5" textAlign="center" color="error">
            {error.includes('expired') ? 'Link Expired' : 'Link Not Found'}
          </Typography>
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/'}
            sx={{ mt: 2 }}
          >
            Go to URL Shortener
          </Button>
        </Box>
      </Container>
    );
  }

  if (redirectUrl) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <ExternalLink size={60} color="#4caf50" />
          <Typography variant="h5" textAlign="center" color="success.main">
            Redirecting Now...
          </Typography>
          <Alert severity="success" sx={{ width: '100%' }}>
            You are being redirected to: {redirectUrl}
          </Alert>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            If you are not redirected automatically,{' '}
            <Button
              component="a"
              href={redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
              size="small"
            >
              click here
            </Button>
          </Typography>
        </Box>
      </Container>
    );
  }

  return <Navigate to="/" replace />;
};

export default RedirectHandler;