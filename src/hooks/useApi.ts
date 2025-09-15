import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, getErrorMessage } from '../services/api';
import {
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
} from '../types/api';
import toast from 'react-hot-toast';

// Query Keys
export const QUERY_KEYS = {
  PLANS: ['plans'] as const,
  INVITE_CODES: ['inviteCodes'] as const,
  INVITE_CODES_LATEST: ['inviteCodes', 'latest'] as const,
  INVITE_USERS: ['inviteUsers'] as const,
  INVITE_CODE_INFO: (code: string) => ['inviteCodeInfo', code] as const,
} as const;

// Plans Hooks
export const usePlans = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PLANS,
    queryFn: () => apiClient.getPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Invite Codes Hooks
export const useLatestInviteCode = () => {
  return useQuery({
    queryKey: QUERY_KEYS.INVITE_CODES_LATEST,
    queryFn: () => apiClient.getLatestInviteCode(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useInviteCodes = (params?: PaginationParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.INVITE_CODES, params],
    queryFn: () => apiClient.getInviteCodes(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateInviteCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.createInviteCode(),
    onSuccess: () => {
      // Invalidate and refetch invite codes
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVITE_CODES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVITE_CODES_LATEST });
      toast.success('Invite code created successfully!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateInviteCodeRemark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, request }: { code: string; request: UpdateInviteCodeRemarkRequest }) =>
      apiClient.updateInviteCodeRemark(code, request),
    onSuccess: () => {
      // Invalidate and refetch invite codes
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVITE_CODES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVITE_CODES_LATEST });
      toast.success('Invite code remark updated successfully!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// Invited Users Hooks
export const useInvitedUsers = (params?: InviteUsersParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.INVITE_USERS, params],
    queryFn: () => apiClient.getInvitedUsers(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Invite Code Info Hook (public)
export const useInviteCodeInfo = (params: InviteCodeInfoParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.INVITE_CODE_INFO(params.code),
    queryFn: () => apiClient.getInviteCodeInfo(params),
    enabled: !!params.code,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Grant Subscription Hook
export const useGrantSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GrantSubscriptionRequest) => apiClient.grantSubscription(request),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVITE_USERS });
      toast.success(`Subscription granted successfully to ${data.data?.user.uuid}!`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
