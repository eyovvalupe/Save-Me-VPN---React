import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
  Paper,
  Tabs,
  Tab,
  Pagination,
} from '@mui/material';
import { Add, Code } from '@mui/icons-material';
import { useInviteCodes, useCreateInviteCode, useInvitedUsers } from '../../hooks/useApi';
import { InviteCodeCard } from './InviteCodeCard';
import { InvitedUsersTable } from './InvitedUsersTable';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const InviteCodesDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  
  const pageSize = 12;
  const usersPageSize = 20;

  const {
    data: inviteCodesData,
    isLoading: isLoadingCodes,
    error: codesError,
  } = useInviteCodes({
    page: currentPage - 1,
    pageSize,
  });

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useInvitedUsers({
    page: usersPage - 1,
    pageSize: usersPageSize,
  });

  const createCodeMutation = useCreateInviteCode();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCreateCode = () => {
    createCodeMutation.mutate();
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleUsersPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setUsersPage(value);
  };

  const inviteCodes = inviteCodesData?.data?.items || [];
  const totalPages = inviteCodesData?.data?.pagination
    ? Math.ceil(inviteCodesData.data.pagination.total / pageSize)
    : 1;

  const invitedUsers = usersData?.data?.items || [];
  const totalUsersPages = usersData?.data?.pagination
    ? Math.ceil(usersData.data.pagination.total / usersPageSize)
    : 1;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Invite Code Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateCode}
            disabled={createCodeMutation.isPending}
          >
            {createCodeMutation.isPending ? 'Creating...' : 'Create New Code'}
          </Button>
        </Box>

        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="invite management tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              label="Invite Codes"
              icon={<Code />}
              iconPosition="start"
            />
            <Tab
              label="Invited Users"
              iconPosition="start"
            />
          </Tabs>

          <TabPanel value={currentTab} index={0}>
            {isLoadingCodes ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : codesError ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                Failed to load invite codes. Please try again later.
              </Alert>
            ) : inviteCodes.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Code sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No invite codes yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first invite code to start inviting users
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateCode}
                  disabled={createCodeMutation.isPending}
                >
                  Create First Code
                </Button>
              </Box>
            ) : (
              <>
                <Grid container spacing={3}>
                  {inviteCodes.map((inviteCode) => (
                    <Grid item xs={12} sm={6} md={4} key={inviteCode.code}>
                      <InviteCodeCard inviteCode={inviteCode} />
                    </Grid>
                  ))}
                </Grid>

                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            {isLoadingUsers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : usersError ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                Failed to load invited users. Please try again later.
              </Alert>
            ) : (
              <>
                <InvitedUsersTable users={invitedUsers} />
                
                {totalUsersPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalUsersPages}
                      page={usersPage}
                      onChange={handleUsersPageChange}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};
