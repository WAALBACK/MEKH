import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Security: Only use environment variables for Supabase credentials
// These must be prefixed with VITE_ to be available in the client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are not set. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}



export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'mekh-supabase-auth',
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
  // Remove the global.fetch override completely
});

// Prevent free-tier cold starts by pinging periodically.
// Connection-aware: skip entirely on slow connections (2G/3G) to save bandwidth.
// Only ping when the page is visible to save battery & data on mobile.
// Delayed by 30s to avoid competing with critical resource loading.
if (typeof document !== 'undefined') {
  let keepAlive: ReturnType<typeof setInterval> | null = null;
  let initialDelayDone = false;
  const ping = () => { supabase.from('articles').select('id').limit(1).then(() => {}); };

  const getKeepAliveInterval = (): number => {
    const conn = (navigator as any).connection || (navigator as any).mozConnection;
    if (conn) {
      const effectiveType = conn.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g' || conn.saveData) {
        return 0; // Disabled on slow connections
      }
      if (effectiveType === '3g') {
        return 10 * 60 * 1000; // 10 minutes on 3G
      }
    }
    return 5 * 60 * 1000; // 5 minutes default (was 3 min)
  };

  const toggleKeepAlive = () => {
    if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }

    if (document.visibilityState === 'visible' && initialDelayDone) {
      const interval = getKeepAliveInterval();
      if (interval > 0) {
        keepAlive = setInterval(ping, interval);
      }
    }
  };

  // Delay the first keepalive setup by 30s so initial page load gets full bandwidth
  setTimeout(() => {
    initialDelayDone = true;
    toggleKeepAlive();
  }, 30_000);

  document.addEventListener('visibilitychange', toggleKeepAlive);
}

// Security: Add auth state change listener - only log events in dev mode
supabase.auth.onAuthStateChange((event, session) => {
  if (import.meta.env.DEV) {
    console.log('[SUPABASE AUTH] Event:', event, session ? '(session exists)' : '(no session)');
  }
  
  if (event === 'SIGNED_IN') {
    if (import.meta.env.DEV) console.log('[SUPABASE AUTH] User signed in');
  } else if (event === 'SIGNED_OUT') {
    if (import.meta.env.DEV) console.log('[SUPABASE AUTH] User signed out');
  } else if (event === 'USER_UPDATED') {
    if (import.meta.env.DEV) console.log('[SUPABASE AUTH] User updated');
  } else if (event === 'INITIAL_SESSION') {
    if (import.meta.env.DEV) console.log('[SUPABASE AUTH] Initial session loaded');
  }
});

// Export a function to manually refresh the session with error handling
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      if (import.meta.env.DEV) console.error('[SUPABASE] Manual refresh error:', error.message);
      throw error;
    }
    if (import.meta.env.DEV) console.log('[SUPABASE] Manual refresh success:', !!data.session);
    return data;
  } catch (err: any) {
    if (import.meta.env.DEV) console.error('[SUPABASE] Manual refresh failed:', err.message || err);
    throw err;
  }
};

// Export a function to check if the error is CORS-related
export const isCorsError = (error: any): boolean => {
  if (!error) return false;
  const message = error.message || String(error);
  return (
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.includes('Network request failed') ||
    message.includes('CORS') ||
    message.includes('access-control')
  );
};
