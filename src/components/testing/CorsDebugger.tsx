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
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';
import { NetworkCheck, Error, CheckCircle, Warning } from '@mui/icons-material';
import axios from 'axios';

export const CorsDebugger: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [useProxy, setUseProxy] = useState(true);
  const [customUrl, setCustomUrl] = useState('http://k2.52j.me');

  const testEndpoint = async (url: string, description: string) => {
    try {
      console.log(`Testing ${description}:`, url);
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'X-Access-Key': 'ak-test123' // Test header
        }
      });
      
      return {
        description,
        url,
        success: true,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      };
    } catch (error: any) {
      console.error(`Error testing ${description}:`, error);
      
      return {
        description,
        url,
        success: false,
        error: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        corsError: error.message.includes('CORS') || error.code === 'ERR_NETWORK'
      };
    }
  };

  const runCorsTests = async () => {
    setTesting(true);
    setResults([]);
    
    const tests = [];
    
    if (useProxy) {
      // Test proxy endpoints
      tests.push(
        testEndpoint('/api/plans', 'Proxy: /api/plans'),
        testEndpoint('/api/invite/my-codes/latest', 'Proxy: /api/invite/my-codes/latest')
      );
    } else {
      // Test direct endpoints
      tests.push(
        testEndpoint(`${customUrl}/api/plans`, 'Direct: /api/plans'),
        testEndpoint(`${customUrl}/api/invite/my-codes/latest`, 'Direct: /api/invite/my-codes/latest')
      );
    }
    
    // Test basic connectivity
    tests.push(
      testEndpoint(`${customUrl}`, 'Direct: Root endpoint (connectivity test)')
    );
    
    try {
      const testResults = await Promise.all(tests);
      setResults(testResults);
    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      setTesting(false);
    }
  };

  const getResultIcon = (result: any) => {
    if (result.success) return <CheckCircle color="success" />;
    if (result.corsError) return <Error color="error" />;
    return <Warning color="warning" />;
  };

  const getResultSeverity = (result: any) => {
    if (result.success) return 'success';
    if (result.corsError) return 'error';
    return 'warning';
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NetworkCheck />
          <Typography variant="h6">CORS & Connectivity Debugger</Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          Test different API configurations to diagnose CORS and 404 errors.
        </Typography>

        <Divider />

        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={useProxy}
                onChange={(e) => setUseProxy(e.target.checked)}
              />
            }
            label={useProxy ? "Test Proxy Endpoints" : "Test Direct Endpoints"}
          />
        </Box>

        {!useProxy && (
          <TextField
            fullWidth
            label="API Base URL"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="http://k2.52j.me"
            size="small"
          />
        )}

        <Button
          variant="contained"
          onClick={runCorsTests}
          disabled={testing}
          startIcon={<NetworkCheck />}
          sx={{ alignSelf: 'flex-start' }}
        >
          {testing ? 'Testing...' : 'Run CORS Tests'}
        </Button>

        {results.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Test Results:
            </Typography>
            <Stack spacing={1}>
              {results.map((result, index) => (
                <Alert
                  key={index}
                  severity={getResultSeverity(result)}
                  icon={getResultIcon(result)}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {result.description}
                  </Typography>
                  <Typography variant="caption" display="block">
                    URL: {result.url}
                  </Typography>
                  {result.success ? (
                    <Typography variant="caption" display="block">
                      ✅ Status: {result.status} {result.statusText}
                    </Typography>
                  ) : (
                    <Box>
                      <Typography variant="caption" display="block">
                        ❌ Error: {result.error}
                      </Typography>
                      {result.status && (
                        <Typography variant="caption" display="block">
                          Status: {result.status} {result.statusText}
                        </Typography>
                      )}
                      {result.corsError && (
                        <Typography variant="caption" display="block" color="error">
                          🚫 CORS Error Detected
                        </Typography>
                      )}
                    </Box>
                  )}
                </Alert>
              ))}
            </Stack>
          </Box>
        )}

        <Alert severity="info">
          <Typography variant="body2">
            <strong>How to interpret results:</strong><br />
            • ✅ <strong>Success</strong>: Endpoint is working correctly<br />
            • ⚠️ <strong>Warning</strong>: Connection issues (404, 500, etc.)<br />
            • ❌ <strong>CORS Error</strong>: Cross-origin request blocked<br />
            • 🚫 <strong>Network Error</strong>: Cannot reach the server
          </Typography>
        </Alert>
      </Stack>
    </Paper>
  );
};
