import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

const ClientBottomNav: React.FC<{ isClient: boolean }> = ({ isClient }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible]     = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);



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

  // ── Active helper ─────────────────────────────────────────────────────────
  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  const active   = 'text-blue-500';
  const inactive = 'text-gray-500 hover:text-white';

  // Handle home button click with refresh
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // Already on home page, trigger a refresh by reloading
      window.location.reload();
    } else {
      // Navigate to home page
      navigate('/');
    }
  };

  // Only render for authenticated clients
  // md:hidden handles tablet + desktop hiding via CSS — no JS needed
  if (!isClient) return null;

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50
        sm:hidden
        backdrop-blur-md
         bg-slate-900 border-t border-slate-800
        rounded-t-2xl
        flex justify-around items-end
        transition-transform duration-100
        ${isVisible ? 'translate-y-0' : 'translate-y-full pointer-events-none'}
      `}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {/* Home */}
      <Link
        to="/"
        onClick={handleHomeClick}
        className={`flex flex-col items-center gap-0.5 px-3 pt-3 pb-1 transition-colors ${
          isActive('/') && !isActive('/bookings') && !isActive('/blogs') && !isActive('/menu') && !isActive('/roadside-emergency')
            ? active : inactive
        }`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
      </Link>

      {/* SOS */}
      <Link
        to="/roadside-emergency"
        className={`flex flex-col items-center gap-0.5 px-3 pt-3 pb-1 transition-colors ${
          isActive('/roadside-emergency') ? active : inactive
        }`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span className="text-[10px] font-black uppercase tracking-widest">SOS</span>
      </Link>

      {/* Bookings */}
      <Link
        to="/bookings"
        className={`flex flex-col items-center gap-0.5 px-3 pt-3 pb-1 transition-colors ${
          isActive('/bookings') ? active : inactive
        }`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
        </svg>
        <span className="text-[10px] font-black uppercase tracking-widest">Bookings</span>
      </Link>


      {/* Menu */}
      <Link
        to="/menu"
        className={`flex flex-col items-center gap-0.5 px-3 pt-3 pb-1 transition-colors ${
          isActive('/menu') ? active : inactive
        }`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
        <span className="text-[10px] font-black uppercase tracking-widest">Menu</span>
      </Link>
    </nav>
  );
};

export default ClientBottomNav;