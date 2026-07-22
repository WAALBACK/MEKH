/**
 * Auth state caching with localStorage and React Query
 */

import { supabase } from './supabase';

export interface CachedAuthState {
  session: any;
  userRole: string | null;
  isClient: boolean;
  isTechnician: boolean;
  technicianProfile: any;
  timestamp: number;
  expiresAt: number;
}

const AUTH_CACHE_KEY = 'mekh_auth_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached auth state from localStorage
 */
export const getCachedAuthState = (): CachedAuthState | null => {
  try {
    const cached = localStorage.getItem(AUTH_CACHE_KEY);
    if (!cached) return null;

    const authState: CachedAuthState = JSON.parse(cached);
    
    // Check if cache is expired
    if (Date.now() > authState.expiresAt) {
      localStorage.removeItem(AUTH_CACHE_KEY);
      return null;
    }

    return authState;
  } catch (error) {
    console.warn('Failed to get cached auth state:', error);
    localStorage.removeItem(AUTH_CACHE_KEY);
    return null;
  }
};

/**
 * Cache auth state to localStorage
 */
export const setCachedAuthState = (authState: Omit<CachedAuthState, 'timestamp' | 'expiresAt'>) => {
  try {
    const cachedState: CachedAuthState = {
      ...authState,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION,
    };

    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cachedState));
  } catch (error) {
    console.warn('Failed to cache auth state:', error);
  }
};

/**
 * Clear cached auth state
 */
export const clearCachedAuthState = () => {
  localStorage.removeItem(AUTH_CACHE_KEY);
};

/**
 * Progressive auth state loader - returns cached state immediately, fetches fresh data in background
 */
export const getProgressiveAuthState = async (): Promise<{
  immediate: CachedAuthState | null;
  fresh: Promise<CachedAuthState | null>;
}> => {
  // Return cached state immediately
  const immediate = getCachedAuthState();

  // Fetch fresh state in background
  const fresh = fetchFreshAuthState();

  return { immediate, fresh };
};

/**
 * Fetch fresh auth state from Supabase
 */
const fetchFreshAuthState = async (): Promise<CachedAuthState | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      clearCachedAuthState();
      return null;
    }

    let userRole = session.user.user_metadata?.role ?? null;
    let isClient = false;
    let isTechnician = false;
    let technicianProfile = null;

    // Batch profile checks
    const [clientCheck, technicianCheck] = await Promise.allSettled([
      supabase.from('clients').select('id').eq('user_id', session.user.id).maybeSingle(),
      supabase.from('technicians').select('*').eq('user_id', session.user.id).maybeSingle()
    ]);

    if (clientCheck.status === 'fulfilled' && clientCheck.value.data) {
      isClient = true;
      if (!userRole) userRole = 'client';
    }

    if (technicianCheck.status === 'fulfilled' && technicianCheck.value.data) {
      isTechnician = true;
      technicianProfile = technicianCheck.value.data;
      if (!userRole) userRole = 'technician';
    }

    const authState = {
      session,
      userRole,
      isClient,
      isTechnician,
      technicianProfile,
    };

    // Cache the fresh state
    setCachedAuthState(authState);

    return {
      ...authState,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION,
    };
  } catch (error) {
    console.error('Failed to fetch fresh auth state:', error);
    return null;
  }
};

/**
 * React Query key factory for auth queries
 */
export const authQueryKeys = {
  all: ['auth'] as const,
  session: () => [...authQueryKeys.all, 'session'] as const,
  profile: (userId: string) => [...authQueryKeys.all, 'profile', userId] as const,
  role: (userId: string) => [...authQueryKeys.all, 'role', userId] as const,
};