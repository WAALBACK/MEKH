/**
 * React Query hooks for auth state management
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { authQueryKeys, getCachedAuthState, setCachedAuthState, clearCachedAuthState } from '../lib/authCache';

/**
 * Hook for auth session with caching
 */
export const useAuthSession = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: authQueryKeys.session(),
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
    staleTime: 4 * 60 * 1000, // 4 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    initialData: () => {
      const cached = getCachedAuthState();
      return cached?.session || null;
    },
  });
};

/**
 * Hook for user profile with role detection
 */
export const useUserProfile = (userId?: string) => {
  return useQuery({
    queryKey: authQueryKeys.profile(userId || ''),
    queryFn: async () => {
      if (!userId) return null;

      // Batch both client and technician checks
      const [clientResult, technicianResult] = await Promise.allSettled([
        supabase.from('clients').select('id, name, phone, location').eq('user_id', userId).maybeSingle(),
        supabase.from('technicians').select('*').eq('user_id', userId).maybeSingle()
      ]);

      let role = null;
      let profile = null;
      let isClient = false;
      let isTechnician = false;

      if (clientResult.status === 'fulfilled' && clientResult.value.data) {
        role = 'client';
        profile = clientResult.value.data;
        isClient = true;
      }

      if (technicianResult.status === 'fulfilled' && technicianResult.value.data) {
        role = 'technician';
        profile = technicianResult.value.data;
        isTechnician = true;
      }

      return {
        role,
        profile,
        isClient,
        isTechnician,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    initialData: () => {
      const cached = getCachedAuthState();
      if (cached && cached.session?.user?.id === userId) {
        return {
          role: cached.userRole,
          profile: cached.technicianProfile,
          isClient: cached.isClient,
          isTechnician: cached.isTechnician,
        };
      }
      return undefined;
    },
  });
};

/**
 * Hook for complete auth state
 */
export const useAuthState = () => {
  const sessionQuery = useAuthSession();
  const profileQuery = useUserProfile(sessionQuery.data?.user?.id);

  const isLoading = sessionQuery.isLoading || (sessionQuery.data?.user && profileQuery.isLoading);
  const isAuthenticated = !!sessionQuery.data?.user;

  // Cache the complete auth state when both queries are successful
  if (sessionQuery.data && profileQuery.data && !isLoading) {
    setCachedAuthState({
      session: sessionQuery.data,
      userRole: profileQuery.data.role,
      isClient: profileQuery.data.isClient,
      isTechnician: profileQuery.data.isTechnician,
      technicianProfile: profileQuery.data.profile,
    });
  }

  return {
    session: sessionQuery.data,
    userRole: profileQuery.data?.role || sessionQuery.data?.user?.user_metadata?.role,
    isClient: profileQuery.data?.isClient || false,
    isTechnician: profileQuery.data?.isTechnician || false,
    technicianProfile: profileQuery.data?.profile,
    isLoading,
    isAuthenticated,
    error: sessionQuery.error || profileQuery.error,
  };
};

/**
 * Hook to invalidate auth cache
 */
export const useInvalidateAuth = () => {
  const queryClient = useQueryClient();

  return {
    invalidateSession: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
    },
    invalidateProfile: (userId: string) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.profile(userId) });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      clearCachedAuthState();
    },
  };
};