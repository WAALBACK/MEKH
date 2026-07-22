import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Extend Navigator interface for PWA standalone mode
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

const GuestBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check if running in PWA standalone mode
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isTab = window.matchMedia('(display-mode: tabbed)').matches;
      const isIOSStandalone = (window.navigator as Navigator).standalone === true;
      setIsPWA(isStandalone || isTab || isIOSStandalone);
    };
    checkPWA();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkPWA);
  }, []);

  // ── Scroll hide / show (rAF-throttled to reduce jank on low-end devices) ──
  useEffect(() => {
    let ticking = false;
    let currentY = 0;

    const handleScroll = () => {
      currentY = window.scrollY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          if (currentY < 10) {
            setIsVisible(true);
          } else if (currentY > lastScrollY && currentY > 50) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
          setLastScrollY(currentY);
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isActive = (path: string) => location.pathname === path;

  const activeClass = "text-blue-500 transition-colors";
  const inactiveClass = "text-gray-500 hover:text-white transition-colors";

  // Handle home button click with refresh
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // Already on home page, trigger a refresh by navigating with state
      window.location.reload();
    } else {
      // Navigate to home page
      navigate('/');
    }
  };

  // Show on mobile only (< 640px / sm breakpoint) OR in PWA standalone mode on mobile
  const showNav = !window.matchMedia('(min-width: 640px)').matches || (isPWA && !window.matchMedia('(min-width: 640px)').matches);

  return (
    showNav ? (
    <nav className={`fixed bottom-0 left-0 right-0 flex sm:hidden bg-slate-900 border-t border-slate-800 p-3 justify-around z-50 rounded-t-lg transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'} ${!isVisible ? 'pointer-events-none' : ''}`} style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <Link to="/" onClick={handleHomeClick} className={`flex flex-col items-center ${isActive('/') && !isActive('/blogs') ? activeClass : inactiveClass}`}>
        <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <span className="text-xs font-medium">Home</span>
      </Link>
      <Link to="/roadside-emergency" className={`flex flex-col items-center ${isActive('/roadside-emergency') ? activeClass : inactiveClass}`}>
        <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span className="text-xs font-medium">SOS</span>
      </Link>
      <Link to="/guest-menu" className={`flex flex-col items-center ${isActive('/guest-menu') ? activeClass : inactiveClass}`}>
        <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
        <span className="text-xs font-medium">Menu</span>
      </Link>
    </nav>
    ) : null
  );
};

export default GuestBottomNav;
