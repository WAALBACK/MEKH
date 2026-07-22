import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { SplashScreen } from '@capacitor/splash-screen';

// Critical pages - load immediately
import Layout from './components/Layout.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { UpdatePrompt } from './src/components/UpdatePrompt';
import { OfflineFallback } from './src/components/OfflineFallback';
import { LoadingProgress } from './src/components/LoadingProgress';
import { isPWA } from './src/lib/pwaDetection';
import { isSlowConnection } from './src/lib/connectionQuality';
import { initializeNotifications } from './src/lib/notifications';

// Import eagerly — don't lazy load auth routes
import AuthCallback from './pages/AuthCallback.tsx';

// Lazy load ALL pages for better initial load performance
const HomePage = lazy(() => import('@/src/page/HomePage.tsx'));
const AuthPage = lazy(() => import('./pages/AuthPage.tsx'));
const JoinPage = lazy(() => import('./pages/JoinPage.tsx'));
const TechnicianProfilePage = lazy(() => import('./pages/TechnicianProfilePage.tsx'));
const NearbyTechniciansPage = lazy(() => import('./pages/NearbyTechniciansPage.tsx'));
const CarMechanicsNearMePage = lazy(() => import('./pages/CarMechanicsNearMePage.tsx'));
const ServiceLocationPage = lazy(() => import('./pages/ServiceLocationPage.tsx'));
const RoadsideEmergencyPage = lazy(() => import('./pages/RoadsideEmergencyPage.tsx'));
const EmergencyTechnicianPage = lazy(() => import('./pages/EmergencyTechnicianPage.tsx'));

// Admin and dashboard pages - only load when needed
const AdminPage = lazy(() => import('./pages/AdminPage.tsx'));
const TechnicianDashboardPage = lazy(() => import('./pages/TechnicianDashboardPage.tsx'));
const ClientProfilePage = lazy(() => import('./pages/ClientProfilePage.tsx'));
const ClientOnboardingPage = lazy(() => import('./pages/ClientOnboardingPage.tsx'));
const BookingsPage = lazy(() => import('./pages/BookingsPage.tsx'));

