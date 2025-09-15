import React from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import { usePlans } from '../../hooks/useApi';
import { PlanCard } from './PlanCard';
import { Plan } from '../../types/api';

interface PlansGridProps {
  onPlanSelect?: (plan: Plan) => void;
  selectedPlanId?: string;
  title?: string;
  subtitle?: string;
}

export const PlansGrid: React.FC<PlansGridProps> = ({
  onPlanSelect,
  selectedPlanId,
  title = 'Available Plans',
  subtitle = 'Choose a subscription plan to grant to users',
}) => {
  const { data, isLoading, error } = usePlans();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Failed to load plans. Please try again later.
      </Alert>
    );
  }

  const plans = data?.data?.items || [];

  if (plans.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No plans available at the moment.
      </Alert>
    );
  }

  // Sort plans: highlighted first, then by price
  const sortedPlans = [...plans].sort((a, b) => {
    if (a.highlight && !b.highlight) return -1;
    if (!a.highlight && b.highlight) return 1;
    return a.price - b.price;
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {sortedPlans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.pid}>
            <PlanCard
              plan={plan}
              selected={selectedPlanId === plan.pid}
              onSelect={onPlanSelect}
              disabled={!plan.isActive}
            />
          </Grid>
        ))}
      </Grid>

      {data?.data?.pagination && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {data.data.items.length} of {data.data.pagination.total} plans
          </Typography>
        </Box>
      )}
    </Container>
  );
};
