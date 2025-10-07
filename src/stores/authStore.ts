import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../services/api';
import { AuthConfig } from '../types/api';

interface AuthState {
  isAuthenticated: boolean;
  accessKey: string;
  baseUrl: string;
  login: (config: AuthConfig) => void;
  logout: () => void;
  updateBaseUrl: (url: string) => void;
}

const DEFAULT_BASE_URL = 'https://k2.52j.me';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessKey: '',
      baseUrl: DEFAULT_BASE_URL,

      login: (config: AuthConfig) => {
        // Trim whitespace from access key
        const trimmedAccessKey = config.accessKey.trim();

        // Validate access key format
        if (!trimmedAccessKey.startsWith('ak-')) {
          throw new Error('Invalid access key format. Must start with "ak-"');
        }

        console.log('Auth store login:', {
          originalKey: config.accessKey,
          trimmedKey: trimmedAccessKey,
          baseUrl: config.baseUrl
        });

        // Set authentication in API client with trimmed key
        apiClient.setAuth({
          accessKey: trimmedAccessKey,
          baseUrl: config.baseUrl
        });

        set({
          isAuthenticated: true,
          accessKey: trimmedAccessKey,
          baseUrl: config.baseUrl,
        });

        console.log('Auth store login successful');
      },

      logout: () => {
        // Clear authentication from API client
        apiClient.clearAuth();

        set({
          isAuthenticated: false,
          accessKey: '',
          baseUrl: DEFAULT_BASE_URL,
        });
      },

      updateBaseUrl: (url: string) => {
        const { accessKey, isAuthenticated } = get();
        
        set({ baseUrl: url });

        // Update API client if authenticated
        if (isAuthenticated && accessKey) {
          apiClient.setAuth({ accessKey, baseUrl: url });
        }
      },
    }),
    {
      name: 'vpn-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessKey: state.accessKey,
        baseUrl: state.baseUrl,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore authentication in API client after page reload
        if (state?.isAuthenticated && state?.accessKey) {
          apiClient.setAuth({
            accessKey: state.accessKey,
            baseUrl: state.baseUrl,
          });
        }
      },
    }
  )
);
