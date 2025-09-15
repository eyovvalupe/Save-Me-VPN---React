import React, { useState, useEffect } from 'react';
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
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  Error,
  Warning,
  Speed,
} from '@mui/icons-material';
import { apiClient, getErrorMessage } from '../../services/api';
import { Plan, GrantSubscriptionRequest, GrantSubscriptionResponse } from '../../types/api';

export const GrantSubscriptionApiPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [result, setResult] = useState<GrantSubscriptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [lastTested, setLastTested] = useState<Date | null>(null);

  // Form state
  const [formData, setFormData] = useState<GrantSubscriptionRequest>({
    email: 'test@example.com',
    inviteCode: '',
    planPid: '',
    quantity: 1,
    dryRun: true,
  });

  // Load plans on component mount
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plansData = await apiClient.getPlans();
        setPlans(plansData);
        if (plansData.length > 0) {
          setFormData(prev => ({ ...prev, planPid: plansData[0].pid }));
        }
      } catch (err) {
        console.error('Failed to load plans:', err);
      }
    };

    loadPlans();
  }, []);

  // Load latest invite code
  useEffect(() => {
    const loadLatestCode = async () => {
      try {
        const codeData = await apiClient.getLatestInviteCode();
        setFormData(prev => ({ ...prev, inviteCode: codeData.code }));
      } catch (err) {
        console.error('Failed to load latest invite code:', err);
      }
    };

    loadLatestCode();
  }, []);

  const testGrantSubscription = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const startTime = Date.now();

    try {
      const response = await apiClient.grantSubscription(formData);
      setResult(response);
      setResponseTime(Date.now() - startTime);
      setLastTested(new Date());
    } catch (err) {
      setError(getErrorMessage(err));
      setResponseTime(Date.now() - startTime);
      setLastTested(new Date());
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof GrantSubscriptionRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'quantity' ? parseInt(value) || 1 : value,
    }));
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Grant Subscription API Testing
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Endpoint:</strong> POST /api/retail/grant-subscription<br />
            <strong>Description:</strong> Grant a subscription to a user via invite code.<br />
            <strong>Authentication:</strong> Required (X-Access-Key header)<br />
            <strong>Note:</strong> Use dry run mode for testing to avoid creating actual subscriptions.
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Request Parameters
                </Typography>
                
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  sx={{ mb: 2 }}
                  helperText="Email address of the user to grant subscription to"
                />

                <TextField
                  fullWidth
                  label="Invite Code"
                  value={formData.inviteCode}
                  onChange={handleInputChange('inviteCode')}
                  sx={{ mb: 2 }}
                  helperText="Invite code to use for the grant"
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Plan</InputLabel>
                  <Select
                    value={formData.planPid}
                    label="Plan"
                    onChange={handleInputChange('planPid')}
                  >
                    {plans.map((plan) => (
                      <MenuItem key={plan.pid} value={plan.pid}>
                        {plan.name} - {plan.price} {plan.currency}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Quantity (months)"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange('quantity')}
                  sx={{ mb: 2 }}
                  inputProps={{ min: 1, max: 12 }}
                  helperText="Number of months (1-12)"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.dryRun}
                      onChange={handleInputChange('dryRun')}
                    />
                  }
                  label="Dry Run Mode"
                  sx={{ mb: 2 }}
                />

                <Alert severity={formData.dryRun ? "info" : "warning"} sx={{ mb: 2 }}>
                  {formData.dryRun 
                    ? "Dry run mode: No actual subscription will be created"
                    : "⚠️ LIVE MODE: This will create an actual subscription!"
                  }
                </Alert>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={testGrantSubscription}
                  disabled={loading || !formData.email || !formData.inviteCode || !formData.planPid}
                  startIcon={loading ? <CircularProgress size={16} /> : <PlayArrow />}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Testing...' : 'Test Grant Subscription'}
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
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} md={6}>
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

                {result && (
                  <>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle />
                        <Typography variant="body2">
                          {formData.dryRun ? 'Dry run completed successfully' : 'Subscription granted successfully'}
                        </Typography>
                      </Box>
                    </Alert>

                    <Typography variant="subtitle2" gutterBottom>
                      Response Details:
                    </Typography>

                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                      <Grid container spacing={2}>
                        <Grid xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Success:
                          </Typography>
                          <Typography variant="body1">
                            {result.success ? 'Yes' : 'No'}
                          </Typography>
                        </Grid>
                        <Grid xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Transaction ID:
                          </Typography>
                          <Typography variant="body1" fontFamily="monospace">
                            {result.transactionId || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Message:
                          </Typography>
                          <Typography variant="body1">
                            {result.message}
                          </Typography>
                        </Grid>
                        {result.subscriptionDetails && (
                          <Grid xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Subscription Details:
                            </Typography>
                            <Typography variant="body1">
                              Plan: {result.subscriptionDetails.planName}<br />
                              Duration: {result.subscriptionDetails.duration} months<br />
                              Total Cost: {result.subscriptionDetails.totalCost} {result.subscriptionDetails.currency}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>

                    <Typography variant="subtitle2" gutterBottom>
                      Raw Response Data:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 300, overflow: 'auto' }}>
                      <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                        {JSON.stringify(result, null, 2)}
                      </Typography>
                    </Paper>
                  </>
                )}

                {!loading && !error && !result && (
                  <Alert severity="info">
                    <Typography variant="body2">
                      Fill in the parameters and click "Test Grant Subscription" to test the API
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Expected Request/Response Format
            </Typography>
            
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Request Body:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
{`{
  "email": "user@example.com",
  "inviteCode": "ABC123",
  "planPid": "monthly_basic",
  "quantity": 1,
  "dryRun": true
}`}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Response Body:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
{`{
  "success": true,
  "message": "Subscription granted",
  "transactionId": "txn_123",
  "subscriptionDetails": {
    "planName": "Basic Monthly",
    "duration": 1,
    "totalCost": 9.99,
    "currency": "USD"
  }
}`}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
