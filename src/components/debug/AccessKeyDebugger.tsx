import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Stack,
  Chip,
} from '@mui/material';
import { debugAccessKey } from '../../utils/accessKeyValidator';

export const AccessKeyDebugger: React.FC = () => {
  const [accessKey, setAccessKey] = useState('ak-d353iiin47bjd1ftq3c0');
  const [debugResult, setDebugResult] = useState<any>(null);

  const handleDebug = () => {
    const result = debugAccessKey(accessKey);
    setDebugResult(result);
  };

  const testKeys = [
    'ak-d353iiin47bjd1ftq3c0', // Your key
    'ak-test123',
    'ak-ABC123def',
    'ak-', // Invalid: empty after prefix
    'test-123', // Invalid: wrong prefix
    ' ak-d353iiin47bjd1ftq3c0 ', // With spaces
    'ak-test@123', // Invalid: special character
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Access Key Debugger
      </Typography>
      
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Access Key to Test"
          value={accessKey}
          onChange={(e) => setAccessKey(e.target.value)}
          placeholder="ak-xxxxxxxxxxxxxxxxx"
        />
        
        <Button variant="contained" onClick={handleDebug}>
          Debug Access Key
        </Button>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Quick Test Keys:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {testKeys.map((key, index) => (
              <Chip
                key={index}
                label={key || '(empty)'}
                onClick={() => setAccessKey(key)}
                variant="outlined"
                size="small"
              />
            ))}
          </Stack>
        </Box>

        {debugResult && (
          <Alert severity={debugResult.isValid ? 'success' : 'error'}>
            <Typography variant="body2">
              <strong>Result:</strong> {debugResult.isValid ? 'Valid' : 'Invalid'}
            </Typography>
            {debugResult.error && (
              <Typography variant="body2">
                <strong>Error:</strong> {debugResult.error}
              </Typography>
            )}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};
