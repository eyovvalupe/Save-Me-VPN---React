import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Grid2 as Grid,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  Error,
  Info,
  Speed,
  Add,
  List,
  GetApp,
} from '@mui/icons-material';
import { apiClient, getErrorMessage } from '../../services/api';
import { InviteCode, InviteCodesResponse } from '../../types/api';

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
      {...other}
    >
      {value === index && children}
    </div>
  );
}

export const InviteCodesApiPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // List invite codes state
  const [listLoading, setListLoading] = useState(false);
  const [inviteCodes, setInviteCodes] = useState<InviteCodesResponse | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [listResponseTime, setListResponseTime] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Latest invite code state
  const [latestLoading, setLatestLoading] = useState(false);
  const [latestCode, setLatestCode] = useState<InviteCode | null>(null);
  const [latestError, setLatestError] = useState<string | null>(null);
  const [latestResponseTime, setLatestResponseTime] = useState<number | null>(null);

  // Create invite code state
  const [createLoading, setCreateLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<InviteCode | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createResponseTime, setCreateResponseTime] = useState<number | null>(null);

  const testListInviteCodes = async () => {
    setListLoading(true);
    setListError(null);
    const startTime = Date.now();

    try {
      const result = await apiClient.getInviteCodes({ page, pageSize });
      setInviteCodes(result);
      setListResponseTime(Date.now() - startTime);
    } catch (err) {
      setListError(getErrorMessage(err));
      setListResponseTime(Date.now() - startTime);
    } finally {
      setListLoading(false);
    }
  };

  const testLatestInviteCode = async () => {
    setLatestLoading(true);
    setLatestError(null);
    const startTime = Date.now();

    try {
      const result = await apiClient.getLatestInviteCode();
      setLatestCode(result);
      setLatestResponseTime(Date.now() - startTime);
    } catch (err) {
      setLatestError(getErrorMessage(err));
      setLatestResponseTime(Date.now() - startTime);
    } finally {
      setLatestLoading(false);
    }
  };

  const testCreateInviteCode = async () => {
    setCreateLoading(true);
    setCreateError(null);
    const startTime = Date.now();

    try {
      const result = await apiClient.createInviteCode();
      setCreatedCode(result);
      setCreateResponseTime(Date.now() - startTime);
    } catch (err) {
      setCreateError(getErrorMessage(err));
      setCreateResponseTime(Date.now() - startTime);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Invite Codes API Testing
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Test all invite code related endpoints: list codes, get latest code, and create new codes.
          </Typography>
        </Alert>

        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab icon={<List />} label="List Codes" />
              <Tab icon={<GetApp />} label="Latest Code" />
              <Tab icon={<Add />} label="Create Code" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                List Invite Codes
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                GET /api/invite/my-codes - Retrieve paginated list of invite codes
              </Typography>

              <Grid container spacing={3}>
                <Grid xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Parameters
                      </Typography>
                      
                      <TextField
                        fullWidth
                        label="Page"
                        type="number"
                        value={page}
                        onChange={(e) => setPage(parseInt(e.target.value) || 0)}
                        sx={{ mb: 2 }}
                        size="small"
                      />
                      
                      <TextField
                        fullWidth
                        label="Page Size"
                        type="number"
                        value={pageSize}
                        onChange={(e) => setPageSize(parseInt(e.target.value) || 10)}
                        sx={{ mb: 2 }}
                        size="small"
                      />

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={testListInviteCodes}
                        disabled={listLoading}
                        startIcon={listLoading ? <CircularProgress size={16} /> : <PlayArrow />}
                      >
                        {listLoading ? 'Testing...' : 'Test List API'}
                      </Button>

                      {listResponseTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                          <Speed fontSize="small" />
                          <Typography variant="body2">
                            {listResponseTime}ms
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Results
                      </Typography>

                      {listError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          <Error /> {listError}
                        </Alert>
                      )}

                      {inviteCodes && (
                        <>
                          <Alert severity="success" sx={{ mb: 2 }}>
                            <CheckCircle /> Found {inviteCodes.inviteCodes.length} codes 
                            (Total: {inviteCodes.totalCount})
                          </Alert>

                          <TableContainer component={Paper}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Code</TableCell>
                                  <TableCell>Status</TableCell>
                                  <TableCell>Downloads</TableCell>
                                  <TableCell>Purchases</TableCell>
                                  <TableCell>Created</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {inviteCodes.inviteCodes.map((code) => (
                                  <TableRow key={code.code}>
                                    <TableCell>
                                      <Typography variant="body2" fontFamily="monospace">
                                        {code.code}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={code.isActive ? 'Active' : 'Inactive'}
                                        color={code.isActive ? 'success' : 'default'}
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell>{code.downloadCount}</TableCell>
                                    <TableCell>{code.purchaseCount}</TableCell>
                                    <TableCell>
                                      {new Date(code.createdAt).toLocaleDateString()}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Get Latest Invite Code
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                GET /api/invite/my-codes/latest - Get or create the latest invite code
              </Typography>

              <Grid container spacing={3}>
                <Grid xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={testLatestInviteCode}
                        disabled={latestLoading}
                        startIcon={latestLoading ? <CircularProgress size={16} /> : <PlayArrow />}
                      >
                        {latestLoading ? 'Testing...' : 'Get Latest Code'}
                      </Button>

                      {latestResponseTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                          <Speed fontSize="small" />
                          <Typography variant="body2">
                            {latestResponseTime}ms
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid xs={12} md={6}>
                  <Card>
                    <CardContent>
                      {latestError && (
                        <Alert severity="error">
                          <Error /> {latestError}
                        </Alert>
                      )}

                      {latestCode && (
                        <>
                          <Alert severity="success" sx={{ mb: 2 }}>
                            <CheckCircle /> Latest code retrieved successfully
                          </Alert>
                          
                          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="body2" component="pre">
                              {JSON.stringify(latestCode, null, 2)}
                            </Typography>
                          </Paper>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Create New Invite Code
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                POST /api/invite/my-codes - Create a new invite code
              </Typography>

              <Grid container spacing={3}>
                <Grid xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        This will create an actual invite code in the system.
                      </Alert>

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={testCreateInviteCode}
                        disabled={createLoading}
                        startIcon={createLoading ? <CircularProgress size={16} /> : <Add />}
                      >
                        {createLoading ? 'Creating...' : 'Create New Code'}
                      </Button>

                      {createResponseTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                          <Speed fontSize="small" />
                          <Typography variant="body2">
                            {createResponseTime}ms
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid xs={12} md={6}>
                  <Card>
                    <CardContent>
                      {createError && (
                        <Alert severity="error">
                          <Error /> {createError}
                        </Alert>
                      )}

                      {createdCode && (
                        <>
                          <Alert severity="success" sx={{ mb: 2 }}>
                            <CheckCircle /> New invite code created successfully!
                          </Alert>
                          
                          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="body2" component="pre">
                              {JSON.stringify(createdCode, null, 2)}
                            </Typography>
                          </Paper>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};
