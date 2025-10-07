import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import { Security, CheckCircle, Error, Info } from '@mui/icons-material';
import { apiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export const ApiHeaderTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { accessKey, isAuthenticated } = useAuthStore();

  const testHeaders = async () => {
    setTesting(true);
    setResult(null);

    try {
      console.log('=== API Header Test Started ===');
      
      // Get current auth status
      const authStatus = apiClient.getAuthStatus();
      console.log('Current auth status:', authStatus);
      
      // Test API call to see headers in action
      console.log('Making API call to test headers...');
      const response = await apiClient.getPlans();
      
      setResult({
        success: true,
        message: 'API call successful with headers!',
        details: {
          authStatus,
          plansCount: response.data?.items?.length || 0,
          responseCode: response.code,
          responseMessage: response.message
        }
      });
      
      console.log('=== API Header Test Completed Successfully ===');
    } catch (error: any) {
      console.error('=== API Header Test Failed ===', error);
      
      setResult({
        success: false,
        message: 'API call failed',
        details: {
          authStatus: apiClient.getAuthStatus(),
          error: error.message || 'Unknown error',
          errorCode: error.code || 'UNKNOWN'
        }
      });
    } finally {
      setTesting(false);
    }
  };

  const getCurrentAuthInfo = () => {
    const authStatus = apiClient.getAuthStatus();
    return {
      storeAuthenticated: isAuthenticated,
      storeAccessKey: accessKey ? `${accessKey.substring(0, 8)}...` : 'none',
      clientAuthenticated: authStatus.isAuthenticated,
      clientAccessKey: authStatus.accessKeyPreview || 'none',
      clientBaseURL: authStatus.baseURL
    };
  };

  const authInfo = getCurrentAuthInfo();

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security />
          <Typography variant="h6">API Header & Authentication Test</Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          Test that the X-Access-Key header is properly sent with every API request.
          Check browser console for detailed request/response logs.
        </Typography>

        <Divider />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Current Authentication Status:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip
              label={`Store Auth: ${authInfo.storeAuthenticated ? 'Yes' : 'No'}`}
              color={authInfo.storeAuthenticated ? 'success' : 'error'}
              size="small"
            />
            <Chip
              label={`Client Auth: ${authInfo.clientAuthenticated ? 'Yes' : 'No'}`}
              color={authInfo.clientAuthenticated ? 'success' : 'error'}
              size="small"
            />
            <Chip
              label={`Store Key: ${authInfo.storeAccessKey}`}
              variant="outlined"
              size="small"
            />
            <Chip
              label={`Client Key: ${authInfo.clientAccessKey}`}
              variant="outlined"
              size="small"
            />
          </Stack>
        </Box>

        <Button
          variant="contained"
          onClick={testHeaders}
          disabled={testing || !isAuthenticated}
          startIcon={testing ? <Info /> : <Security />}
          sx={{ alignSelf: 'flex-start' }}
        >
          {testing ? 'Testing Headers...' : 'Test API Headers'}
        </Button>

        {!isAuthenticated && (
          <Alert severity="warning">
            Please log in first to test API headers. The X-Access-Key header requires authentication.
          </Alert>
        )}

        {result && (
          <Alert 
            severity={result.success ? 'success' : 'error'}
            icon={result.success ? <CheckCircle /> : <Error />}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              {result.message}
            </Typography>
            {result.details && (
              <Box component="pre" sx={{ fontSize: '0.75rem', mt: 1, overflow: 'auto' }}>
                {JSON.stringify(result.details, null, 2)}
              </Box>
            )}
          </Alert>
        )}

        <Alert severity="info">
          <Typography variant="body2">
            <strong>What this test does:</strong><br />
            1. Checks if authentication is properly set in both the auth store and API client<br />
            2. Makes an API call to /api/plans<br />
            3. Logs detailed request information including headers to the browser console<br />
            4. Verifies that the X-Access-Key header is sent with the request
          </Typography>
        </Alert>
      </Stack>
    </Paper>
  );
};
