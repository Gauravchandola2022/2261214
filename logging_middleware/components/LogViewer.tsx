import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  TablePagination,
  Grid
} from '@mui/material';
import {
  Download,
  Refresh,
  Clear,
  Visibility,
  FilterList,
  Search
} from '@mui/icons-material';
import { LogEntry, LogLevel, LogFilter } from '../types';
import { useLogger } from '../hooks/useLogger';

interface LogViewerProps {
  height?: number;
  showExport?: boolean;
  showClear?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const LogViewer: React.FC<LogViewerProps> = ({
  height = 600,
  showExport = true,
  showClear = true,
  autoRefresh = false,
  refreshInterval = 5000
}) => {
  const { getLogs, clearLogs, exportLogs } = useLogger();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [filter, setFilter] = useState<LogFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const levelColors: Record<LogLevel, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    [LogLevel.DEBUG]: 'default',
    [LogLevel.INFO]: 'info',
    [LogLevel.WARN]: 'warning',
    [LogLevel.ERROR]: 'error',
    [LogLevel.FATAL]: 'error'
  };

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadLogs, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    applyFilters();
  }, [logs, filter, searchTerm]);

  const loadLogs = () => {
    const allLogs = getLogs();
    setLogs(allLogs);
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Apply level filter
    if (filter.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }

    // Apply component filter
    if (filter.component) {
      filtered = filtered.filter(log => log.component === filter.component);
    }

    // Apply date range filter
    if (filter.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filter.startDate!);
    }
    if (filter.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filter.endDate!);
    }

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchLower) ||
        log.component?.toLowerCase().includes(searchLower) ||
        log.level.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLogs(filtered);
    setPage(0);
  };

  const handleExport = (format: 'json' | 'csv') => {
    const exportData = exportLogs(format);
    const blob = new Blob([exportData], {
      type: format === 'json' ? 'application/json' : 'text/csv'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    clearLogs();
    loadLogs();
  };

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleString();
  };

  const getUniqueComponents = (): string[] => {
    const components = logs
      .map(log => log.component)
      .filter((component): component is string => !!component);
    return Array.from(new Set(components)).sort();
  };

  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Log Viewer ({filteredLogs.length} entries)
            </Typography>
            <Box display="flex" gap={1}>
              <Tooltip title="Refresh logs">
                <IconButton onClick={loadLogs} size="small">
                  <Refresh />
                </IconButton>
              </Tooltip>
              {showExport && (
                <>
                  <Button
                    size="small"
                    startIcon={<Download />}
                    onClick={() => handleExport('json')}
                  >
                    Export JSON
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Download />}
                    onClick={() => handleExport('csv')}
                  >
                    Export CSV
                  </Button>
                </>
              )}
              {showClear && (
                <Button
                  size="small"
                  color="error"
                  startIcon={<Clear />}
                  onClick={handleClearLogs}
                >
                  Clear Logs
                </Button>
              )}
            </Box>
          </Box>

          {/* Filters */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search fontSize="small" />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Level</InputLabel>
                <Select
                  value={filter.level || ''}
                  onChange={(e) => setFilter({ ...filter, level: e.target.value as LogLevel || undefined })}
                  label="Level"
                >
                  <MenuItem value="">All Levels</MenuItem>
                  {Object.values(LogLevel).map(level => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Component</InputLabel>
                <Select
                  value={filter.component || ''}
                  onChange={(e) => setFilter({ ...filter, component: e.target.value || undefined })}
                  label="Component"
                >
                  <MenuItem value="">All Components</MenuItem>
                  {getUniqueComponents().map(component => (
                    <MenuItem key={component} value={component}>{component}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFilter({})}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>

          {/* Logs Table */}
          <TableContainer component={Paper} sx={{ maxHeight: height }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Component</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {formatTimestamp(log.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.level}
                        size="small"
                        color={levelColors[log.level]}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.component || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={log.message}
                      >
                        {log.message}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredLogs.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedLog && (
          <>
            <DialogTitle>
              Log Entry Details
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Timestamp
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {formatTimestamp(selectedLog.timestamp)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Level
                  </Typography>
                  <Chip
                    label={selectedLog.level}
                    size="small"
                    color={levelColors[selectedLog.level]}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Component
                  </Typography>
                  <Typography variant="body2">
                    {selectedLog.component || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Session ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {selectedLog.sessionId || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Message
                  </Typography>
                  <Typography variant="body2">
                    {selectedLog.message}
                  </Typography>
                </Grid>
                {selectedLog.metadata && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Metadata
                    </Typography>
                    <Paper sx={{ p: 1, backgroundColor: 'grey.50' }}>
                      <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                )}
                {selectedLog.stack && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Stack Trace
                    </Typography>
                    <Paper sx={{ p: 1, backgroundColor: 'grey.50' }}>
                      <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                        {selectedLog.stack}
                      </pre>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default LogViewer;