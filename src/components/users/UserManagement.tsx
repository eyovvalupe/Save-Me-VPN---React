import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Search,
  Visibility,
  Person,
  Email,
  Schedule,
  Assignment,
  ShoppingCart,
  Close,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api';
import { RetailUser, RetailUserDetail } from '../../types/api';

export const UserManagement: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [emailFilter, setEmailFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);

  // Query for users list
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['retail-users', page, pageSize, emailFilter],
    queryFn: () => apiClient.getRetailUsers({
      page,
      pageSize,
      email: emailFilter || undefined,
    }),
    enabled: true,
  });

  // Query for user detail
  const {
    data: userDetailData,
    isLoading: userDetailLoading,
    error: userDetailError,
  } = useQuery({
    queryKey: ['retail-user-detail', selectedUser],
    queryFn: () => selectedUser ? apiClient.getRetailUserDetail(selectedUser) : null,
    enabled: !!selectedUser,
  });

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEmailFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailFilter(event.target.value);
    setPage(0);
  };

  const handleViewUser = (userUuid: string) => {
    setSelectedUser(userUuid);
    setUserDetailOpen(true);
  };

  const handleCloseUserDetail = () => {
    setUserDetailOpen(false);
    setSelectedUser(null);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isExpired = (expiredAt: number) => {
    return expiredAt * 1000 < Date.now();
  };

  const users = usersData?.data?.items || [];
  const pagination = usersData?.data?.pagination;
  const userDetail = userDetailData?.data;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage and view users assigned to your distributor account.
      </Typography>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Search by Email"
            value={emailFilter}
            onChange={handleEmailFilterChange}
            placeholder="user@example.com"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <Button
            variant="outlined"
            onClick={() => refetchUsers()}
            disabled={usersLoading}
          >
            Refresh
          </Button>
        </Stack>
      </Paper>

      {/* Error Display */}
      {usersError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load users: {(usersError as Error).message}
        </Alert>
      )}

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Expires At</TableCell>
              <TableCell>Grants</TableCell>
              <TableCell>Orders</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: RetailUser) => (
                <TableRow key={user.uuid}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email fontSize="small" />
                      {user.email}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={isExpired(user.expiredAt) ? 'Expired' : 'Active'}
                      color={isExpired(user.expiredAt) ? 'error' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule fontSize="small" />
                      {formatTimestamp(user.expiredAt)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Assignment fontSize="small" />
                      {user.grantCount}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ShoppingCart fontSize="small" />
                      {user.orderCount}
                    </Box>
                  </TableCell>
                  <TableCell>{formatTimestamp(user.createdAt)}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleViewUser(user.uuid)}
                      size="small"
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {pagination && (
          <TablePagination
            component="div"
            count={pagination.total}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handlePageSizeChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}
      </TableContainer>

      {/* User Detail Dialog */}
      <Dialog
        open={userDetailOpen}
        onClose={handleCloseUserDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person />
              User Details
            </Box>
            <IconButton onClick={handleCloseUserDetail} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {userDetailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : userDetailError ? (
            <Alert severity="error">
              Failed to load user details: {(userDetailError as Error).message}
            </Alert>
          ) : userDetail ? (
            <Stack spacing={3}>
              {/* User Info */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>User Information</Typography>
                <Stack spacing={1}>
                  <Typography><strong>UUID:</strong> {userDetail.user.uuid}</Typography>
                  <Typography><strong>Email:</strong> {userDetail.user.email}</Typography>
                  <Typography>
                    <strong>Status:</strong>{' '}
                    <Chip
                      label={isExpired(userDetail.user.expiredAt) ? 'Expired' : 'Active'}
                      color={isExpired(userDetail.user.expiredAt) ? 'error' : 'success'}
                      size="small"
                    />
                  </Typography>
                  <Typography><strong>Expires:</strong> {formatTimestamp(userDetail.user.expiredAt)}</Typography>
                  <Typography><strong>Created:</strong> {formatTimestamp(userDetail.user.createdAt)}</Typography>
                  <Typography><strong>Total Grants:</strong> {userDetail.user.grantCount}</Typography>
                  <Typography><strong>Total Orders:</strong> {userDetail.user.orderCount}</Typography>
                </Stack>
              </Paper>

              {/* Grants */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Grants ({userDetail.grants.length})</Typography>
                {userDetail.grants.length === 0 ? (
                  <Typography color="text.secondary">No grants found</Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Plan</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Granted At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userDetail.grants.map((grant) => (
                        <TableRow key={grant.uuid}>
                          <TableCell>{grant.planPid}</TableCell>
                          <TableCell>{grant.quantity}</TableCell>
                          <TableCell>${(grant.amount / 100).toFixed(2)}</TableCell>
                          <TableCell>{formatTimestamp(grant.grantedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Paper>

              {/* Orders */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Orders ({userDetail.orders.length})</Typography>
                {userDetail.orders.length === 0 ? (
                  <Typography color="text.secondary">No orders found</Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userDetail.orders.map((order) => (
                        <TableRow key={order.uuid}>
                          <TableCell>{order.title}</TableCell>
                          <TableCell>${(order.payAmount / 100).toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.isPaid ? 'Paid' : 'Unpaid'}
                              color={order.isPaid ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatTimestamp(order.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            </Stack>
          ) : null}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseUserDetail}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
