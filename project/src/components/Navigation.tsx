import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { LinkIcon, BarChart3 } from 'lucide-react';
import { logger } from '../services/loggingService';

const Navigation: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    logger.info('Navigation rendered', 'Navigation', { currentPath: location.pathname });
  }, [location.pathname]);

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Box display="flex" alignItems="center" flexGrow={1}>
          <LinkIcon size={24} style={{ marginRight: 8 }} />
          <Typography variant="h6" component="div">
            URL Shortener
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            startIcon={<LinkIcon size={18} />}
          >
            Shorten URLs
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/statistics"
            variant={location.pathname === '/statistics' ? 'outlined' : 'text'}
            startIcon={<BarChart3 size={18} />}
          >
            Statistics
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;