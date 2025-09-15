import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import {
  ApiResponse,
  ApiError,
  AuthConfig,
  PlansResponse,
  GrantSubscriptionRequest,
  GrantSubscriptionResponse,
  InviteCodeResponse,
  InviteCodesResponse,
  UsersResponse,
  UpdateInviteCodeRemarkRequest,
  PaginationParams,
  InviteUsersParams,
  InviteCodeInfoParams,
  API_ENDPOINTS,
  ErrorCodes,
} from '../types/api';

class ApiClient {
  private client: AxiosInstance;
  private accessKey: string = '';

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'https://k2.52j.me',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth headers
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessKey) {
          config.headers['X-Access-Key'] = this.accessKey;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Check if the API returned an error code in the response body
        if (response.data.code !== ErrorCodes.SUCCESS) {
          const apiError: ApiError = {
            code: response.data.code,
            message: response.data.message,
            data: response.data.data,
          };
          throw new ApiErrorException(apiError);
        }
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.data) {
          const apiError: ApiError = {
            code: error.response.status,
            message: (error.response.data as any).message || error.message,
            data: error.response.data,
          };
          throw new ApiErrorException(apiError);
        }
        
        // Network or other errors
        const apiError: ApiError = {
          code: ErrorCodes.INTERNAL_ERROR,
          message: error.message || 'Network error occurred',
        };
        throw new ApiErrorException(apiError);
      }
    );
  }

  public setAuth(config: AuthConfig): void {
    this.accessKey = config.accessKey;
    this.client.defaults.baseURL = config.baseUrl;
  }

  public clearAuth(): void {
    this.accessKey = '';
  }

  // Plans API
  public async getPlans(): Promise<PlansResponse> {
    const response = await this.client.get<PlansResponse>(API_ENDPOINTS.PLANS);
    return response.data;
  }

  // Subscription Grant API
  public async grantSubscription(request: GrantSubscriptionRequest): Promise<GrantSubscriptionResponse> {
    const response = await this.client.post<GrantSubscriptionResponse>(
      API_ENDPOINTS.GRANT_SUBSCRIPTION,
      request
    );
    return response.data;
  }

  // Invite Code Management APIs
  public async getLatestInviteCode(): Promise<InviteCodeResponse> {
    const response = await this.client.get<InviteCodeResponse>(API_ENDPOINTS.INVITE_CODES_LATEST);
    return response.data;
  }

  public async getInviteCodes(params?: PaginationParams): Promise<InviteCodesResponse> {
    const response = await this.client.get<InviteCodesResponse>(API_ENDPOINTS.INVITE_CODES, {
      params,
    });
    return response.data;
  }

  public async createInviteCode(): Promise<InviteCodeResponse> {
    const response = await this.client.post<InviteCodeResponse>(API_ENDPOINTS.INVITE_CODES);
    return response.data;
  }

  public async updateInviteCodeRemark(
    code: string,
    request: UpdateInviteCodeRemarkRequest
  ): Promise<ApiResponse> {
    const response = await this.client.put<ApiResponse>(
      API_ENDPOINTS.INVITE_CODE_REMARK(code),
      request
    );
    return response.data;
  }

  public async getInvitedUsers(params?: InviteUsersParams): Promise<UsersResponse> {
    const response = await this.client.get<UsersResponse>(API_ENDPOINTS.INVITE_USERS, {
      params,
    });
    return response.data;
  }

  public async getInviteCodeInfo(params: InviteCodeInfoParams): Promise<InviteCodeResponse> {
    const response = await this.client.get<InviteCodeResponse>(API_ENDPOINTS.INVITE_CODE_INFO, {
      params,
    });
    return response.data;
  }
}

// Custom error class for API errors
export class ApiErrorException extends Error {
  public readonly apiError: ApiError;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'ApiErrorException';
    this.apiError = apiError;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export utility functions
export const isApiError = (error: unknown): error is ApiErrorException => {
  return error instanceof ApiErrorException;
};

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.apiError.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};
