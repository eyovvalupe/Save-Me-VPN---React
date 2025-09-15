import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Divider,
  Alert,
  FormControlLabel,
  Switch,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import { Send, Email, Code, Payment } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useGrantSubscription, useLatestInviteCode } from '../../hooks/useApi';
import { PlansGrid } from '../plans/PlansGrid';
import { Plan, GrantSubscriptionRequest } from '../../types/api';

interface GrantFormData {
  email: string;
  inviteCode: string;
  planPid: string;
  quantity: number;
  dryRun?: boolean;
}

const schema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  inviteCode: yup
    .string()
    .required('Invite code is required')
    .min(3, 'Invite code must be at least 3 characters'),
  planPid: yup
    .string()
    .required('Please select a plan'),
  quantity: yup
    .number()
    .required('Quantity is required')
    .min(1, 'Quantity must be at least 1')
    .max(12, 'Quantity cannot exceed 12'),
  dryRun: yup.boolean().optional(),
});

const steps = ['User Details', 'Select Plan', 'Review & Submit'];

export const GrantSubscriptionForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  const grantMutation = useGrantSubscription();
  const { data: latestInviteCode } = useLatestInviteCode();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<GrantFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      inviteCode: '',
      planPid: '',
      quantity: 1,
      dryRun: false,
    },
  });

  const watchedValues = watch();

  // Auto-fill invite code when latest code is loaded
  React.useEffect(() => {
    if (latestInviteCode?.data?.code && !watchedValues.inviteCode) {
      setValue('inviteCode', latestInviteCode.data.code);
    }
  }, [latestInviteCode, setValue, watchedValues.inviteCode]);

  const handleNext = async () => {
    let isValid = false;
    
    switch (activeStep) {
      case 0:
        isValid = await trigger(['email', 'inviteCode']);
        break;
      case 1:
        isValid = await trigger(['planPid']);
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setValue('planPid', plan.pid);
    trigger('planPid');
  };

  const onSubmit = async (data: GrantFormData) => {
    try {
      await grantMutation.mutateAsync(data);
      // Reset form after successful submission
      setActiveStep(0);
      setSelectedPlan(null);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const calculateTotal = () => {
    if (!selectedPlan) return 0;
    return (selectedPlan.price * watchedValues.quantity) / 100;
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="User Email"
                    placeholder="user@example.com"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="inviteCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Invite Code"
                    placeholder="Enter invite code"
                    error={!!errors.inviteCode}
                    helperText={errors.inviteCode?.message || 'Latest invite code will be auto-filled'}
                    InputProps={{
                      startAdornment: <Code sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <PlansGrid
              onPlanSelect={handlePlanSelect}
              selectedPlanId={watchedValues.planPid}
              title="Select Plan"
              subtitle="Choose the subscription plan to grant"
            />
            {errors.planPid && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.planPid.message}
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Grant Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email:
                    </Typography>
                    <Typography variant="body1">{watchedValues.email}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Invite Code:
                    </Typography>
                    <Typography variant="body1">{watchedValues.inviteCode}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Plan:
                    </Typography>
                    <Typography variant="body1">{selectedPlan?.label}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Quantity:
                    </Typography>
                    <Typography variant="body1">{watchedValues.quantity} month(s)</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" color="primary">
                      Total: ${calculateTotal().toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Quantity (Months)"
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message}
                    inputProps={{ min: 1, max: 12 }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="dryRun"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Dry Run (Test mode - no actual grant)"
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Grant Subscription
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={grantMutation.isPending}
                  startIcon={<Send />}
                >
                  {grantMutation.isPending ? 'Granting...' : 'Grant Subscription'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};
