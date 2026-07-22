import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

const AppRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // New preferred pattern for transactional emails: ?next=com.mekh.app://...
    const next = searchParams.get('next');

    if (next) {
      if (Capacitor.isNativePlatform()) {
        window.location.href = next; // opens the native app via custom scheme
      } else {
        // On web: strip the custom scheme and navigate to the path
        const path = next.replace('com.mekh.app:/', '');
        navigate(path || '/');
      }
      return;
    }

    // Legacy pattern (still supported for existing emails): ?target=...&tab=...
    const target = searchParams.get('target') || '';
    const tab = searchParams.get('tab') || '';

    const deepLink = `com.mekh.app://${target}${tab ? `?tab=${tab}` : ''}`;
    const webFallback = `/${target}${tab ? `?tab=${tab}` : ''}`;

    // Try to open native app
    window.location.href = deepLink;

    // Fall back to web after 1.5s if app doesn't open
    const timer = setTimeout(() => {
      navigate(webFallback);
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-blue-600">
      <div className="text-white text-center px-8">
        <img src="/assets/Blue logo.png" className="w-16 mx-auto mb-4" alt="Mekh" />
        <p className="text-lg font-medium">Opening Mekh...</p>
        <p className="text-sm text-blue-200 mt-2">Redirecting you now</p>
      </div>
    </div>
  );
};

export default AppRedirect;
