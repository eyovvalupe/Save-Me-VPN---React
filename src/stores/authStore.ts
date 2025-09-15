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
        // Validate access key format
        if (!config.accessKey.startsWith('ak-')) {
          throw new Error('Invalid access key format. Must start with "ak-"');
        }

        // Set authentication in API client
        apiClient.setAuth(config);

        set({
          isAuthenticated: true,
          accessKey: config.accessKey,
          baseUrl: config.baseUrl,
        });
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
