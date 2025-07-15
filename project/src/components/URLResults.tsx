import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { Copy, ExternalLink, Clock, CheckCircle } from 'lucide-react';
import { ShortenedURL } from '../types';
import { logger } from '../services/loggingService';

interface URLResultsProps {
  results: ShortenedURL[];
  onClear: () => void;
}

const URLResults: React.FC<URLResultsProps> = ({ results, onClear }) => {
  const [copiedStates, setCopiedStates] = React.useState<{ [key: string]: boolean }>({});

  React.useEffect(() => {
    if (results.length > 0) {
      logger.info('URL results displayed', 'URLResults', { resultsCount: results.length });
    }
  }, [results]);

  const copyToClipboard = async (shortUrl: string, id: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedStates({ ...copiedStates, [id]: true });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);

      logger.info('Short URL copied to clipboard', 'URLResults', { shortUrl });
    } catch (error) {
      logger.error('Failed to copy to clipboard', 'URLResults', { error, shortUrl });
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: Date): boolean => {
    return new Date() > expiresAt;
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h5" component="h2">
            Shortened URLs
          </Typography>
          <Button variant="outlined" size="small" onClick={onClear}>
            Clear Results
          </Button>
        </Box>

        <Alert severity="success" sx={{ mb: 3 }}>
          Successfully shortened {results.length} URL{results.length > 1 ? 's' : ''}!
        </Alert>

        {results.map((result, index) => (
          <Card key={result.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Chip 
                  label={`URL ${index + 1}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip
                  icon={isExpired(result.expiresAt) ? <Clock size={14} /> : <CheckCircle size={14} />}
                  label={isExpired(result.expiresAt) ? 'Expired' : 'Active'}
                  size="small"
                  color={isExpired(result.expiresAt) ? 'error' : 'success'}
                />
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Original URL:
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    wordBreak: 'break-all',
                    backgroundColor: 'grey.50',
                    p: 1,
                    borderRadius: 1,
                    fontFamily: 'monospace'
                  }}
                >
                  {result.originalUrl}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Shortened URL:
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      flex: 1,
                      backgroundColor: 'primary.50',
                      p: 1,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      color: 'primary.main',
                      fontWeight: 'medium'
                    }}
                  >
                    {result.shortUrl}
                  </Typography>
                  
                  <Tooltip title={copiedStates[result.id] ? 'Copied!' : 'Copy to clipboard'}>
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(result.shortUrl, result.id)}
                      color={copiedStates[result.id] ? 'success' : 'primary'}
                    >
                      {copiedStates[result.id] ? <CheckCircle size={18} /> : <Copy size={18} />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Open shortened URL">
                    <IconButton
                      size="small"
                      component="a"
                      href={result.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="primary"
                    >
                      <ExternalLink size={18} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(result.createdAt)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Expires
                  </Typography>
                  <Typography 
                    variant="body2"
                    color={isExpired(result.expiresAt) ? 'error.main' : 'text.primary'}
                  >
                    {formatDate(result.expiresAt)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Short Code
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {result.shortCode}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default URLResults;