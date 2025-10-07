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
  RetailUser,
  RetailUserDetail,
  RetailUsersParams,
  RetailUsersResponse,
  RetailUserDetailResponse,
  API_ENDPOINTS,
  ErrorCodes,
} from '../types/api';

class ApiClient {
  private client: AxiosInstance;
  private accessKey: string = '';

  constructor() {
    // Determine base URL based on environment and configuration
    let baseURL: string;

    if (import.meta.env.VITE_USE_DIRECT_API === 'true') {
      // Use direct API calls (may have CORS issues)
      baseURL = import.meta.env.VITE_API_BASE_URL || 'https://k2.52j.me';
      console.log('🌐 Using direct API calls to:', baseURL);
    } else if (import.meta.env.DEV) {
      // Use proxy in development
      baseURL = '';
      console.log('🔄 Using proxy for API calls');
    } else {
      // Production mode
      baseURL = import.meta.env.VITE_API_BASE_URL || 'https://k2.52j.me';
      console.log('🚀 Production mode, using:', baseURL);
    }

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth headers and ensure proper HTTP methods
    this.client.interceptors.request.use(
      (config) => {
        // Ensure HTTP method is properly set
        if (!config.method) {
          config.method = 'get'; // Default to GET if not specified
          console.warn('⚠️ HTTP method not specified, defaulting to GET');
        }

        // Always ensure X-Access-Key header is set if we have an access key
        if (this.accessKey) {
          config.headers.set('X-Access-Key', this.accessKey);

          // Enhanced debug logging for API requests
          console.log('🚀 API Request Details:', {
            method: config.method?.toUpperCase() || 'UNKNOWN',
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL || ''}${config.url || ''}`,
            hasAccessKey: !!this.accessKey,
            accessKeyPreview: this.accessKey ? `${this.accessKey.substring(0, 8)}...` : 'none',
            data: config.data ? 'Present' : 'None',
            params: config.params ? Object.keys(config.params) : 'None',
            headers: {
              'X-Access-Key': config.headers.get('X-Access-Key') ? `${String(config.headers.get('X-Access-Key')).substring(0, 8)}...` : 'missing',
              'Content-Type': config.headers.get('Content-Type') || 'not set',
              'Accept': config.headers.get('Accept') || 'not set'
            },
            timeout: config.timeout
          });
        } else {
          console.warn('⚠️ API Request without access key:', {
            method: config.method?.toUpperCase() || 'UNKNOWN',
            url: config.url,
            warning: 'No access key available - request may fail'
          });
        }

        // Ensure proper Content-Type for POST/PUT requests
        if (['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '')) {
          if (!config.headers.get('Content-Type')) {
            config.headers.set('Content-Type', 'application/json');
            console.log('📝 Set Content-Type to application/json for', config.method?.toUpperCase());
          }
        }

        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
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
    console.log('Setting API authentication:', {
      accessKeyPreview: config.accessKey ? `${config.accessKey.substring(0, 8)}...` : 'none',
      baseUrl: config.baseUrl,
      previousAccessKey: this.accessKey ? `${this.accessKey.substring(0, 8)}...` : 'none'
    });

    // Validate access key format
    if (!config.accessKey || !config.accessKey.startsWith('ak-')) {
      throw new Error('Invalid access key format. Must start with "ak-"');
    }

    // Trim whitespace from access key
    this.accessKey = config.accessKey.trim();
    this.client.defaults.baseURL = config.baseUrl;

    console.log('API authentication set successfully:', {
      accessKeySet: !!this.accessKey,
      baseURL: this.client.defaults.baseURL
    });
  }

  public clearAuth(): void {
    console.log('Clearing API authentication');
    this.accessKey = '';
  }

  public getAuthStatus(): { isAuthenticated: boolean; accessKeyPreview?: string; baseURL?: string } {
    return {
      isAuthenticated: !!this.accessKey,
      accessKeyPreview: this.accessKey ? `${this.accessKey.substring(0, 8)}...` : undefined,
      baseURL: this.client.defaults.baseURL
    };
  }

  // Plans API
  public async getPlans(): Promise<PlansResponse> {
    console.log('📋 Fetching plans from:', API_ENDPOINTS.PLANS);
    const response = await this.client.request<PlansResponse>({
      method: 'GET',
      url: API_ENDPOINTS.PLANS,
    });
    console.log('✅ Plans fetched successfully:', {
      plansCount: response.data.data?.items?.length || 0,
      responseCode: response.data.code
    });
    return response.data;
  }

  // Subscription Grant API
  public async grantSubscription(request: GrantSubscriptionRequest): Promise<GrantSubscriptionResponse> {
    console.log('💳 Granting subscription to:', API_ENDPOINTS.GRANT_SUBSCRIPTION);
    const response = await this.client.request<GrantSubscriptionResponse>({
      method: 'POST',
      url: API_ENDPOINTS.GRANT_SUBSCRIPTION,
      data: request,
    });
    console.log('✅ Subscription granted successfully');
    return response.data;
  }

  // Invite Code Management APIs
  public async getLatestInviteCode(): Promise<InviteCodeResponse> {
    console.log('🎫 Fetching latest invite code from:', API_ENDPOINTS.INVITE_CODES_LATEST);
    const response = await this.client.request<InviteCodeResponse>({
      method: 'GET',
      url: API_ENDPOINTS.INVITE_CODES_LATEST,
    });
    console.log('✅ Latest invite code fetched successfully');
    return response.data;
  }

  public async getInviteCodes(params?: PaginationParams): Promise<InviteCodesResponse> {
    console.log('📋 Fetching invite codes from:', API_ENDPOINTS.INVITE_CODES, 'with params:', params);
    const response = await this.client.request<InviteCodesResponse>({
      method: 'GET',
      url: API_ENDPOINTS.INVITE_CODES,
      params,
    });
    console.log('✅ Invite codes fetched successfully:', {
      codesCount: response.data.data?.items?.length || 0
    });
    return response.data;
  }

  public async createInviteCode(): Promise<InviteCodeResponse> {
    console.log('➕ Creating new invite code at:', API_ENDPOINTS.INVITE_CODES);
    const response = await this.client.request<InviteCodeResponse>({
      method: 'POST',
      url: API_ENDPOINTS.INVITE_CODES,
    });
    console.log('✅ Invite code created successfully');
    return response.data;
  }

  public async updateInviteCodeRemark(
    code: string,
    request: UpdateInviteCodeRemarkRequest
  ): Promise<ApiResponse> {
    const endpoint = API_ENDPOINTS.INVITE_CODE_REMARK(code);
    console.log('✏️ Updating invite code remark at:', endpoint, 'with data:', request);
    const response = await this.client.request<ApiResponse>({
      method: 'PUT',
      url: endpoint,
      data: request,
    });
    console.log('✅ Invite code remark updated successfully');
    return response.data;
  }

  public async getInvitedUsers(params?: InviteUsersParams): Promise<UsersResponse> {
    console.log('👥 Fetching invited users from:', API_ENDPOINTS.INVITE_USERS, 'with params:', params);
    const response = await this.client.request<UsersResponse>({
      method: 'GET',
      url: API_ENDPOINTS.INVITE_USERS,
      params,
    });
    console.log('✅ Invited users fetched successfully:', {
      usersCount: response.data.data?.items?.length || 0
    });
    return response.data;
  }

  public async getInviteCodeInfo(params: InviteCodeInfoParams): Promise<InviteCodeResponse> {
    console.log('ℹ️ Fetching invite code info from:', API_ENDPOINTS.INVITE_CODE_INFO, 'with params:', params);
    const response = await this.client.request<InviteCodeResponse>({
      method: 'GET',
      url: API_ENDPOINTS.INVITE_CODE_INFO,
      params,
    });
    console.log('✅ Invite code info fetched successfully');
    return response.data;
  }

  // User Management APIs
  public async getRetailUsers(params?: RetailUsersParams): Promise<RetailUsersResponse> {
    console.log('👥 Fetching retail users from:', API_ENDPOINTS.RETAIL_USERS, 'with params:', params);
    const response = await this.client.request<RetailUsersResponse>({
      method: 'GET',
      url: API_ENDPOINTS.RETAIL_USERS,
      params,
    });
    console.log('✅ Retail users fetched successfully:', {
      usersCount: response.data.data?.items?.length || 0,
      totalUsers: response.data.data?.pagination?.total || 0
    });
    return response.data;
  }

  public async getRetailUserDetail(uuid: string): Promise<RetailUserDetailResponse> {
    const endpoint = API_ENDPOINTS.RETAIL_USER_DETAIL(uuid);
    console.log('👤 Fetching retail user detail from:', endpoint);
    const response = await this.client.request<RetailUserDetailResponse>({
      method: 'GET',
      url: endpoint,
    });
    console.log('✅ Retail user detail fetched successfully:', {
      userUuid: response.data.data?.user?.uuid,
      grantsCount: response.data.data?.grants?.length || 0,
      ordersCount: response.data.data?.orders?.length || 0
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
