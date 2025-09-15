import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Grid2 as Grid,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  Error,
  Info,
  Speed,
} from '@mui/icons-material';
import { apiClient, getErrorMessage } from '../../services/api';
import { Plan } from '../../types/api';

export const PlansApiPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [lastTested, setLastTested] = useState<Date | null>(null);

  const testPlansApi = async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const result = await apiClient.getPlans();
      setPlans(result);
      setResponseTime(Date.now() - startTime);
      setLastTested(new Date());
    } catch (err) {
      setError(getErrorMessage(err));
      setResponseTime(Date.now() - startTime);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Plans API Testing
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Endpoint:</strong> GET /api/plans<br />
            <strong>Description:</strong> Retrieves all available subscription plans with pricing and details.<br />
            <strong>Authentication:</strong> Required (X-Access-Key header)
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          <Grid xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Test Controls
                </Typography>
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={testPlansApi}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : <PlayArrow />}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Testing...' : 'Test Plans API'}
                </Button>

                {responseTime && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Speed fontSize="small" />
                    <Typography variant="body2">
                      Response Time: {responseTime}ms
                    </Typography>
                  </Box>
                )}

                {lastTested && (
                  <Typography variant="body2" color="text.secondary">
                    Last tested: {lastTested.toLocaleString()}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Expected Response Format:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
{`{
  "plans": [
    {
      "pid": "string",
      "name": "string",
      "description": "string",
      "price": number,
      "currency": "string",
      "duration": number,
      "durationUnit": "string",
      "features": ["string"],
      "isActive": boolean,
      "discount": {
        "percentage": number,
        "validUntil": "string"
      }
    }
  ]
}`}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Test Results
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Error />
                      <Typography variant="body2">
                        API Error: {error}
                      </Typography>
                    </Box>
                  </Alert>
                )}

                {plans.length > 0 && (
                  <>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle />
                        <Typography variant="body2">
                          Successfully retrieved {plans.length} plans
                        </Typography>
                      </Box>
                    </Alert>

                    <Typography variant="subtitle1" gutterBottom>
                      Available Plans:
                    </Typography>

                    <TableContainer component={Paper} sx={{ mb: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Plan ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Discount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {plans.map((plan) => (
                            <TableRow key={plan.pid}>
                              <TableCell>
                                <Typography variant="body2" fontFamily="monospace">
                                  {plan.pid}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {plan.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {plan.description}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {plan.price} {plan.currency}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {plan.duration} {plan.durationUnit}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={plan.isActive ? 'Active' : 'Inactive'}
                                  color={plan.isActive ? 'success' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {plan.discount ? (
                                  <Chip
                                    label={`${plan.discount.percentage}% off`}
                                    color="secondary"
                                    size="small"
                                  />
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    None
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Typography variant="subtitle2" gutterBottom>
                      Raw Response Data:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 300, overflow: 'auto' }}>
                      <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                        {JSON.stringify({ plans }, null, 2)}
                      </Typography>
                    </Paper>
                  </>
                )}

                {!loading && !error && plans.length === 0 && (
                  <Alert severity="info">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Info />
                      <Typography variant="body2">
                        Click "Test Plans API" to retrieve and display plans data
                      </Typography>
                    </Box>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
