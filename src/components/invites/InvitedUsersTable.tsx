import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import { Person, CheckCircle, Cancel, Devices } from '@mui/icons-material';
import { format } from 'date-fns';
import { UserWithDeviceCount } from '../../types/api';

interface InvitedUsersTableProps {
  users: UserWithDeviceCount[];
}

export const InvitedUsersTable: React.FC<InvitedUsersTableProps> = ({ users }) => {
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'MMM dd, yyyy HH:mm');
  };

  const isExpired = (timestamp: number) => {
    return timestamp * 1000 < Date.now();
  };

  if (users.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No invited users yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Users invited through your codes will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Subscription Status</TableCell>
            <TableCell>Expires At</TableCell>
            <TableCell>First Order</TableCell>
            <TableCell>Devices</TableCell>
            <TableCell>Invite Code</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.uuid} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {user.uuid}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              
              <TableCell>
                <Chip
                  label={isExpired(user.expiredAt) ? 'Expired' : 'Active'}
                  color={isExpired(user.expiredAt) ? 'error' : 'success'}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              
              <TableCell>
                <Typography
                  variant="body2"
                  color={isExpired(user.expiredAt) ? 'error' : 'text.primary'}
                >
                  {formatDate(user.expiredAt)}
                </Typography>
              </TableCell>
              
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {user.isFirstOrderDone ? (
                    <CheckCircle color="success" fontSize="small" />
                  ) : (
                    <Cancel color="error" fontSize="small" />
                  )}
                  <Typography variant="body2">
                    {user.isFirstOrderDone ? 'Completed' : 'Pending'}
                  </Typography>
                </Box>
              </TableCell>
              
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Devices fontSize="small" color="action" />
                  <Typography variant="body2">
                    {user.deviceCount || 0}
                  </Typography>
                </Box>
              </TableCell>
              
              <TableCell>
                <Box>
                  <Chip
                    label={user.inviteCode.code}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    {user.inviteCode.remark}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
