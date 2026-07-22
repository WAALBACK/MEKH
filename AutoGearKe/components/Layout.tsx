import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header.tsx';
import Footer from './Footer.tsx';
import ClientBottomNav from './ClientBottomNav.tsx';
import GuestBottomNav from './GuestBottomNav.tsx';
import TechnicianBottomNav from './TechnicianBottomNav.tsx';
import TechnicianSidebar from './TechnicianSidebar.tsx';
import { supabase } from '../src/lib/supabase';
import { getMyTechnicianProfile } from '../src/lib/auth';
import { Technician } from '../types';
import { isNative } from '../src/lib/platform';
import UpdateBanner from '../src/components/UpdateBanner.tsx';
import { useAuthState, useInvalidateAuth } from '../src/hooks/useAuthQuery';
import { registerCleanup } from '../src/lib/memoryOptimization';

// Create context for main ref
const MainRefContext = createContext<React.RefObject<HTMLElement | null> | undefined>(undefined);

export const useMainRef = () => useContext(MainRefContext);

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use React Query for auth state management
  const {
    session,
    userRole,
    isClient,
    isTechnician,
    technicianProfile,
    isLoading,
    isAuthenticated,
  } = useAuthState();

  // Get auth invalidation functions
  const { invalidateAll } = useInvalidateAuth();

  const [isPWA, setIsPWA] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [technician, setTechnician] = useState<Technician | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);
  const mounted = useRef(true);

  // Set technician profile from React Query
  useEffect(() => {
    if (technicianProfile) {
      setTechnician(technicianProfile);
    }
  }, [technicianProfile]);

  // Register cleanup for memory optimization
  useEffect(() => {
    const cleanup = registerCleanup(() => {
      // Cleanup any subscriptions or timers
      mounted.current = false;
    });
    
    return cleanup;
  }, []);

  const checkClient = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return false;
      }

      const { data: clientProfile } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      return !!clientProfile;
    } catch (error) {
      console.error('Layout: Error checking client status:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkPWA = () => {
      const isStandalone    = window.matchMedia('(display-mode: standalone)').matches;
      const isTab           = window.matchMedia('(display-mode: tabbed)').matches;
      const isIOSStandalone = (window.navigator as Navigator).standalone === true;
      setIsPWA(isStandalone || isTab || isIOSStandalone);
    };
    checkPWA();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkPWA);
  }, []);

  const isTechnicianRoute = location.pathname === '/technician-dashboard' ||
                            location.pathname === '/technician-menu';
  const isMenuPage        = location.pathname === '/menu' ||
                            location.pathname === '/guest-menu';

  // Simplified auth state management using React Query
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handleProfileComplete = () => checkClient();
    window.addEventListener('client-profile-complete', handleProfileComplete);
    
    // Listen for user sign-in events to update UI immediately
    const handleUserSignedIn = async (event: any) => {
      const { session } = event.detail || {};
      console.log('[Layout] User signed in event received, updating UI');
      // React Query will handle the state updates automatically
    };
    
    // Listen for user sign-out events to clear React Query cache
    const handleUserSignedOut = () => {
      console.log('[Layout] User signed out event received, clearing auth cache');
      invalidateAll();
      // Navigate to home page after sign out
      navigate('/', { replace: true });
    };
    
    window.addEventListener('user-signed-in', handleUserSignedIn);
    window.addEventListener('user-signed-out', handleUserSignedOut);
    
    return () => {
      window.removeEventListener('client-profile-complete', handleProfileComplete);
      window.removeEventListener('user-signed-in', handleUserSignedIn);
      window.removeEventListener('user-signed-out', handleUserSignedOut);
    };
  }, [invalidateAll, navigate]);

  // Listen for auth role detection from deep link callback (native app)
  useEffect(() => {
    const handleAuthRoleDetected = async (event: any) => {
      const { role, userId } = event.detail || {};
      console.log('[Layout] Auth role detected from deep link:', role);
      // React Query will handle the state updates automatically
    };
    
    // Listen for auth cache invalidation requests
    const handleInvalidateAuthCache = () => {
      console.log('[Layout] Invalidating auth cache after OAuth success');
      invalidateAll();
    };
    
    window.addEventListener('auth-role-detected', handleAuthRoleDetected);
    window.addEventListener('invalidate-auth-cache', handleInvalidateAuthCache);
    
    return () => {
      window.removeEventListener('auth-role-detected', handleAuthRoleDetected);
      window.removeEventListener('invalidate-auth-cache', handleInvalidateAuthCache);
    };
  }, [invalidateAll]);

  // Fetch latest app version from Supabase (for native updates)
  useEffect(() => {
    if (!isNative) return;

    const checkForUpdate = async () => {
      try {
        const { data, error } = await supabase
          .from('app_versions')
          .select('latest_version')
          .eq('platform', 'android')
          .single();

        if (error || !data) return;

        const CURRENT_VERSION = '1.0.0'; // ← Update this before every APK release
        const latestVersion = data.latest_version;

        if (latestVersion && latestVersion !== CURRENT_VERSION) {
          setShowUpdateBanner(true);
        }
      } catch (err) {
        console.error('Failed to check app version:', err);
      }
    };

    checkForUpdate();
  }, []);

  const showTechnicianSidebar =
    isTechnicianRoute &&
    !isLoading &&
    isTechnician &&
    !isPWA &&
    window.matchMedia('(min-width: 640px)').matches;

  return (
    <MainRefContext.Provider value={mainRef}>
      <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-900 overflow-hidden">

      {showUpdateBanner && (
        <UpdateBanner
          latestVersion="Check Play Store"
          currentVersion="1.0.0"
          onUpdate={() => {
            // Open Play Store when user taps Update
            window.open('https://play.google.com/store/apps/details?id=com.mekh.app', '_blank');
          }}
        />
      )}

      {/* Header gets auth state as props — no duplicate auth calls */}
      <Header
        isTechnician={isTechnician}
        technician={technician}
        session={session}
        userRole={userRole}
      />

      {showTechnicianSidebar && (
        <div className="flex flex-1 overflow-hidden">
          <TechnicianSidebar technician={technician} />
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>
        </div>
      )}

      {!showTechnicianSidebar && (
        <main ref={mainRef} className={`flex-1 w-full overflow-y-auto ${showUpdateBanner ? 'pt-16' : ''}`}>
          <div className="max-w-7xl mx-auto pb-20 lg:pb-0">
            {children}
          </div>
          {!isTechnicianRoute && <Footer />}
        </main>
      )}

      {isMenuPage ? null : (
        <div className={`${isNative ? '' : 'sm:hidden'} fixed bottom-0 left-0 right-0 z-50`}>
          {isTechnician && !isLoading && <TechnicianBottomNav />}
          {!isTechnician && !isLoading && (isAuthenticated
            ? <ClientBottomNav isClient={isClient || userRole === 'client'} />
            : <GuestBottomNav />
          )}
        </div>
      )}
    </div>
    </MainRefContext.Provider>
  );
};

export default Layout;