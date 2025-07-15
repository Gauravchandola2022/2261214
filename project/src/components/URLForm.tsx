import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { Plus, Trash2, Globe } from 'lucide-react';
import { URLFormData } from '../types';
import { validateURL, validateShortcode, validateValidityMinutes } from '../utils/validation';
import { logger } from '../services/loggingService';

interface URLFormProps {
  onSubmit: (urls: URLFormData[]) => void;
  isLoading: boolean;
}

interface URLFormEntry extends URLFormData {
  id: string;
  errors: {
    originalUrl?: string;
    validityMinutes?: string;
    customShortcode?: string;
  };
}

const URLForm: React.FC<URLFormProps> = ({ onSubmit, isLoading }) => {
  const [urlEntries, setUrlEntries] = useState<URLFormEntry[]>([
    {
      id: '1',
      originalUrl: '',
      validityMinutes: 30,
      customShortcode: '',
      errors: {}
    }
  ]);

  React.useEffect(() => {
    logger.info('URLForm component mounted', 'URLForm');
  }, []);

  const addURLEntry = () => {
    if (urlEntries.length >= 5) {
      logger.warn('Attempted to add more than 5 URL entries', 'URLForm');
      return;
    }

    const newEntry: URLFormEntry = {
      id: Date.now().toString(),
      originalUrl: '',
      validityMinutes: 30,
      customShortcode: '',
      errors: {}
    };

    setUrlEntries([...urlEntries, newEntry]);
    logger.info('Added new URL entry', 'URLForm', { totalEntries: urlEntries.length + 1 });
  };

  const removeURLEntry = (id: string) => {
    if (urlEntries.length <= 1) {
      logger.warn('Attempted to remove the last URL entry', 'URLForm');
      return;
    }

    setUrlEntries(urlEntries.filter(entry => entry.id !== id));
    logger.info('Removed URL entry', 'URLForm', { removedId: id, remainingEntries: urlEntries.length - 1 });
  };

  const updateEntry = (id: string, field: keyof URLFormData, value: string | number) => {
    setUrlEntries(urlEntries.map(entry => {
      if (entry.id === id) {
        const updatedEntry = { ...entry, [field]: value };
        
        // Clear specific field error when user starts typing
        if (entry.errors[field as keyof URLFormEntry['errors']]) {
          updatedEntry.errors = { ...entry.errors, [field]: undefined };
        }
        
        return updatedEntry;
      }
      return entry;
    }));
  };

  const validateEntries = (): boolean => {
    logger.info('Starting form validation', 'URLForm', { entriesCount: urlEntries.length });
    
    let isValid = true;
    const updatedEntries = urlEntries.map(entry => {
      const errors: URLFormEntry['errors'] = {};

      // Validate URL
      const urlValidation = validateURL(entry.originalUrl);
      if (!urlValidation.isValid) {
        errors.originalUrl = urlValidation.error;
        isValid = false;
      }

      // Validate validity minutes
      const validityValidation = validateValidityMinutes(entry.validityMinutes);
      if (!validityValidation.isValid) {
        errors.validityMinutes = validityValidation.error;
        isValid = false;
      }

      // Validate shortcode
      if (entry.customShortcode) {
        const shortcodeValidation = validateShortcode(entry.customShortcode);
        if (!shortcodeValidation.isValid) {
          errors.customShortcode = shortcodeValidation.error;
          isValid = false;
        }
      }

      return { ...entry, errors };
    });

    setUrlEntries(updatedEntries);

    // Check for duplicate custom shortcodes
    const customShortcodes = updatedEntries
      .filter(entry => entry.customShortcode)
      .map(entry => entry.customShortcode);
    
    const duplicateShortcodes = customShortcodes.filter((code, index) => 
      customShortcodes.indexOf(code) !== index
    );

    if (duplicateShortcodes.length > 0) {
      isValid = false;
      logger.warn('Duplicate custom shortcodes detected', 'URLForm', { duplicates: duplicateShortcodes });
    }

    logger.info('Form validation completed', 'URLForm', { isValid, errorsFound: !isValid });
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logger.info('Form submission attempted', 'URLForm');

    if (!validateEntries()) {
      logger.warn('Form validation failed, submission aborted', 'URLForm');
      return;
    }

    const validEntries = urlEntries.filter(entry => entry.originalUrl.trim());
    
    if (validEntries.length === 0) {
      logger.warn('No valid entries found for submission', 'URLForm');
      return;
    }

    const formData: URLFormData[] = validEntries.map(entry => ({
      originalUrl: entry.originalUrl.trim(),
      validityMinutes: entry.validityMinutes,
      customShortcode: entry.customShortcode?.trim() || undefined
    }));

    logger.info('Submitting valid form data', 'URLForm', { entriesCount: formData.length });
    onSubmit(formData);
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <Globe size={24} style={{ marginRight: 8 }} />
          <Typography variant="h5" component="h2">
            Shorten Your URLs
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {urlEntries.map((entry, index) => (
            <Card key={entry.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Chip 
                  label={`URL ${index + 1}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
                {urlEntries.length > 1 && (
                  <Tooltip title="Remove this URL">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => removeURLEntry(entry.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  fullWidth
                  label="Original URL"
                  placeholder="https://example.com/very-long-url"
                  value={entry.originalUrl}
                  onChange={(e) => updateEntry(entry.id, 'originalUrl', e.target.value)}
                  error={!!entry.errors.originalUrl}
                  helperText={entry.errors.originalUrl}
                  required
                />

                <Box display="flex" gap={2}>
                  <TextField
                    label="Validity (minutes)"
                    type="number"
                    value={entry.validityMinutes}
                    onChange={(e) => updateEntry(entry.id, 'validityMinutes', parseInt(e.target.value) || 30)}
                    error={!!entry.errors.validityMinutes}
                    helperText={entry.errors.validityMinutes || 'Default: 30 minutes'}
                    inputProps={{ min: 1, max: 43200 }}
                    sx={{ flex: 1 }}
                  />

                  <TextField
                    label="Custom Shortcode (optional)"
                    placeholder="mycode123"
                    value={entry.customShortcode}
                    onChange={(e) => updateEntry(entry.id, 'customShortcode', e.target.value)}
                    error={!!entry.errors.customShortcode}
                    helperText={entry.errors.customShortcode || 'Leave empty for auto-generation'}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            </Card>
          ))}

          {urlEntries.length < 5 && (
            <Button
              variant="outlined"
              startIcon={<Plus size={18} />}
              onClick={addURLEntry}
              sx={{ mb: 3 }}
              fullWidth
            >
              Add Another URL ({urlEntries.length}/5)
            </Button>
          )}

          {urlEntries.length >= 5 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Maximum of 5 URLs can be shortened at once.
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading}
            fullWidth
            sx={{ py: 1.5 }}
          >
            {isLoading ? 'Shortening URLs...' : 'Shorten URLs'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default URLForm;