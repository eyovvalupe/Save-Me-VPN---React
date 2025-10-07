import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import {
  CardGiftcard,
  Email,
  Assignment,
  Numbers,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api';
import { GrantSubscriptionRequest, Plan } from '../../types/api';

const schema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  planPid: yup
    .string()
    .required('Please select a plan'),
  quantity: yup
    .number()
    .required('Quantity is required')
    .min(1, 'Quantity must be at least 1')
    .integer('Quantity must be a whole number'),
  dryRun: yup.boolean(),
});

type FormData = yup.InferType<typeof schema>;

export const GrantSubscription: React.FC = () => {
  const [grantResult, setGrantResult] = useState<any>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      planPid: '',
      quantity: 1,
      dryRun: false,
    },
  });

  const watchedValues = watch();

  // Query for available plans
  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: ['plans'],
    queryFn: () => apiClient.getPlans(),
  });

  // Mutation for granting subscription
  const grantMutation = useMutation({
    mutationFn: (data: GrantSubscriptionRequest) => apiClient.grantSubscription(data),
    onSuccess: (result) => {
      setGrantResult(result);
      if (!watchedValues.dryRun) {
        reset(); // Reset form only if not dry run
      }
    },
    onError: (error) => {
      console.error('Grant subscription error:', error);
    },
  });

  const onSubmit = (data: FormData) => {
    setGrantResult(null);
    grantMutation.mutate(data);
  };

  const selectedPlan = plansData?.data?.items?.find(
    (plan: Plan) => plan.pid === watchedValues.planPid
  );

  const calculateTotal = () => {
    if (!selectedPlan || !watchedValues.quantity) return 0;
    return selectedPlan.price * watchedValues.quantity;
  };

  const plans = plansData?.data?.items || [];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Grant Subscription
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Grant subscription plans to users on behalf of your distributor account.
      </Typography>

      <Stack spacing={3}>
        {/* Plans Error */}
        {plansError && (
          <Alert severity="error">
            Failed to load plans: {(plansError as Error).message}
          </Alert>
        )}

        {/* Grant Form */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <CardGiftcard />
            <Typography variant="h6">Grant Details</Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {/* Email Field */}
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="User Email"
                    placeholder="user@example.com"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    fullWidth
                  />
                )}
              />

              {/* Plan Selection */}
              <Controller
                name="planPid"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.planPid}>
                    <InputLabel>Select Plan</InputLabel>
                    <Select
                      {...field}
                      label="Select Plan"
                      disabled={plansLoading}
                      startAdornment={<Assignment sx={{ mr: 1, color: 'text.secondary' }} />}
                    >
                      {plans.map((plan: Plan) => (
                        <MenuItem key={plan.pid} value={plan.pid}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <Typography sx={{ flexGrow: 1 }}>
                              {plan.label || plan.name}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Typography variant="body2" color="text.secondary">
                                ${(plan.price / 100).toFixed(2)}
                              </Typography>
                              {plan.highlight && (
                                <Chip label="Popular" color="primary" size="small" />
                              )}
                              {!plan.isActive && (
                                <Chip label="Inactive" color="error" size="small" />
                              )}
                            </Stack>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.planPid && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.planPid.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />

              {/* Quantity Field */}
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Quantity"
                    type="number"
                    inputProps={{ min: 1 }}
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message || 'Number of plan periods to grant'}
                    InputProps={{
                      startAdornment: <Numbers sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    fullWidth
                  />
                )}
              />

              {/* Dry Run Switch */}
              <Controller
                name="dryRun"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warning fontSize="small" />
                        <Typography>
                          Dry Run (Validation only - no actual grant)
                        </Typography>
                      </Box>
                    }
                  />
                )}
              />

              <Divider />

              {/* Summary */}
              {selectedPlan && (
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>Grant Summary</Typography>
                  <Stack spacing={1}>
                    <Typography>
                      <strong>Plan:</strong> {selectedPlan.label || selectedPlan.name}
                    </Typography>
                    <Typography>
                      <strong>Duration:</strong> {selectedPlan.month} month(s) × {watchedValues.quantity} = {selectedPlan.month * watchedValues.quantity} month(s)
                    </Typography>
                    <Typography>
                      <strong>Unit Price:</strong> ${(selectedPlan.price / 100).toFixed(2)}
                    </Typography>
                    <Typography>
                      <strong>Total Amount:</strong> ${(calculateTotal() / 100).toFixed(2)}
                    </Typography>
                    {watchedValues.dryRun && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        This is a dry run - no actual grant will be created
                      </Alert>
                    )}
                  </Stack>
                </Paper>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={grantMutation.isPending || plansLoading}
                startIcon={
                  grantMutation.isPending ? (
                    <CircularProgress size={20} />
                  ) : watchedValues.dryRun ? (
                    <Warning />
                  ) : (
                    <CheckCircle />
                  )
                }
              >
                {grantMutation.isPending
                  ? 'Processing...'
                  : watchedValues.dryRun
                  ? 'Validate Grant'
                  : 'Grant Subscription'
                }
              </Button>
            </Stack>
          </form>
        </Paper>

        {/* Grant Error */}
        {grantMutation.error && (
          <Alert severity="error">
            Grant failed: {(grantMutation.error as Error).message}
          </Alert>
        )}

        {/* Grant Result */}
        {grantResult && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CheckCircle color="success" />
              <Typography variant="h6" color="success.main">
                {watchedValues.dryRun ? 'Validation Successful' : 'Grant Successful'}
              </Typography>
            </Box>

            <Stack spacing={2}>
              {/* User Info */}
              <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                <Typography variant="subtitle1" gutterBottom>User Information</Typography>
                <Stack spacing={1}>
                  <Typography><strong>UUID:</strong> {grantResult.data.user.uuid}</Typography>
                  <Typography><strong>Expires At:</strong> {new Date(grantResult.data.user.expiredAt * 1000).toLocaleString()}</Typography>
                  <Typography><strong>First Order Done:</strong> {grantResult.data.user.isFirstOrderDone ? 'Yes' : 'No'}</Typography>
                </Stack>
              </Paper>

              {/* Grant Info */}
              <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                <Typography variant="subtitle1" gutterBottom>Grant Information</Typography>
                <Stack spacing={1}>
                  <Typography><strong>Grant UUID:</strong> {grantResult.data.grant.uuid}</Typography>
                  <Typography><strong>Plan:</strong> {grantResult.data.grant.planPid}</Typography>
                  <Typography><strong>Quantity:</strong> {grantResult.data.grant.quantity}</Typography>
                  <Typography><strong>Amount:</strong> ${(grantResult.data.grant.amount / 100).toFixed(2)}</Typography>
                  <Typography><strong>Granted At:</strong> {new Date(grantResult.data.grant.grantedAt * 1000).toLocaleString()}</Typography>
                  {watchedValues.dryRun && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      This was a validation run - no actual grant was created
                    </Alert>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};
