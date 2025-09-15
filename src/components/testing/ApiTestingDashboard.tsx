import React, { useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { ApiTester } from './ApiTester';
import { ApiStatusDashboard } from './ApiStatusDashboard';
import { ApiDebugger } from './ApiDebugger';
import { ApiDocumentation } from './ApiDocumentation';

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
      id={`api-testing-tabpanel-${index}`}
      aria-labelledby={`api-testing-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `api-testing-tab-${index}`,
    'aria-controls': `api-testing-tabpanel-${index}`,
  };
}

export const ApiTestingDashboard: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          API Testing & Monitoring
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Comprehensive testing suite for all VPN Distributor API endpoints. 
          Monitor API health, test individual endpoints, and debug issues.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Available Endpoints:</strong><br />
            • GET /api/plans - Retrieve subscription plans<br />
            • GET /api/invite/my-codes/latest - Get latest invite code<br />
            • GET /api/invite/my-codes - List invite codes with pagination<br />
            • POST /api/invite/my-codes - Create new invite code<br />
            • GET /api/invite/my-users - List invited users<br />
            • POST /api/retail/grant-subscription - Grant subscription to user<br />
            • GET /api/invite/code - Get public invite code info
          </Typography>
        </Alert>

        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="API testing tabs">
              <Tab label="Status Dashboard" {...a11yProps(0)} />
              <Tab label="Endpoint Testing" {...a11yProps(1)} />
              <Tab label="Request Debugger" {...a11yProps(2)} />
              <Tab label="API Documentation" {...a11yProps(3)} />
            </Tabs>
          </Box>

          <TabPanel value={value} index={0}>
            <ApiStatusDashboard />
          </TabPanel>

          <TabPanel value={value} index={1}>
            <ApiTester />
          </TabPanel>

          <TabPanel value={value} index={2}>
            <ApiDebugger />
          </TabPanel>

          <TabPanel value={value} index={3}>
            <ApiDocumentation />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};
