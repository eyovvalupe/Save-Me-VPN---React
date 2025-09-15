import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Edit,
  ContentCopy,
  Link as LinkIcon,
  Download,
  ShoppingCart,
  CalendarToday,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { InviteCode } from '../../types/api';
import { useUpdateInviteCodeRemark } from '../../hooks/useApi';
import toast from 'react-hot-toast';

interface InviteCodeCardProps {
  inviteCode: InviteCode;
}

export const InviteCodeCard: React.FC<InviteCodeCardProps> = ({ inviteCode }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newRemark, setNewRemark] = useState(inviteCode.remark);
  
  const updateRemarkMutation = useUpdateInviteCodeRemark();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode.code);
    toast.success('Invite code copied to clipboard!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteCode.link);
    toast.success('Invite link copied to clipboard!');
  };

  const handleUpdateRemark = async () => {
    try {
      await updateRemarkMutation.mutateAsync({
        code: inviteCode.code,
        request: { remark: newRemark },
      });
      setEditDialogOpen(false);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'MMM dd, yyyy');
  };

  return (
    <>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                {inviteCode.remark}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Code:
                </Typography>
                <Chip
                  label={inviteCode.code}
                  size="small"
                  variant="outlined"
                  onClick={handleCopyCode}
                  clickable
                />
                <Tooltip title="Copy code">
                  <IconButton size="small" onClick={handleCopyCode}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Created: {formatDate(inviteCode.createdAt)}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setEditDialogOpen(true)}
              sx={{ ml: 1 }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Download color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="primary">
                    {inviteCode.downloadCount}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Downloads
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  +{inviteCode.downloadReward} days reward
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <ShoppingCart color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="success.main">
                    {inviteCode.purchaseCount}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Purchases
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  +{inviteCode.purchaseReward} days reward
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Reward Configuration:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Download: ${inviteCode.config.downloadRewardDays} days`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`Purchase: ${inviteCode.config.purchaseRewardDays} days`}
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
          </Stack>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<LinkIcon />}
            onClick={handleCopyLink}
            sx={{ mt: 2 }}
          >
            Copy Invite Link
          </Button>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Invite Code Remark</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Remark"
            value={newRemark}
            onChange={(e) => setNewRemark(e.target.value)}
            margin="normal"
            placeholder="Enter a description for this invite code"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateRemark}
            variant="contained"
            disabled={updateRemarkMutation.isPending || newRemark === inviteCode.remark}
          >
            {updateRemarkMutation.isPending ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
