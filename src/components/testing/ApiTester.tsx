import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore,
  PlayArrow,
  CheckCircle,
  Error,
  Warning,
} from '@mui/icons-material';
import { apiClient, getErrorMessage } from '../../services/api';

interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requiresAuth: boolean;
  parameters?: { [key: string]: any };
  testFunction: () => Promise<any>;
}

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  responseTime?: number;
  timestamp: Date;
}

export const ApiTester: React.FC = () => {
  const [testResults, setTestResults] = useState<{ [key: string]: TestResult }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [testParams, setTestParams] = useState<{ [key: string]: any }>({});

  const endpoints: ApiEndpoint[] = [
    {
      id: 'plans',
      name: 'Get Plans',
      method: 'GET',
      path: '/api/plans',
      description: 'Retrieve all available subscription plans',
      requiresAuth: true,
      testFunction: () => apiClient.getPlans(),
    },
    {
      id: 'latest-invite-code',
      name: 'Get Latest Invite Code',
      method: 'GET',
      path: '/api/invite/my-codes/latest',
      description: 'Get or create the latest invite code',
      requiresAuth: true,
      testFunction: () => apiClient.getLatestInviteCode(),
    },
    {
      id: 'invite-codes',
      name: 'List Invite Codes',
      method: 'GET',
      path: '/api/invite/my-codes',
      description: 'Get all invite codes with pagination',
      requiresAuth: true,
      parameters: { page: 0, pageSize: 10 },
      testFunction: () => apiClient.getInviteCodes({ page: 0, pageSize: 10 }),
    },
    {
      id: 'create-invite-code',
      name: 'Create Invite Code',
      method: 'POST',
      path: '/api/invite/my-codes',
      description: 'Create a new invite code',
      requiresAuth: true,
      testFunction: () => apiClient.createInviteCode(),
    },
    {
      id: 'invited-users',
      name: 'Get Invited Users',
      method: 'GET',
      path: '/api/invite/my-users',
      description: 'Get list of users invited by the distributor',
      requiresAuth: true,
      parameters: { page: 0, pageSize: 10 },
      testFunction: () => apiClient.getInvitedUsers({ page: 0, pageSize: 10 }),
    },
    {
      id: 'grant-subscription',
      name: 'Grant Subscription',
      method: 'POST',
      path: '/api/retail/grant-subscription',
      description: 'Grant a subscription to a user (DRY RUN)',
      requiresAuth: true,
      parameters: {
        email: 'test@example.com',
        inviteCode: 'TEST123',
        planPid: 'monthly_basic',
        quantity: 1,
        dryRun: true,
      },
      testFunction: () => apiClient.grantSubscription({
        email: testParams['grant-subscription']?.email || 'test@example.com',
        inviteCode: testParams['grant-subscription']?.inviteCode || 'TEST123',
        planPid: testParams['grant-subscription']?.planPid || 'monthly_basic',
        quantity: testParams['grant-subscription']?.quantity || 1,
        dryRun: true,
      }),
    },
  ];

  const runTest = async (endpoint: ApiEndpoint) => {
    setLoading(prev => ({ ...prev, [endpoint.id]: true }));
    const startTime = Date.now();

    try {
      const result = await endpoint.testFunction();
      const responseTime = Date.now() - startTime;

      setTestResults(prev => ({
        ...prev,
        [endpoint.id]: {
          success: true,
          data: result,
          responseTime,
          timestamp: new Date(),
        },
      }));
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setTestResults(prev => ({
        ...prev,
        [endpoint.id]: {
          success: false,
          error: getErrorMessage(error),
          responseTime,
          timestamp: new Date(),
        },
      }));
    } finally {
      setLoading(prev => ({ ...prev, [endpoint.id]: false }));
    }
  };

  const runAllTests = async () => {
    for (const endpoint of endpoints) {
      await runTest(endpoint);
      // Add small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusIcon = (result?: TestResult) => {
    if (!result) return <Warning color="action" />;
    return result.success ? <CheckCircle color="success" /> : <Error color="error" />;
  };

  const getStatusColor = (result?: TestResult) => {
    if (!result) return 'default';
    return result.success ? 'success' : 'error';
  };

  const updateTestParam = (endpointId: string, paramKey: string, value: any) => {
    setTestParams(prev => ({
      ...prev,
      [endpointId]: {
        ...prev[endpointId],
        [paramKey]: value,
      },
    }));
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          API Testing Dashboard
        </Typography>
        <Button
          variant="contained"
          onClick={runAllTests}
          startIcon={<PlayArrow />}
          disabled={Object.values(loading).some(Boolean)}
        >
          Run All Tests
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        This dashboard allows you to test all API endpoints. Make sure you have a valid access key configured.
        The Grant Subscription test uses dry run mode to avoid creating actual subscriptions.
      </Alert>

      <Grid container spacing={2}>
        {endpoints.map((endpoint) => {
          const result = testResults[endpoint.id];
          const isLoading = loading[endpoint.id];

          return (
            <Grid item xs={12} key={endpoint.id}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    {getStatusIcon(result)}
                    <Chip
                      label={endpoint.method}
                      color={endpoint.method === 'GET' ? 'primary' : 'secondary'}
                      size="small"
                    />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {endpoint.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {endpoint.path}
                    </Typography>
                    {result && (
                      <Chip
                        label={result.success ? 'PASS' : 'FAIL'}
                        color={getStatusColor(result)}
                        size="small"
                      />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {endpoint.description}
                    </Typography>
                    
                    {endpoint.requiresAuth && (
                      <Chip label="Requires Authentication" color="warning" size="small" sx={{ mb: 2 }} />
                    )}

                    {endpoint.parameters && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Test Parameters:
                        </Typography>
                        <Grid container spacing={2}>
                          {Object.entries(endpoint.parameters).map(([key, defaultValue]) => (
                            <Grid item xs={12} sm={6} key={key}>
                              <TextField
                                fullWidth
                                size="small"
                                label={key}
                                value={testParams[endpoint.id]?.[key] ?? defaultValue}
                                onChange={(e) => updateTestParam(endpoint.id, key, e.target.value)}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    <Button
                      variant="contained"
                      onClick={() => runTest(endpoint)}
                      disabled={isLoading}
                      startIcon={isLoading ? <CircularProgress size={16} /> : <PlayArrow />}
                      sx={{ mb: 2 }}
                    >
                      {isLoading ? 'Testing...' : 'Test Endpoint'}
                    </Button>

                    {result && (
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2">
                            Test Result
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {result.timestamp.toLocaleString()} ({result.responseTime}ms)
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        
                        {result.success ? (
                          <Box>
                            <Alert severity="success" sx={{ mb: 2 }}>
                              API call successful!
                            </Alert>
                            <Typography variant="subtitle2" gutterBottom>
                              Response Data:
                            </Typography>
                            <Box
                              component="pre"
                              sx={{
                                bgcolor: 'grey.100',
                                p: 2,
                                borderRadius: 1,
                                overflow: 'auto',
                                maxHeight: 300,
                                fontSize: '0.875rem',
                              }}
                            >
                              {JSON.stringify(result.data, null, 2)}
                            </Box>
                          </Box>
                        ) : (
                          <Alert severity="error">
                            <Typography variant="subtitle2" gutterBottom>
                              Error:
                            </Typography>
                            <Typography variant="body2">
                              {result.error}
                            </Typography>
                          </Alert>
                        )}
                      </Paper>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