// Blog pages
const BlogPage = lazy(() => import('./pages/BlogPage.tsx'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage.tsx'));

// Static pages - lowest priority
const ContactPage = lazy(() => import('./pages/ContactPage.tsx'));
const TermsPage = lazy(() => import('./pages/TermsPage.tsx'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage.tsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.tsx'));
const DeleteAccountPage = lazy(() => import('./pages/DeleteAccountPage.tsx'));
const MenuPage = lazy(() => import('./pages/MenuPage.tsx'));
const GuestMenuPage = lazy(() => import('./pages/GuestMenuPage.tsx'));
const TechnicianMenuPage = lazy(() => import('./pages/TechnicianMenuPage.tsx'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage.tsx'));
const AuthConfirm = lazy(() => import('./pages/AuthConfirmPage'));
const AppRedirect = lazy(() => import('./pages/AppRedirect.tsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.tsx'));
const EstimatePage = lazy(() => import('./pages/EstimatePage.tsx'));
import { isTechnicianProfileComplete } from './src/lib/auth';
import { isClientOnboardingComplete } from './src/lib/api';
import { supabase } from './src/lib/supabase';
import { getCachedAuthState, getProgressiveAuthState } from './src/lib/authCache';
import { setupBackgroundSync } from './src/lib/backgroundSync';

// Create React Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry auth errors
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 2;
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ErrorBoundary>
            <AppContent />
        </ErrorBoundary>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

const AppContent: React.FC = () => {
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [chunkError, setChunkError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthRedirecting, setIsAuthRedirecting] = useState(false);
  const [isOAuthInProgress, setIsOAuthInProgress] = useState(false);
  const navigate = useNavigate();

  // ── PWA state (must be declared before any useEffect or JSX that references them) ──
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [os, setOs] = useState<'android' | 'ios' | 'other'>('other');
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  
  // Check if running as PWA
  const isRunningAsPWA = isPWA();

  // Detect OS and decide whether to show install banner
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    let currentOs: 'android' | 'ios' | 'other' = 'other';
    
    if (/android/i.test(userAgent)) {
      currentOs = 'android';
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      currentOs = 'ios';
    }
    setOs(currentOs);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    
    if (!isStandalone && !localStorage.getItem('pwaInstallDismissed')) {
      if (currentOs === 'ios' || currentOs === 'android') {
        setShowInstallBanner(true);
      }
    }
  }, []);

  // ── Auth: check profile completion with progressive loading ──
  const checkProfileCompletion = useCallback(async (force = false) => {
    try {
      // Use progressive auth state - get cached immediately, fresh in background
      const { immediate, fresh } = await getProgressiveAuthState();
      
      // Use cached state immediately if available and not forced
      if (immediate && !force) {
        setIsAuthenticated(!!immediate.session);
        setCheckingProfile(false);
        
        // Handle navigation based on cached state
        if (immediate.session) {
          const pendingUserType = localStorage.getItem('pendingUserType') as 'client' | 'technician' | null;
          
          if (pendingUserType === 'technician') {
            localStorage.removeItem('pendingUserType');
            navigate('/join');
            return;
          }
        }
        
        // Get fresh state in background
        fresh.then(freshState => {
          if (freshState && freshState.session) {
            setIsAuthenticated(true);
            // Update UI if there are significant changes
            if (!immediate || immediate.userRole !== freshState.userRole) {
              window.dispatchEvent(new CustomEvent('auth-state-updated', { 
                detail: freshState 
              }));
            }
          }
        }).catch(console.warn);
        
        return;
      }

      // Fallback to traditional auth check
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;

      setIsAuthenticated(!!user);

      if (!user) {
        setCheckingProfile(false);
        return;
      }

      const pendingUserType = localStorage.getItem('pendingUserType') as 'client' | 'technician' | null;

      if (pendingUserType === 'technician') {
        localStorage.removeItem('pendingUserType');
        setCheckingProfile(false);
        navigate('/join');
        return;
      }

      const userRole = user.user_metadata?.role;

      if (userRole === 'admin') {
        setCheckingProfile(false);
        return;
      }

      if (isSlowConnection() && !force) {
        setCheckingProfile(false);
        return;
      }

      if (userRole === 'technician') {
        localStorage.setItem('redirectToTechnician', 'true');
      } else {
        try {
          const onboardingComplete = await isClientOnboardingComplete();
          if (!onboardingComplete) {
            navigate('/onboarding');
            return;
          }
        } catch (onboardingError) {
          navigate('/onboarding');
          return;
        }
      }
    } catch (error) {
      console.warn('Error checking profile:', error);
      setIsAuthenticated(false);
    } finally {
      setCheckingProfile(false);
      if (Capacitor.isNativePlatform()) {
        SplashScreen.hide();
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const timeout = setTimeout(() => {
        SplashScreen.hide();
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, []);

  // ── Configure Status Bar for native apps ──
  useEffect(() => {
    const configureStatusBar = async () => {
      // Only run on native platforms (Android/iOS)
      if (Capacitor.isNativePlatform()) {
        try {
          // Set status bar background color to match header blue
          await StatusBar.setBackgroundColor({ color: '#1A56DB' });
          // Use light content (white icons/text) on the blue background
          await StatusBar.setStyle({ style: Style.Dark });
        } catch (error) {
          console.warn('Status bar configuration failed:', error);
        }
      }
    };
    
    configureStatusBar();
  }, []);

  // ── Initialize Push Notifications ──
  useEffect(() => {
    const initNotifications = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await initializeNotifications();
          console.log('Push notifications initialized');
        } catch (error) {
          console.warn('Push notifications initialization failed:', error);
        }
      }
    };
    
    initNotifications();
  }, []);

  // ── Initialize Background Sync ──
  useEffect(() => {
    const cleanup = setupBackgroundSync();
    return cleanup;
  }, []);

  // ── Handle Deep Link Callback for OAuth and Email Confirmation ──
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listenerHandle: any;

    const setupListener = async () => {
      listenerHandle = await CapApp.addListener('appUrlOpen', async ({ url }) => {
        console.log('[Deep Link] Received URL:', url);
        
        // Handle technician-dashboard deep link
        if (url.includes('technician-dashboard')) {
          const urlObj = new URL(url);
          const tab = urlObj.searchParams.get('tab') || 'bookings';
          navigate(`/technician-dashboard?tab=${tab}`);
          return;
        }
        
        // Handle bookings deep link (for review emails)
        if (url.includes('bookings')) {
          const urlObj = new URL(url);
          const tab = urlObj.searchParams.get('tab') || '';
          navigate(`/bookings${tab ? `?tab=${tab}` : ''}`);
          return;
        }
        
        // Handle OAuth callback
        if (url.includes('callback') && !url.includes('auth/confirm')) {
          setIsAuthRedirecting(true);
          setIsOAuthInProgress(true);
          
          // Close the browser immediately
          await Browser.close();
          
          console.log('[Deep Link] Browser closed, processing OAuth callback');
          
          // Reduced delay for faster response
          setTimeout(async () => {
            try {
              // Force refresh the session to ensure it's properly loaded
              const { data: { session }, error } = await supabase.auth.refreshSession();
              
              if (error) {
                console.error('[Deep Link] Session refresh error:', error);
                setIsAuthRedirecting(false);
                setIsOAuthInProgress(false);
                // Dispatch error event to clear loading states
                window.dispatchEvent(new CustomEvent('oauth-error'));
                return;
              }
              
              if (session) {
                console.log('[Deep Link] Session refreshed successfully');
                
                // Check if user has a role, if not, check database for client/technician profile
                let role = session.user.user_metadata?.role;
                
                if (!role) {
                  // Batch both checks for better performance
                  const [clientResult, technicianResult] = await Promise.allSettled([
                    supabase.from('clients').select('id').eq('user_id', session.user.id).maybeSingle(),
                    supabase.from('technicians').select('id').eq('user_id', session.user.id).maybeSingle()
                  ]);
                  
                  if (clientResult.status === 'fulfilled' && clientResult.value.data) {
                    role = 'client';
                  } else if (technicianResult.status === 'fulfilled' && technicianResult.value.data) {
                    role = 'technician';
                  }
                  
                  console.log('[Deep Link] Detected role:', role);
                }
                
                // Dispatch success events immediately
                window.dispatchEvent(new CustomEvent('user-signed-in', { 
                  detail: { session } 
                }));
                
                window.dispatchEvent(new CustomEvent('auth-role-detected', { 
                  detail: { role, userId: session.user.id } 
                }));

                // Invalidate React Query auth cache to refresh with new session
                window.dispatchEvent(new CustomEvent('invalidate-auth-cache'));

                // Quick UI updates
                setTimeout(() => {
                  checkProfileCompletion(true);
                  setTimeout(() => {
                    setIsAuthRedirecting(false);
                    setIsOAuthInProgress(false);
                  }, 100);
                }, 50);
              } else {
                console.warn('[Deep Link] No session after refresh');
                setIsAuthRedirecting(false);
                setIsOAuthInProgress(false);
                window.dispatchEvent(new CustomEvent('oauth-error'));
              }
            } catch (err) {
              console.error('[Deep Link] Error processing callback:', err);
              setIsAuthRedirecting(false);
              setIsOAuthInProgress(false);
              window.dispatchEvent(new CustomEvent('oauth-error'));
            }
          }, 300); // Reduced from 500ms to 300ms
        }
        
        // Handle email confirmation deep link
        if (url.includes('auth/confirm')) {
          console.log('[Deep Link] Email confirmation detected');
          
          try {
            const urlObj = new URL(url.replace('#', '?'));
            const token_hash = urlObj.searchParams.get('token_hash');
            const type = urlObj.searchParams.get('type') as any;

            if (token_hash && type) {
              console.log('[Deep Link] Verifying token in-app...');
              const { error: verifyError } = await supabase.auth.verifyOtp({
                token_hash,
                type
              });

              if (verifyError) {
                console.error('[Deep Link] In-app verification error:', verifyError);
              } else {
                console.log('[Deep Link] In-app verification successful');
              }
            }
          } catch (urlErr) {
            console.error('[Deep Link] URL parsing error:', urlErr);
          }

          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('[Deep Link] Email confirmation error:', error);
            navigate('/auth');
            return;
          }
          
          if (session) {
            console.log('[Deep Link] Email confirmed, user logged in');
            checkProfileCompletion(true);
          } else {
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession) {
                checkProfileCompletion(true);
              } else {
                navigate('/auth');
              }
            }, 1000);
          }
        }
      });
    };

    setupListener();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [navigate, checkProfileCompletion]);
  
  // Debug logging in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[PWA Detection] Running as PWA:', isRunningAsPWA);
      console.log('[PWA Detection] Is Authenticated:', isAuthenticated);
      console.log('[PWA Detection] Will show LoadingProgress:', isAuthenticated && isRunningAsPWA);
    }
  }, [isRunningAsPWA, isAuthenticated]);

  // handleInstall declared as a const so JSX can reference it
  const handleInstall = async () => {
    if (os === 'android') {
      window.location.href = 'https://play.google.com/store/apps/details?id=com.mekh.app';
    } else if (os === 'ios') {
      setShowIosInstructions(true);
    } else {
      if (!installPrompt) return;
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setInstallPrompt(null);
    }
  };

  // ── Online/Offline detection ──
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setChunkError(false);
      if (isOffline) {
        window.location.reload();
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOffline]);

  // ── Handle chunk loading errors ──
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      if (
        errorMessage.includes('Failed to fetch dynamically imported module') ||
        errorMessage.includes('Importing a module script failed') ||
        errorMessage.includes('error loading dynamically imported module')
      ) {
        event.preventDefault();
        setChunkError(true);
        setIsOffline(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // ── PWA: capture install prompt ──
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      if (localStorage.getItem('pwaInstallDismissed')) return;
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    checkProfileCompletion();
  }, [checkProfileCompletion]);

  // Listen for OAuth events from auth.ts
  useEffect(() => {
    const handleOAuthStarted = () => {
      console.log('[App] OAuth started, showing loading state');
      setIsOAuthInProgress(true);
    };
    
    const handleOAuthError = () => {
      console.log('[App] OAuth error, clearing loading state');
      setIsOAuthInProgress(false);
    };

    const handleUserSignedIn = () => {
      console.log('[App] User signed in, clearing OAuth loading state');
      setIsOAuthInProgress(false);
    };

    window.addEventListener('oauth-started', handleOAuthStarted);
    window.addEventListener('oauth-error', handleOAuthError);
    window.addEventListener('user-signed-in', handleUserSignedIn);

    return () => {
      window.removeEventListener('oauth-started', handleOAuthStarted);
      window.removeEventListener('oauth-error', handleOAuthError);
      window.removeEventListener('user-signed-in', handleUserSignedIn);
    };
  }, []);

  // Safety timeout for OAuth process
  useEffect(() => {
    if (!isOAuthInProgress) return;

    const timeout = setTimeout(() => {
      console.warn('[App] OAuth timeout reached, clearing loading state');
      setIsOAuthInProgress(false);
      setIsAuthRedirecting(false);
    }, 25000); // 25 second timeout

    return () => clearTimeout(timeout);
  }, [isOAuthInProgress]);

  // Listen for triggerProfileCompletion event
  useEffect(() => {
    const handleTriggerProfileCompletion = () => {
      const pendingUserType = localStorage.getItem('pendingUserType');
      if (pendingUserType === 'technician') {
        localStorage.removeItem('pendingUserType');
        navigate('/join');
      }
    };
    window.addEventListener('triggerProfileCompletion', handleTriggerProfileCompletion);
    return () => window.removeEventListener('triggerProfileCompletion', handleTriggerProfileCompletion);
  }, [navigate]);

  // Global auth listener - handles navigation after login across the whole app
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[App] Auth state change:', event, !!session);

      if (event === 'SIGNED_IN') {
        console.log('[App] User signed in via auth state change');
        window.dispatchEvent(new CustomEvent('user-signed-in', { detail: { session } }));
        
        // Invalidate React Query cache to refresh with new session
        window.dispatchEvent(new CustomEvent('invalidate-auth-cache'));
        
        // Only run profile check if deep link handler isn't already handling it
        if (!isAuthRedirecting) {
          setIsOAuthInProgress(true);
          setTimeout(() => {
            checkProfileCompletion(true);
            setTimeout(() => setIsOAuthInProgress(false), 300);
          }, 50);
        }
      }

      if (event === 'SIGNED_OUT') {
        console.log('[App] User signed out via auth state change');
        setIsOAuthInProgress(false);
        // The sign-out event will be handled by Layout.tsx
        window.dispatchEvent(new CustomEvent('user-signed-out'));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkProfileCompletion, isAuthRedirecting]);

  if (checkingProfile && !isAuthRedirecting && !isOAuthInProgress) {
    // Only show loading on true cold start, never during OAuth flow
    return <LoadingProgress message={Capacitor.isNativePlatform() ? "Loading..." : undefined} />;
  }

  // Show OAuth-specific loading during OAuth process
  if (isOAuthInProgress || isAuthRedirecting) {
    return <LoadingProgress message="Setting up your account..." />;
  }

  if (isOffline || chunkError) {
    return <OfflineFallback />;
  }

  return (
    <Layout>
      <Suspense fallback={
           Capacitor.isNativePlatform()
            ? <LoadingProgress message="Loading page..." />
            : <LoadingProgress message="Loading..." />
      }>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/technicians" element={<Navigate to="/" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/confirm" element={<AuthConfirm />} />
          <Route path="/auth/confirm/" element={<AuthConfirm />} />
          <Route path="/app-redirect" element={<AppRedirect />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/delete-account" element={<DeleteAccountPage />} />
          <Route path="/technician/:serviceSlug/:slug" element={<TechnicianProfilePage />} />
          <Route path="/technician/:slug" element={<TechnicianProfilePage />} />
          <Route path="/technician-dashboard" element={<TechnicianDashboardPage />} />
          <Route path="/client-dashboard" element={<Navigate to="/" replace />} />
          <Route path="/profile" element={<ClientProfilePage />} />
          <Route path="/onboarding" element={<ClientOnboardingPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/guest-menu" element={<GuestMenuPage />} />
          <Route path="/technician-menu" element={<TechnicianMenuPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
           <Route path="/ag-internal-2026" element={<AdminPage />} />
          <Route path="/technicianprofile" element={<TechnicianProfilePage />} />
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/blogs/:slug" element={<ArticleDetailPage />} />
          <Route path="/services/:service/:location" element={<ServiceLocationPage />} />
          <Route path="/nearby/:slug" element={<NearbyTechniciansPage />} />
          <Route path="/car-mechanics-near-me" element={<CarMechanicsNearMePage />} />
          <Route path="/roadside-emergency" element={<RoadsideEmergencyPage />} />
          <Route path="/roadside-emergency/technician/:slug" element={<EmergencyTechnicianPage />} />
          <Route path="/estimate" element={<EstimatePage />} />
          <Route path="/estimate/:slug" element={<EstimatePage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* PWA / App Install Banner - Only show on mobile devices */}
      {showInstallBanner && (
        showIosInstructions ? (
          <div className="fixed bottom-6 left-4 right-4 bg-blue-600 text-white rounded-2xl p-5 z-50 shadow-2xl md:hidden flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="font-bold text-sm">Install</p>
              <button 
                onClick={() => {
                  localStorage.setItem('pwaInstallDismissed', 'true');
                  setShowInstallBanner(false);
                }} 
                className="text-white opacity-80 hover:opacity-100 text-xl leading-none p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-sm">1. Tap the <span className="font-bold">Share</span> button at the bottom of Safari.</p>
            <p className="text-sm">2. Scroll down and tap <span className="font-bold">Add to Home Screen</span>.</p>
          </div>
        ) : (
          <div className="fixed bottom-6 left-4 right-4 bg-white border-2 border-blue-600 rounded-2xl p-4 flex items-center gap-3 z-50 shadow-2xl md:hidden">
            <img src="/assets/180.png" className="w-10 h-10 rounded-xl shadow-sm" alt="Mekh" loading="lazy" decoding="async" width={40} height={40} />
            <div className="flex-1">
              <p className="text-blue-700 font-bold text-sm">Install Mekh</p>
              <p className="text-slate-600 text-xs leading-tight">
                {os === 'android' ? 'Get our native app from the Play Store' : 'Add to your home screen for quick access'}
              </p>
            </div>
            <button
              onClick={handleInstall}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-colors shadow-md whitespace-nowrap"
            >
              Install
            </button>
            <button
              onClick={() => {
                localStorage.setItem('pwaInstallDismissed', 'true');
                setShowInstallBanner(false);
              }}
              className="text-slate-400 hover:text-slate-600 text-lg ml-1 p-1 leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )
      )}

      <UpdatePrompt />
    </Layout>
  );
};

export default App;
