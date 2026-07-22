import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  scrollRef?: React.RefObject<HTMLElement | null> | undefined;
}

const THRESHOLD = 80;

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className = '',
  threshold = THRESHOLD,
  scrollRef, // ← add this
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isNative = Capacitor.isNativePlatform();

  // ── Shared trigger logic ──
  const triggerRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setPullDistance(threshold * 0.6);

    try {
      // Native app — rich haptic via Capacitor
      if (isNative) {
        try {
          const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch {
          // Haptics not available
        }
      }
      // Mobile web browser — basic vibration via Web API
      else if (navigator.vibrate) {
        navigator.vibrate(10); // 10ms — subtle, matches native feel
      }
      // Desktop web — no haptics (no hardware)

      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setHasTriggered(false);
      isDragging.current = false;
    }
  }, [isRefreshing, onRefresh, threshold, isNative]);

  const getScrollTop = () =>
    scrollRef?.current?.scrollTop ?? containerRef.current?.scrollTop ?? 0;

  // ── Touch events (mobile web + native) ──
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return;
    if (getScrollTop() > 0) return;
    
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
    setHasTriggered(false);
  }, [isRefreshing]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || isRefreshing) return;
    if (getScrollTop() > 0) {
      isDragging.current = false;
      setPullDistance(0);
      return;
    }

    const delta = e.touches[0].clientY - startY.current;
    if (delta < 0) return;

    const pulled = Math.min(delta * 0.45, threshold * 1.3);
    setPullDistance(pulled);

    if (pulled >= threshold && !hasTriggered) setHasTriggered(true);
  }, [isRefreshing, hasTriggered, threshold]);

  const onTouchEnd = useCallback(async () => {
    if (!isDragging.current) return;

    if (pullDistance >= threshold) {
      await triggerRefresh();
    } else {
      isDragging.current = false;
      setPullDistance(0);
      setHasTriggered(false);
    }
  }, [pullDistance, threshold, triggerRefresh]);

  // ── Mouse events (desktop web) ──
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (isRefreshing) return;
    if (getScrollTop() > 0) return;
    
    startY.current = e.clientY;
    isDragging.current = true;
    setHasTriggered(false);
  }, [isRefreshing]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || isRefreshing) return;
      if (getScrollTop() > 0) {
        isDragging.current = false;
        setPullDistance(0);
        return;
      }

      const delta = e.clientY - startY.current;
      if (delta < 0) return;

      const pulled = Math.min(delta * 0.45, threshold * 1.3);
      setPullDistance(pulled);

      if (pulled >= threshold && !hasTriggered) setHasTriggered(true);
    };

    const onMouseUp = async () => {
      if (!isDragging.current) return;

      if (pullDistance >= threshold) {
        await triggerRefresh();
      } else {
        isDragging.current = false;
        setPullDistance(0);
        setHasTriggered(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isRefreshing, hasTriggered, pullDistance, threshold, triggerRefresh]);

  // ── Visual state ──
  const spinnerOpacity = Math.min(pullDistance / threshold, 1);
  const spinnerScale = 0.5 + (pullDistance / threshold) * 0.5;
  const isTriggered = pullDistance >= threshold;
  const showIndicator = pullDistance > 4 || isRefreshing;

  return (
    <div
      className={`relative overflow-hidden h-full ${className}`}
      style={{ userSelect: isDragging.current ? 'none' : 'auto' }}
    >
      {/* ── Pull indicator ── */}
      {showIndicator && (
        <div
          className="absolute left-0 right-0 flex justify-center z-50 pointer-events-none"
          style={{
            top: 0,
            transform: `translateY(${isRefreshing ? 14 : Math.max(pullDistance * 0.4 - 36, -36)}px)`,
            opacity: isRefreshing ? 1 : spinnerOpacity,
            transition: isRefreshing || !isDragging.current ? 'transform 0.25s ease, opacity 0.2s ease' : 'none',
          }}
        >
          <div
            className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center"
            style={{
              transform: `scale(${isRefreshing ? 1 : spinnerScale})`,
              transition: isRefreshing ? 'transform 0.2s ease' : 'none',
            }}
          >
            {isRefreshing ? (
              /* Spinning arc */
              <svg
                className="w-5 h-5 text-blue-500 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12" cy="12" r="9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeDasharray="42"
                  strokeDashoffset="12"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              /* Arrow — flips + turns blue at threshold */
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  color: isTriggered ? '#3b82f6' : '#94a3b8',
                  transform: isTriggered ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease, color 0.15s ease',
                }}
              >
                <path
                  d="M12 5v14M5 12l7 7 7-7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.38}px)` : 'none',
          transition: isDragging.current ? 'none' : 'transform 0.25s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;