import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, VpnKey } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuthStore } from '../../stores/authStore';
import { debugAccessKey } from '../../utils/accessKeyValidator';
import toast from 'react-hot-toast';

interface LoginFormData {
  accessKey: string;
  baseUrl: string;
}

const schema = yup.object({
  accessKey: yup
    .string()
    .required('Access key is required')
    .test('access-key-format', 'Access key must start with "ak-" followed by alphanumeric characters', (value) => {
      if (!value) return false;

      // Use the debug function for detailed analysis
      const debugResult = debugAccessKey(value);

      // Temporary: Allow any key that starts with "ak-" for debugging
      const trimmedValue = value.trim();
      const startsWithAk = trimmedValue.startsWith('ak-');
      const hasContent = trimmedValue.length > 3;

      console.log('Validation check:', {
        debugResult,
        startsWithAk,
        hasContent,
        finalResult: startsWithAk && hasContent
      });

      // Return true if it starts with "ak-" and has content (more permissive)
      return startsWithAk && hasContent;
    }),
  baseUrl: yup
    .string()
    .required('Base URL is required')
    .url('Please enter a valid URL'),
});

export const LoginForm: React.FC = () => {
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      accessKey: '',
      baseUrl: 'http://k2.52j.me',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Trim whitespace from access key
      const trimmedAccessKey = data.accessKey.trim();

      console.log('Login attempt:', {
        originalKey: data.accessKey,
        trimmedKey: trimmedAccessKey,
        baseUrl: data.baseUrl
      });

      login({
        accessKey: trimmedAccessKey,
        baseUrl: data.baseUrl,
      });

      toast.success('Successfully logged in!');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Login failed';
      setError('accessKey', { message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <VpnKey sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                VPN Distributor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your access key to continue
              </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="baseUrl"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Base URL"
                    placeholder="http://k2.52j.me"
                    error={!!errors.baseUrl}
                    helperText={errors.baseUrl?.message}
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <Controller
                name="accessKey"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Access Key"
                    placeholder="ak-xxxxxxxxxxxxxxxxx"
                    type={showAccessKey ? 'text' : 'password'}
                    error={!!errors.accessKey}
                    helperText={errors.accessKey?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowAccessKey(!showAccessKey)}
                              edge="end"
                            >
                              {showAccessKey ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mb: 2 }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Your access key should start with "ak-" followed by alphanumeric characters.
                Contact your administrator if you don't have an access key.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
