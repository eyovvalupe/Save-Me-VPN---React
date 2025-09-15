import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh,
  CheckCircle,
  Error,
  Warning,
  Speed,
  Api,
} from '@mui/icons-material';
import { apiClient, getErrorMessage } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

interface EndpointStatus {
  id: string;
  name: string;
  path: string;
  method: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  responseTime?: number;
  lastChecked?: Date;
  error?: string;
  statusCode?: number;
}

export const ApiStatusDashboard: React.FC = () => {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    { id: 'plans', name: 'Get Plans', path: '/api/plans', method: 'GET', status: 'pending' },
    { id: 'latest-invite', name: 'Latest Invite Code', path: '/api/invite/my-codes/latest', method: 'GET', status: 'pending' },
    { id: 'invite-codes', name: 'List Invite Codes', path: '/api/invite/my-codes', method: 'GET', status: 'pending' },
    { id: 'create-invite', name: 'Create Invite Code', path: '/api/invite/my-codes', method: 'POST', status: 'pending' },
    { id: 'invited-users', name: 'Invited Users', path: '/api/invite/my-users', method: 'GET', status: 'pending' },
    { id: 'invite-info', name: 'Invite Code Info', path: '/api/invite/code', method: 'GET', status: 'pending' },
  ]);
  
  const [isChecking, setIsChecking] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState<Date | null>(null);
  const { isAuthenticated, accessKey, baseUrl } = useAuthStore();

  const checkEndpoint = async (endpoint: EndpointStatus): Promise<EndpointStatus> => {
    const startTime = Date.now();
    
    try {
      let result;
      
      switch (endpoint.id) {
        case 'plans':
          result = await apiClient.getPlans();
          break;
        case 'latest-invite':
          result = await apiClient.getLatestInviteCode();
          break;
        case 'invite-codes':
          result = await apiClient.getInviteCodes({ page: 0, pageSize: 5 });
          break;
        case 'create-invite':
          // Skip actual creation for status check
          return {
            ...endpoint,
            status: 'warning',
            responseTime: Date.now() - startTime,
            lastChecked: new Date(),
            error: 'Skipped - would create actual invite code',
          };
        case 'invited-users':
          result = await apiClient.getInvitedUsers({ page: 0, pageSize: 5 });
          break;
        case 'invite-info':
          // Skip this test as it requires a specific invite code
          return {
            ...endpoint,
            status: 'warning',
            responseTime: Date.now() - startTime,
            lastChecked: new Date(),
            error: 'Skipped - requires specific invite code parameter',
          };
        default:
          throw new Error('Unknown endpoint');
      }

      return {
        ...endpoint,
        status: 'success',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: undefined,
        statusCode: 200,
      };
    } catch (error: any) {
      return {
        ...endpoint,
        status: 'error',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: getErrorMessage(error),
        statusCode: error.response?.status || 500,
      };
    }
  };

  const checkAllEndpoints = async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsChecking(true);
    const updatedEndpoints: EndpointStatus[] = [];

    for (const endpoint of endpoints) {
      const result = await checkEndpoint(endpoint);
      updatedEndpoints.push(result);
      setEndpoints([...updatedEndpoints, ...endpoints.slice(updatedEndpoints.length)]);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setEndpoints(updatedEndpoints);
    setLastFullCheck(new Date());
    setIsChecking(false);
  };

  const checkSingleEndpoint = async (endpointId: string) => {
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (!endpoint) return;

    const updatedEndpoint = await checkEndpoint(endpoint);
    setEndpoints(prev => prev.map(e => e.id === endpointId ? updatedEndpoint : e));
  };

  useEffect(() => {
    if (isAuthenticated) {
      checkAllEndpoints();
    }
  }, [isAuthenticated]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      default:
        return <Api color="action" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const successCount = endpoints.filter(e => e.status === 'success').length;
  const errorCount = endpoints.filter(e => e.status === 'error').length;
  const warningCount = endpoints.filter(e => e.status === 'warning').length;
  const avgResponseTime = endpoints
    .filter(e => e.responseTime)
    .reduce((sum, e) => sum + (e.responseTime || 0), 0) / endpoints.filter(e => e.responseTime).length;

  if (!isAuthenticated) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          API Status Dashboard
        </Typography>
        <Alert severity="warning">
          Please log in with your access key to check API status.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          API Status Dashboard
        </Typography>
        <Button
          variant="contained"
          onClick={checkAllEndpoints}
          disabled={isChecking}
          startIcon={<Refresh />}
        >
          {isChecking ? 'Checking...' : 'Refresh All'}
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle color="success" />
                <Box>
                  <Typography variant="h4" color="success.main">
                    {successCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Successful
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Error color="error" />
                <Box>
                  <Typography variant="h4" color="error.main">
                    {errorCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Failed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Warning color="warning" />
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {warningCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Warnings
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Speed color="primary" />
                <Box>
                  <Typography variant="h4" color="primary.main">
                    {avgResponseTime ? Math.round(avgResponseTime) : '-'}ms
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Response
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Connection Info
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Base URL:
              </Typography>
              <Typography variant="body1">
                {baseUrl}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Access Key:
              </Typography>
              <Typography variant="body1">
                {accessKey.substring(0, 8)}...
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Last Full Check:
              </Typography>
              <Typography variant="body1">
                {lastFullCheck ? lastFullCheck.toLocaleString() : 'Never'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {isChecking && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Checking API endpoints...
          </Typography>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Endpoint</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Path</TableCell>
              <TableCell>Response Time</TableCell>
              <TableCell>Last Checked</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {endpoints.map((endpoint) => (
              <TableRow key={endpoint.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(endpoint.status)}
                    <Chip
                      label={endpoint.status.toUpperCase()}
                      color={getStatusColor(endpoint.status) as any}
                      size="small"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {endpoint.name}
                  </Typography>
                  {endpoint.error && (
                    <Typography variant="caption" color="error">
                      {endpoint.error}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={endpoint.method}
                    color={endpoint.method === 'GET' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {endpoint.path}
                  </Typography>
                </TableCell>
                <TableCell>
                  {endpoint.responseTime ? `${endpoint.responseTime}ms` : '-'}
                </TableCell>
                <TableCell>
                  {endpoint.lastChecked ? endpoint.lastChecked.toLocaleTimeString() : '-'}
                </TableCell>
                <TableCell>
                  <Tooltip title="Check this endpoint">
                    <IconButton
                      size="small"
                      onClick={() => checkSingleEndpoint(endpoint.id)}
                    >
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
