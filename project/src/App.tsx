import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Navigation from './components/Navigation';
import URLShortenerPage from './pages/URLShortenerPage';
import StatisticsPage from './pages/StatisticsPage';
import RedirectHandler from './components/RedirectHandler';
import { logger } from './services/loggingService';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  useEffect(() => {
    // Initialize logging service
    logger.loadLogs();
    logger.info('Application initialized', 'App');
    
    // Log page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logger.info('Page hidden', 'App');
      } else {
        logger.info('Page visible', 'App');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
          <Navigation />
          <Routes>
            <Route path="/" element={<URLShortenerPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/:shortCode" element={<RedirectHandler />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;