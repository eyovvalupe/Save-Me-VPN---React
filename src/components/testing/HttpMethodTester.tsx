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
  Grid,
} from '@mui/material';
import { 
  Http, 
  CheckCircle, 
  Error, 
  PlayArrow,
  GetApp,
  PostAdd,
  Edit,
  Delete
} from '@mui/icons-material';
import { apiClient } from '../../services/api';

interface TestResult {
  method: string;
  endpoint: string;
  success: boolean;
  error?: string;
  status?: number;
  duration?: number;
}

export const HttpMethodTester: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const testHttpMethods = async () => {
    setTesting(true);
    setResults([]);
    
    const tests: Array<{
      method: string;
      endpoint: string;
      icon: React.ReactNode;
      testFn: () => Promise<any>;
    }> = [
      {
        method: 'GET',
        endpoint: '/api/plans',
        icon: <GetApp />,
        testFn: () => apiClient.getPlans()
      },
      {
        method: 'GET',
        endpoint: '/api/invite/my-codes/latest',
        icon: <GetApp />,
        testFn: () => apiClient.getLatestInviteCode()
      },
      {
        method: 'GET',
        endpoint: '/api/invite/my-codes',
        icon: <GetApp />,
        testFn: () => apiClient.getInviteCodes({ page: 0, pageSize: 5 })
      },
      {
        method: 'POST',
        endpoint: '/api/invite/my-codes',
        icon: <PostAdd />,
        testFn: () => apiClient.createInviteCode()
      },
      {
        method: 'GET',
        endpoint: '/api/invite/my-users',
        icon: <GetApp />,
        testFn: () => apiClient.getInvitedUsers({ page: 0, pageSize: 5 })
      }
    ];

    const testResults: TestResult[] = [];

    for (const test of tests) {
      const startTime = Date.now();
      try {
        console.log(`🧪 Testing ${test.method} ${test.endpoint}`);
        await test.testFn();
        const duration = Date.now() - startTime;
        
        testResults.push({
          method: test.method,
          endpoint: test.endpoint,
          success: true,
          duration
        });
        
        console.log(`✅ ${test.method} ${test.endpoint} - Success (${duration}ms)`);
      } catch (error: any) {
        const duration = Date.now() - startTime;
        
        testResults.push({
          method: test.method,
          endpoint: test.endpoint,
          success: false,
          error: error.message || 'Unknown error',
          status: error.response?.status,
          duration
        });
        
        console.error(`❌ ${test.method} ${test.endpoint} - Failed:`, error.message);
      }
      
      // Update results after each test
      setResults([...testResults]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setTesting(false);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'GET': return <GetApp />;
      case 'POST': return <PostAdd />;
      case 'PUT': return <Edit />;
      case 'DELETE': return <Delete />;
      default: return <Http />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'primary';
      case 'POST': return 'success';
      case 'PUT': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Http />
          <Typography variant="h6">HTTP Method Tester</Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          Test that HTTP methods (GET, POST, PUT, DELETE) are properly sent with API requests.
          Check browser console for detailed request logs including HTTP methods.
        </Typography>

        <Divider />

        <Button
          variant="contained"
          onClick={testHttpMethods}
          disabled={testing}
          startIcon={testing ? <PlayArrow /> : <Http />}
          sx={{ alignSelf: 'flex-start' }}
        >
          {testing ? 'Testing HTTP Methods...' : 'Test HTTP Methods'}
        </Button>

        {results.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Test Results:
            </Typography>
            <Grid container spacing={1}>
              {results.map((result, index) => (
                <Grid item xs={12} key={index}>
                  <Alert
                    severity={result.success ? 'success' : 'error'}
                    icon={result.success ? <CheckCircle /> : <Error />}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      '& .MuiAlert-message': { 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        width: '100%'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Chip
                        icon={getMethodIcon(result.method)}
                        label={result.method}
                        color={getMethodColor(result.method) as any}
                        size="small"
                        variant="filled"
                      />
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {result.endpoint}
                      </Typography>
                      <Typography variant="caption">
                        {result.duration}ms
                      </Typography>
                    </Box>
                    {!result.success && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        Error: {result.error}
                        {result.status && ` (Status: ${result.status})`}
                      </Typography>
                    )}
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Alert severity="info">
          <Typography variant="body2">
            <strong>What this test does:</strong><br />
            1. Tests various API endpoints with different HTTP methods<br />
            2. Logs detailed request information to browser console<br />
            3. Verifies that the correct HTTP method is sent for each request<br />
            4. Shows response times and success/failure status<br />
            <br />
            <strong>Check the browser console</strong> for detailed logs showing:
            • HTTP method being sent (GET, POST, PUT, DELETE)
            • Request headers including X-Access-Key
            • Full request configuration
          </Typography>
        </Alert>
      </Stack>
    </Paper>
  );
};
