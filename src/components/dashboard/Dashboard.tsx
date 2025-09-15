import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Paper,
  Stack,
  Chip,
  Button,
} from '@mui/material';
import {
  People,
  Code,
  Payment,
  Download,
  ShoppingCart,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLatestInviteCode, useInvitedUsers, usePlans } from '../../hooks/useApi';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: `${color}.main`,
            color: 'white',
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: latestInviteCode, isLoading: isLoadingCode } = useLatestInviteCode();
  const { data: usersData, isLoading: isLoadingUsers } = useInvitedUsers({ pageSize: 100 });
  const { data: plansData, isLoading: isLoadingPlans } = usePlans();

  const inviteCode = latestInviteCode?.data;
  const users = usersData?.data?.items || [];
  const plans = plansData?.data?.items || [];

  const activeUsers = users.filter(user => user.expiredAt * 1000 > Date.now()).length;
  const totalDownloads = inviteCode?.downloadCount || 0;
  const totalPurchases = inviteCode?.purchaseCount || 0;
  const activePlans = plans.filter(plan => plan.isActive).length;

  if (isLoadingCode || isLoadingUsers || isLoadingPlans) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your VPN distributor dashboard. Here's an overview of your activity.
        </Typography>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
        gap: 3,
        mb: 4
      }}>
        <StatCard
          title="Total Users"
          value={users.length}
          icon={<People />}
          color="primary"
          subtitle={`${activeUsers} active`}
        />
        <StatCard
          title="Downloads"
          value={totalDownloads}
          icon={<Download />}
          color="success"
          subtitle="via invite codes"
        />
        <StatCard
          title="Purchases"
          value={totalPurchases}
          icon={<ShoppingCart />}
          color="warning"
          subtitle="conversions"
        />
        <StatCard
          title="Active Plans"
          value={activePlans}
          icon={<Payment />}
          color="secondary"
          subtitle={`of ${plans.length} total`}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Latest Invite Code Performance
            </Typography>
            
            {inviteCode ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Chip label={inviteCode.code} color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {inviteCode.remark}
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                      <Download color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h5" color="primary">
                        {inviteCode.downloadCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Downloads
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        +{inviteCode.downloadReward} days reward
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                      <ShoppingCart color="success" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h5" color="success.main">
                        {inviteCode.purchaseCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Purchases
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        +{inviteCode.purchaseReward} days reward
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/invites')}
                  >
                    Manage Invite Codes
                  </Button>
                </Box>
              </Box>
            ) : (
              <Alert severity="info">
                No invite codes found. Create your first invite code to start tracking performance.
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Payment />}
                  onClick={() => navigate('/grant')}
                >
                  Grant Subscription
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Code />}
                  onClick={() => navigate('/invites')}
                >
                  Manage Invite Codes
                </Button>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {users.length > 0 ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Latest invited users:
                  </Typography>
                  {users.slice(0, 3).map((user) => (
                    <Box key={user.uuid} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" noWrap>
                        {user.uuid}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        via {user.inviteCode.code}
                      </Typography>
                    </Box>
                  ))}
                  <Button
                    size="small"
                    onClick={() => navigate('/invites')}
                    sx={{ mt: 1 }}
                  >
                    View All Users
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No activity yet. Start by granting subscriptions to users.
                </Typography>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};
