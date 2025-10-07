import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Stack,
} from '@mui/material';
import { CheckCircle, Error, Wifi } from '@mui/icons-material';
import { apiClient } from '../../services/api';

export const ApiConnectionTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      console.log('Testing API connection...');
      const response = await apiClient.getPlans();
      console.log('API Response:', response);
      
      setResult({
        success: true,
        message: 'Successfully connected to API!',
        details: {
          plansCount: response.data?.items?.length || 0,
          endpoint: '/api/plans',
          status: 'Connected'
        }
      });
    } catch (error: any) {
      console.error('API Connection Error:', error);
      
      setResult({
        success: false,
        message: error.response?.data?.message || error.message || 'Connection failed',
        details: {
          status: error.response?.status || 'Network Error',
          endpoint: '/api/plans',
          error: error.code || 'UNKNOWN_ERROR'
        }
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Wifi />
          <Typography variant="h6">API Connection Test</Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          Test the connection to the backend API to ensure CORS and proxy configuration is working correctly.
        </Typography>

        <Button
          variant="contained"
          onClick={testConnection}
          disabled={testing}
          startIcon={testing ? <CircularProgress size={16} /> : <Wifi />}
          sx={{ alignSelf: 'flex-start' }}
        >
          {testing ? 'Testing Connection...' : 'Test API Connection'}
        </Button>

        {result && (
          <Alert 
            severity={result.success ? 'success' : 'error'}
            icon={result.success ? <CheckCircle /> : <Error />}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              {result.message}
            </Typography>
            {result.details && (
              <Box component="pre" sx={{ fontSize: '0.75rem', mt: 1 }}>
                {JSON.stringify(result.details, null, 2)}
              </Box>
            )}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};
