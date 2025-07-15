import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  TablePagination,
  TextField,
  InputAdornment,
  Grid
} from '@mui/material';
import { 
  BarChart3, 
  ExternalLink, 
  Search, 
  TrendingUp, 
  Link as LinkIcon, 
  Clock,
  Eye
} from 'lucide-react';
import { ShortenedURL } from '../types';
import { urlService } from '../services/urlService';
import { logger } from '../services/loggingService';

const StatisticsPage: React.FC = () => {
  const [urls, setUrls] = useState<ShortenedURL[]>([]);
  const [filteredUrls, setFilteredUrls] = useState<ShortenedURL[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<ShortenedURL | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadStatistics();
    logger.info('StatisticsPage mounted', 'StatisticsPage');
  }, []);

  useEffect(() => {
    // Filter URLs based on search term
    const filtered = urls.filter(url => 
      url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUrls(filtered);
    setPage(0); // Reset to first page when filtering
  }, [urls, searchTerm]);

  const loadStatistics = () => {
    try {
      const allUrls = urlService.getAllURLs();
      // Sort by creation date (newest first)
      const sortedUrls = allUrls.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setUrls(sortedUrls);
      logger.info('Statistics loaded', 'StatisticsPage', { urlsCount: sortedUrls.length });
    } catch (error) {
      logger.error('Failed to load statistics', 'StatisticsPage', { error });
    }
  };

  const handleViewDetails = (url: ShortenedURL) => {
    setSelectedUrl(url);
    logger.info('Viewing URL details', 'StatisticsPage', { shortCode: url.shortCode });
  };

  const handleCloseDetails = () => {
    setSelectedUrl(null);
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

  const getStatistics = () => {
    const totalUrls = urls.length;
    const activeUrls = urls.filter(url => !isExpired(url.expiresAt)).length;
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks.length, 0);
    const avgClicksPerUrl = totalUrls > 0 ? (totalClicks / totalUrls).toFixed(1) : '0';

    return { totalUrls, activeUrls, totalClicks, avgClicksPerUrl };
  };

  const stats = getStatistics();

  // Pagination
  const paginatedUrls = filteredUrls.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" flexDirection="column" gap={4}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2}>
          <BarChart3 size={32} />
          <Typography variant="h4" component="h1">
            URL Statistics & Analytics
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <LinkIcon size={32} color="#1976d2" style={{ marginBottom: 8 }} />
                <Typography variant="h4" color="primary">
                  {stats.totalUrls}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total URLs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Clock size={32} color="#4caf50" style={{ marginBottom: 8 }} />
                <Typography variant="h4" color="success.main">
                  {stats.activeUrls}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active URLs
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Eye size={32} color="#ff9800" style={{ marginBottom: 8 }} />
                <Typography variant="h4" color="warning.main">
                  {stats.totalClicks}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Clicks
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp size={32} color="#9c27b0" style={{ marginBottom: 8 }} />
                <Typography variant="h4" color="secondary.main">
                  {stats.avgClicksPerUrl}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Clicks/URL
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Controls */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <TextField
                placeholder="Search URLs or short codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
              <Button variant="outlined" onClick={loadStatistics}>
                Refresh Data
              </Button>
            </Box>

            {urls.length === 0 ? (
              <Alert severity="info">
                No shortened URLs found. Create some URLs first to see statistics.
              </Alert>
            ) : (
              <>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'grey.50' }}>
                        <TableCell>Short Code</TableCell>
                        <TableCell>Original URL</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Clicks</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Expires</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedUrls.map((url) => (
                        <TableRow key={url.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {url.shortCode}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                maxWidth: 300, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={url.originalUrl}
                            >
                              {url.originalUrl}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={isExpired(url.expiresAt) ? 'Expired' : 'Active'}
                              size="small"
                              color={isExpired(url.expiresAt) ? 'error' : 'success'}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="medium">
                              {url.clicks.length}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(url.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2"
                              color={isExpired(url.expiresAt) ? 'error.main' : 'text.primary'}
                            >
                              {formatDate(url.expiresAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" gap={1} justifyContent="center">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleViewDetails(url)}
                              >
                                Details
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                component="a"
                                href={url.shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<ExternalLink size={14} />}
                              >
                                Visit
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={filteredUrls.length}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* URL Details Dialog */}
        <Dialog 
          open={!!selectedUrl} 
          onClose={handleCloseDetails} 
          maxWidth="md" 
          fullWidth
        >
          {selectedUrl && (
            <>
              <DialogTitle>
                URL Details: {selectedUrl.shortCode}
              </DialogTitle>
              <DialogContent>
                <Box display="flex" flexDirection="column" gap={3}>
                  {/* URL Information */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        URL Information
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Original URL:
                          </Typography>
                          <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                            {selectedUrl.originalUrl}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Short URL:
                          </Typography>
                          <Typography variant="body1" color="primary.main">
                            {selectedUrl.shortUrl}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={4}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Created:
                            </Typography>
                            <Typography variant="body1">
                              {formatDate(selectedUrl.createdAt)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Expires:
                            </Typography>
                            <Typography 
                              variant="body1"
                              color={isExpired(selectedUrl.expiresAt) ? 'error.main' : 'text.primary'}
                            >
                              {formatDate(selectedUrl.expiresAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Click Analytics */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Click Analytics ({selectedUrl.clicks.length} total clicks)
                      </Typography>
                      
                      {selectedUrl.clicks.length === 0 ? (
                        <Alert severity="info">
                          No clicks recorded yet for this URL.
                        </Alert>
                      ) : (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>Source</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>User Agent</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedUrl.clicks
                                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                .map((click) => (
                                <TableRow key={click.id}>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {formatDate(click.timestamp)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={click.source} 
                                      size="small" 
                                      variant="outlined" 
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {click.location}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        maxWidth: 200, 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                      title={click.userAgent}
                                    >
                                      {click.userAgent}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              </DialogContent>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default StatisticsPage;