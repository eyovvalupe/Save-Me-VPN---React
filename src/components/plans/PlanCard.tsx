import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import { Star, CheckCircle } from '@mui/icons-material';
import { Plan } from '../../types/api';

interface PlanCardProps {
  plan: Plan;
  selected?: boolean;
  onSelect?: (plan: Plan) => void;
  disabled?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  selected = false,
  onSelect,
  disabled = false,
}) => {
  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };

  const discountPercentage = plan.originPrice > plan.price 
    ? Math.round(((plan.originPrice - plan.price) / plan.originPrice) * 100)
    : 0;

  return (
    <Card
      sx={{
        position: 'relative',
        height: '100%',
        border: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
        cursor: onSelect && !disabled ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onSelect && !disabled ? {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
          boxShadow: 3,
        } : {},
        opacity: disabled ? 0.6 : 1,
      }}
      onClick={() => onSelect && !disabled && onSelect(plan)}
    >
      {plan.highlight && (
        <Box
          sx={{
            position: 'absolute',
            top: -1,
            left: -1,
            right: -1,
            height: 4,
            background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4)',
            borderRadius: '4px 4px 0 0',
          }}
        />
      )}

      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
            {plan.label}
          </Typography>
          {plan.highlight && (
            <Star sx={{ color: 'warning.main', ml: 1 }} />
          )}
          {selected && (
            <CheckCircle sx={{ color: 'success.main', ml: 1 }} />
          )}
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={`${plan.month} month${plan.month > 1 ? 's' : ''}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          {!plan.isActive && (
            <Chip
              label="Inactive"
              size="small"
              color="error"
              variant="outlined"
            />
          )}
          {discountPercentage > 0 && (
            <Chip
              label={`${discountPercentage}% OFF`}
              size="small"
              color="success"
              variant="filled"
            />
          )}
        </Stack>

        <Box sx={{ mb: 3, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
            <Typography variant="h4" component="span" color="primary">
              ${formatPrice(plan.price)}
            </Typography>
            {plan.originPrice > plan.price && (
              <Typography
                variant="body2"
                component="span"
                sx={{
                  ml: 1,
                  textDecoration: 'line-through',
                  color: 'text.secondary',
                }}
              >
                ${formatPrice(plan.originPrice)}
              </Typography>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            per {plan.month} month{plan.month > 1 ? 's' : ''}
          </Typography>
        </Box>

        {onSelect && (
          <Button
            variant={selected ? 'contained' : 'outlined'}
            fullWidth
            disabled={disabled || !plan.isActive}
            sx={{ mt: 'auto' }}
          >
            {selected ? 'Selected' : 'Select Plan'}
          </Button>
        )}

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Plan ID: {plan.pid}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
