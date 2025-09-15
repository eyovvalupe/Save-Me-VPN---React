import React, { useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Paper,
} from '@mui/material';
import { ApiTester } from '../components/testing/ApiTester';
import { ApiStatusDashboard } from '../components/testing/ApiStatusDashboard';

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

export const ApiTestingPage: React.FC = () => {
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

        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="API testing tabs">
              <Tab label="Status Dashboard" {...a11yProps(0)} />
              <Tab label="Endpoint Testing" {...a11yProps(1)} />
            </Tabs>
          </Box>
          
          <TabPanel value={value} index={0}>
            <ApiStatusDashboard />
          </TabPanel>
          
          <TabPanel value={value} index={1}>
            <ApiTester />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};
