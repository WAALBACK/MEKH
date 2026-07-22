import React, { useRef, useState, useEffect, type ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  /** Vertical margin around the element before triggering (e.g. "200px") */
  rootMargin?: string;
  /** Placeholder height while not yet visible */
  minHeight?: number;
  /** Unique id for the section wrapper */
  id?: string;
  className?: string;
}

/**
 * Defers rendering of children until the section scrolls into view.
 *
 * On low-end devices and slow connections this dramatically cuts:
 *   - initial DOM size (fewer TechnicianCards mounted)
 *   - image requests (Cloudinary images only load when visible)
 *   - JS work (React reconciliation runs on fewer components)
 *
 * Uses IntersectionObserver — supported in all modern browsers.
 */
export const LazySection: React.FC<LazySectionProps> = ({
  children,
  rootMargin = '300px',
  minHeight = 200,
  id,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver not supported, render immediately
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible — content stays rendered
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} id={id} className={className}>
      {isVisible ? (
        children
      ) : (
        <div
          style={{ minHeight }}
          className="flex items-center justify-center"
          aria-hidden="true"
        >
          {/* Lightweight skeleton placeholder */}
          <div className="w-full px-4">
            <div className="h-5 bg-slate-200 rounded w-32 mb-3 animate-pulse" />
            <div className="flex gap-3 overflow-hidden">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[60vw] md:w-[44vw] lg:w-[30vw] max-w-[300px]"
                >
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden animate-pulse">
                    <div className="h-24 md:h-28 bg-slate-200" />
                    <div className="p-2">
                      <div className="h-3 bg-slate-200 rounded w-3/4 mb-1.5" />
                      <div className="h-2 bg-slate-200 rounded w-1/2 mb-2" />
                      <div className="flex gap-1 mb-2">
                        <div className="h-4 bg-slate-200 rounded w-14" />
                        <div className="h-4 bg-slate-200 rounded w-14" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
