import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Grid,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ExpandMore,
  PlayArrow,
  Clear,
  ContentCopy,
  Download,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuthStore } from '../../stores/authStore';

interface RequestLog {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: any;
  };
  error?: string;
  duration: number;
}

export const ApiDebugger: React.FC = () => {
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([]);
  const [isLogging, setIsLogging] = useState(true);
  const [customRequest, setCustomRequest] = useState({
    method: 'GET',
    endpoint: '/api/plans',
    headers: '{}',
    body: '{}',
  });
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const { accessKey, baseUrl } = useAuthStore();

  // Intercept API calls (this would be integrated with the actual API client)
  useEffect(() => {
    if (!isLogging) return;

    // This is a mock implementation - in a real app, you'd integrate with axios interceptors
    const mockApiCall = () => {
      const mockLog: RequestLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        method: 'GET',
        url: `${baseUrl}/api/plans`,
        headers: {
          'X-Access-Key': showSensitiveData ? accessKey : '***',
          'Content-Type': 'application/json',
        },
        response: {
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json',
          },
          data: { plans: [] },
        },
        duration: Math.floor(Math.random() * 500) + 100,
      };

      setRequestLogs(prev => [mockLog, ...prev.slice(0, 49)]); // Keep last 50 logs
    };

    // Simulate some API calls for demo
    const interval = setInterval(mockApiCall, 10000);
    return () => clearInterval(interval);
  }, [isLogging, baseUrl, accessKey, showSensitiveData]);

  const executeCustomRequest = async () => {
    const startTime = Date.now();
    
    try {
      const headers: Record<string, string> = {
        'X-Access-Key': accessKey,
        'Content-Type': 'application/json',
        ...JSON.parse(customRequest.headers),
      };

      const requestOptions: RequestInit = {
        method: customRequest.method,
        headers,
      };

      if (customRequest.method !== 'GET' && customRequest.body.trim()) {
        requestOptions.body = customRequest.body;
      }

      const response = await fetch(`${baseUrl}${customRequest.endpoint}`, requestOptions);
      const responseData = await response.json();
      const duration = Date.now() - startTime;

      const log: RequestLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        method: customRequest.method,
        url: `${baseUrl}${customRequest.endpoint}`,
        headers: showSensitiveData ? headers : { ...headers, 'X-Access-Key': '***' },
        body: customRequest.method !== 'GET' ? JSON.parse(customRequest.body || '{}') : undefined,
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: responseData,
        },
        duration,
      };

      setRequestLogs(prev => [log, ...prev.slice(0, 49)]);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      const log: RequestLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        method: customRequest.method,
        url: `${baseUrl}${customRequest.endpoint}`,
        headers: showSensitiveData ? JSON.parse(customRequest.headers) : { 'X-Access-Key': '***' },
        body: customRequest.method !== 'GET' ? JSON.parse(customRequest.body || '{}') : undefined,
        error: error.message,
        duration,
      };

      setRequestLogs(prev => [log, ...prev.slice(0, 49)]);
    }
  };

  const clearLogs = () => {
    setRequestLogs([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(requestLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'default';
    if (status >= 200 && status < 300) return 'success';
    if (status >= 400 && status < 500) return 'warning';
    if (status >= 500) return 'error';
    return 'default';
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        API Debugger & Request Inspector
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Monitor and debug API requests in real-time. Execute custom requests and inspect responses.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Custom Request
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    fullWidth
                    label="Method"
                    value={customRequest.method}
                    onChange={(e) => setCustomRequest(prev => ({ ...prev, method: e.target.value }))}
                    SelectProps={{ native: true }}
                    size="small"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <TextField
                    fullWidth
                    label="Endpoint"
                    value={customRequest.endpoint}
                    onChange={(e) => setCustomRequest(prev => ({ ...prev, endpoint: e.target.value }))}
                    size="small"
                    placeholder="/api/plans"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Headers (JSON)"
                    value={customRequest.headers}
                    onChange={(e) => setCustomRequest(prev => ({ ...prev, headers: e.target.value }))}
                    multiline
                    rows={2}
                    size="small"
                    placeholder='{"Custom-Header": "value"}'
                  />
                </Grid>
                {customRequest.method !== 'GET' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Request Body (JSON)"
                      value={customRequest.body}
                      onChange={(e) => setCustomRequest(prev => ({ ...prev, body: e.target.value }))}
                      multiline
                      rows={3}
                      size="small"
                      placeholder='{"key": "value"}'
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={executeCustomRequest}
                    startIcon={<PlayArrow />}
                    fullWidth
                  >
                    Execute Request
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Request Logging Controls
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isLogging}
                      onChange={(e) => setIsLogging(e.target.checked)}
                    />
                  }
                  label="Enable Request Logging"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={showSensitiveData}
                      onChange={(e) => setShowSensitiveData(e.target.checked)}
                    />
                  }
                  label="Show Sensitive Data (Access Keys)"
                />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={clearLogs}
                    startIcon={<Clear />}
                    size="small"
                  >
                    Clear Logs
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={exportLogs}
                    startIcon={<Download />}
                    size="small"
                    disabled={requestLogs.length === 0}
                  >
                    Export Logs
                  </Button>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Total Requests: {requestLogs.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Request History
              </Typography>

              {requestLogs.length === 0 ? (
                <Alert severity="info">
                  No requests logged yet. Execute a custom request or enable logging to see API calls.
                </Alert>
              ) : (
                <Box>
                  {requestLogs.map((log) => (
                    <Accordion key={log.id}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Chip
                            label={log.method}
                            color={log.method === 'GET' ? 'primary' : 'secondary'}
                            size="small"
                          />
                          {log.response && (
                            <Chip
                              label={log.response.status}
                              color={getStatusColor(log.response.status)}
                              size="small"
                            />
                          )}
                          {log.error && (
                            <Chip label="ERROR" color="error" size="small" />
                          )}
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            {log.url}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.timestamp.toLocaleTimeString()} ({log.duration}ms)
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Request
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                              <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                                {`${log.method} ${log.url}

Headers:
${JSON.stringify(log.headers, null, 2)}

${log.body ? `Body:
${JSON.stringify(log.body, null, 2)}` : ''}`}
                              </Typography>
                              <Tooltip title="Copy request">
                                <IconButton
                                  size="small"
                                  onClick={() => copyToClipboard(JSON.stringify({
                                    method: log.method,
                                    url: log.url,
                                    headers: log.headers,
                                    body: log.body,
                                  }, null, 2))}
                                >
                                  <ContentCopy fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Paper>
                          </Grid>
                          
                          <Grid xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Response
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                              {log.error ? (
                                <Typography variant="body2" color="error">
                                  Error: {log.error}
                                </Typography>
                              ) : log.response ? (
                                <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                                  {`Status: ${log.response.status} ${log.response.statusText}

Headers:
${JSON.stringify(log.response.headers, null, 2)}

Body:
${JSON.stringify(log.response.data, null, 2)}`}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No response data
                                </Typography>
                              )}
                              <Tooltip title="Copy response">
                                <IconButton
                                  size="small"
                                  onClick={() => copyToClipboard(JSON.stringify(log.response || log.error, null, 2))}
                                >
                                  <ContentCopy fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Paper>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
