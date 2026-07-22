/**
 * Memory optimization utilities for better performance
 */

// Cleanup registry to track and cleanup resources
const cleanupRegistry = new Set<() => void>();

/**
 * Register a cleanup function to be called when memory needs to be freed
 */
export const registerCleanup = (cleanup: () => void) => {
  cleanupRegistry.add(cleanup);
  
  // Return unregister function
  return () => {
    cleanupRegistry.delete(cleanup);
  };
};

/**
 * Force cleanup of registered resources
 */
export const forceCleanup = () => {
  cleanupRegistry.forEach(cleanup => {
    try {
      cleanup();
    } catch (error) {
      console.warn('Cleanup function failed:', error);
    }
  });
};

/**
 * Memory pressure detection and automatic cleanup
 */
export const setupMemoryPressureHandling = () => {
  // Listen for memory pressure events (Chrome/Edge)
  if ('memory' in performance && 'addEventListener' in performance) {
    (performance as any).addEventListener('memory', (event: any) => {
      if (event.detail && event.detail.pressure === 'critical') {
        console.log('[Memory] Critical memory pressure detected, cleaning up...');
        forceCleanup();
      }
    });
  }

  // Fallback: Monitor memory usage periodically
  if ('memory' in performance) {
    const checkMemoryPressure = () => {
      const memInfo = (performance as any).memory;
      if (memInfo) {
        const usedRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
        
        // If using more than 80% of available memory, trigger cleanup
        if (usedRatio > 0.8) {
          console.log('[Memory] High memory usage detected, cleaning up...');
          forceCleanup();
        }
      }
    };

    // Check every 30 seconds
    setInterval(checkMemoryPressure, 30000);
  }

  // Page visibility change cleanup
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden, good time to cleanup
      setTimeout(forceCleanup, 1000);
    }
  });
};

/**
 * Debounce function to prevent excessive calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  const cleanup = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  };
  
  registerCleanup(cleanup);
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function to limit call frequency
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Weak reference cache for objects that can be garbage collected
 */
export class WeakCache<K extends object, V> {
  private cache = new WeakMap<K, V>();
  
  get(key: K): V | undefined {
    return this.cache.get(key);
  }
  
  set(key: K, value: V): void {
    this.cache.set(key, value);
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  delete(key: K): boolean {
    return this.cache.delete(key);
  }
}

/**
 * LRU Cache with automatic cleanup
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  
  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
    
    // Register cleanup
    registerCleanup(() => {
      this.clear();
    });
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

/**
 * Image preloader with memory management
 */
export class ManagedImagePreloader {
  private images = new Set<HTMLImageElement>();
  private maxImages: number;
  
  constructor(maxImages: number = 20) {
    this.maxImages = maxImages;
    
    registerCleanup(() => {
      this.cleanup();
    });
  }
  
  preload(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      // Cleanup old images if we're at the limit
      if (this.images.size >= this.maxImages) {
        const oldImage = this.images.values().next().value;
        this.images.delete(oldImage);
        oldImage.src = '';
      }
      
      const img = new Image();
      img.onload = () => {
        this.images.add(img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }
  
  cleanup(): void {
    this.images.forEach(img => {
      img.src = '';
    });
    this.images.clear();
  }
}

/**
 * Initialize memory optimization
 */
export const initializeMemoryOptimization = () => {
  setupMemoryPressureHandling();
  
  // Log memory info in development
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const logMemoryInfo = () => {
      const memInfo = (performance as any).memory;
      if (memInfo) {
        console.log('[Memory]', {
          used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024) + 'MB',
          limit: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024) + 'MB',
        });
      }
    };
    
    // Log every minute in development
    setInterval(logMemoryInfo, 60000);
  }
};