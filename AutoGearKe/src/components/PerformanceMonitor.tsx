/**
 * Performance monitoring component for development
 */

import React, { useEffect, useState } from 'react';
import { getSyncStatus } from '../lib/backgroundSync';

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
  cacheHits: number;
  syncQueue: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    cacheHits: 0,
    syncQueue: 0,
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const updateMetrics = () => {
      const loadTime = performance.now();
      const syncStatus = getSyncStatus();
      
      let memoryUsage;
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        memoryUsage = {
          used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024),
        };
      }

      setMetrics({
        loadTime,
        memoryUsage,
        cacheHits: parseInt(localStorage.getItem('cache_hits') || '0'),
        syncQueue: syncStatus.pending,
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded font-mono z-50">
      <div>Load: {Math.round(metrics.loadTime)}ms</div>
      {metrics.memoryUsage && (
        <div>
          Memory: {metrics.memoryUsage.used}MB / {metrics.memoryUsage.limit}MB
        </div>
      )}
      <div>Cache: {metrics.cacheHits} hits</div>
      <div>Sync: {metrics.syncQueue} pending</div>
    </div>
  );
};