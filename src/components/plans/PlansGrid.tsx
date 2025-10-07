import React from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Container,
  List,
  ListItem,
  ListItemText,
  Paper,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { usePlans } from '../../hooks/useApi';
import { PlanCard } from './PlanCard';
import { Plan } from '../../types/api';

interface PlansGridProps {
  onPlanSelect?: (plan: Plan) => void;
  selectedPlanId?: string;
  title?: string;
  subtitle?: string;
  displayMode?: 'grid' | 'list';
}

export const PlansGrid: React.FC<PlansGridProps> = ({
  onPlanSelect,
  selectedPlanId,
  title = 'Available Plans',
  subtitle = 'Choose a subscription plan to grant to users',
  displayMode = 'list',
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

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };

  const renderGridView = () => (
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
  );

  const renderListView = () => (
    <Paper sx={{ mt: 2 }}>
      <List>
        {sortedPlans.map((plan, index) => (
          <React.Fragment key={plan.pid}>
            <ListItem
              sx={{
                py: 3,
                cursor: onPlanSelect && plan.isActive ? 'pointer' : 'default',
                '&:hover': onPlanSelect && plan.isActive ? {
                  bgcolor: 'action.hover',
                } : {},
                opacity: !plan.isActive ? 0.6 : 1,
              }}
              onClick={() => onPlanSelect && plan.isActive && onPlanSelect(plan)}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h6" component="span">
                      {plan.label || plan.name || `Plan ${plan.pid}`}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {plan.highlight && (
                        <Chip
                          label="Popular"
                          size="small"
                          color="warning"
                          variant="filled"
                        />
                      )}
                      {!plan.isActive && (
                        <Chip
                          label="Inactive"
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                      {plan.originPrice > plan.price && (
                        <Chip
                          label={`${Math.round(((plan.originPrice - plan.price) / plan.originPrice) * 100)}% OFF`}
                          size="small"
                          color="success"
                          variant="filled"
                        />
                      )}
                    </Stack>
                  </Box>
                }
                secondary={
                  <Box>
                    {plan.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {plan.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography variant="h5" color="primary" component="span">
                          ${formatPrice(plan.price)}
                        </Typography>
                        {plan.originPrice > plan.price && (
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{
                              textDecoration: 'line-through',
                              color: 'text.secondary',
                            }}
                          >
                            ${formatPrice(plan.originPrice)}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        for {plan.month} month{plan.month > 1 ? 's' : ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Plan ID: {plan.pid}
                      </Typography>
                    </Box>
                    {plan.features && plan.features.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Features: {plan.features.join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                }
              />
              {onPlanSelect && (
                <Box sx={{ ml: 2 }}>
                  <Button
                    variant={selectedPlanId === plan.pid ? 'contained' : 'outlined'}
                    disabled={!plan.isActive}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlanSelect(plan);
                    }}
                  >
                    {selectedPlanId === plan.pid ? 'Selected' : 'Select'}
                  </Button>
                </Box>
              )}
            </ListItem>
            {index < sortedPlans.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );

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

      {displayMode === 'grid' ? renderGridView() : renderListView()}

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
