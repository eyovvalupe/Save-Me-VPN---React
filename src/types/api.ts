// Base API Response Structure
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}

// Pagination Structure
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

// Plan Types
export interface Plan {
  pid: string;
  label: string;
  name?: string; // Alternative name field from API
  description?: string;
  price: number;
  originPrice: number;
  currency?: string;
  month: number;
  duration?: number;
  durationUnit?: string;
  features?: string[];
  highlight: boolean;
  isActive: boolean;
  discount?: {
    percentage: number;
    validUntil: string;
  };
}

export type PlansResponse = ApiResponse<PaginatedResponse<Plan>>;

// Invite Code Types
export interface InviteCodeConfig {
  downloadRewardDays: number;
  purchaseRewardDays: number;
}

export interface InviteCode {
  code: string;
  createdAt: number;
  remark: string;
  link: string;
  config: InviteCodeConfig;
  downloadCount: number;
  downloadReward: number;
  purchaseCount: number;
  purchaseReward: number;
}

export interface InviteCodeBasic {
  code: string;
  createdAt: number;
  remark: string;
}

export type InviteCodeResponse = ApiResponse<InviteCode>;
export type InviteCodesResponse = ApiResponse<PaginatedResponse<InviteCode>>;

// User Types
export interface User {
  uuid: string;
  expiredAt: number;
  isFirstOrderDone: boolean;
  inviteCode: InviteCodeBasic;
  deviceCount?: number;
}

export interface UserWithDeviceCount extends User {
  deviceCount: number;
}

export type UsersResponse = ApiResponse<PaginatedResponse<UserWithDeviceCount>>;

// Grant Types
export interface Grant {
  uuid: string;
  planPid: string;
  quantity: number;
  amount: number;
  grantedAt: number;
}

export interface GrantSubscriptionData {
  user: User;
  grant: Grant;
}

export type GrantSubscriptionResponse = ApiResponse<GrantSubscriptionData>;

// Request Types
export interface GrantSubscriptionRequest {
  email: string;
  planPid: string;
  quantity: number;
  dryRun?: boolean;
}

export interface UpdateInviteCodeRemarkRequest {
  remark: string;
}

// Query Parameters
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface InviteUsersParams extends PaginationParams {
  inviteCode?: string;
}

export interface InviteCodeInfoParams {
  code: string;
}

// User Management Types
export interface RetailUser {
  uuid: string;
  email: string;
  expiredAt: number;
  grantCount: number;
  orderCount: number;
  createdAt: number;
}

export interface RetailUserDetail extends RetailUser {
  grants: GrantRecord[];
  orders: UserOrder[];
}

export interface GrantRecord {
  uuid: string;
  planPid: string;
  quantity: number;
  amount: number;
  grantedAt: number;
}

export interface UserOrder {
  uuid: string;
  title: string;
  originAmount: number;
  payAmount: number;
  isPaid: boolean;
  paidAt: number | null;
  createdAt: number;
}

export interface RetailUsersParams extends PaginationParams {
  email?: string;
}

export type RetailUsersResponse = ApiResponse<PaginatedResponse<RetailUser>>;
export type RetailUserDetailResponse = ApiResponse<{
  user: RetailUserDetail;
  grants: GrantRecord[];
  orders: UserOrder[];
}>;

// Error Types
export interface ApiError {
  code: number;
  message: string;
  data?: any;
}

// Authentication Types
export interface AuthConfig {
  accessKey: string;
  baseUrl: string;
}

// Common Error Codes
export enum ErrorCodes {
  SUCCESS = 0,
  UNAUTHORIZED = 401,
  CONFLICT = 409,
  VALIDATION_ERROR = 422,
  INTERNAL_ERROR = 500,
}

// API Endpoints
export const API_ENDPOINTS = {
  PLANS: '/api/plans',
  GRANT_SUBSCRIPTION: '/api/retail/grant-subscription',
  RETAIL_USERS: '/api/retail/users',
  RETAIL_USER_DETAIL: (uuid: string) => `/api/retail/users/${uuid}`,
  INVITE_CODES_LATEST: '/api/invite/my-codes/latest',
  INVITE_CODES: '/api/invite/my-codes',
  INVITE_CODE_REMARK: (code: string) => `/api/invite/my-codes/${code}/remark`,
  INVITE_USERS: '/api/invite/my-users',
  INVITE_CODE_INFO: '/api/invite/code',
} as const;
