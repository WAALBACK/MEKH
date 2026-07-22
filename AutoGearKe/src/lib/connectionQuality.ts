/**
 * Detect connection quality and adjust app behavior accordingly
 */

export type ConnectionQuality = 'fast' | 'moderate' | 'slow' | 'offline';

interface ConnectionInfo {
  quality: ConnectionQuality;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Get current connection quality
 */
export const getConnectionQuality = (): ConnectionInfo => {
  // Check if offline
  if (!navigator.onLine) {
    return { quality: 'offline' };
  }

  // Check if Network Information API is available
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (!connection) {
    // Assume moderate if we can't detect
    return { quality: 'moderate' };
  }

  const effectiveType = connection.effectiveType;
  const downlink = connection.downlink; // Mbps
  const rtt = connection.rtt; // Round-trip time in ms
  const saveData = connection.saveData;

  // User has data saver enabled - treat as slow
  if (saveData) {
    return {
      quality: 'slow',
      effectiveType,
      downlink,
      rtt,
      saveData,
    };
  }

  // Determine quality based on effective type
  let quality: ConnectionQuality = 'moderate';

  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    quality = 'slow';
  } else if (effectiveType === '3g') {
    // 3G with very high latency (common on African mobile networks) is effectively slow
    if (rtt && rtt > 400) {
      quality = 'slow';
    } else {
      quality = 'moderate';
    }
  } else if (effectiveType === '4g') {
    // Check downlink and RTT for more accurate assessment
    if (downlink && downlink < 1.5) {
      quality = 'moderate';
    } else if (rtt && rtt > 300) {
      quality = 'moderate';
    } else {
      quality = 'fast';
    }
  }

  return {
    quality,
    effectiveType,
    downlink,
    rtt,
    saveData,
  };
};

/**
 * Listen for connection changes
 */
export const onConnectionChange = (callback: (info: ConnectionInfo) => void): (() => void) => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (!connection) {
    return () => {}; // No cleanup needed
  }

  const handler = () => {
    callback(getConnectionQuality());
  };

  connection.addEventListener('change', handler);

  // Also listen for online/offline events
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);

  // Return cleanup function
  return () => {
    connection.removeEventListener('change', handler);
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
  };
};

/**
 * Check if connection is slow
 */
export const isSlowConnection = (): boolean => {
  const { quality } = getConnectionQuality();
  return quality === 'slow' || quality === 'offline';
};

/**
 * Get recommended timeout based on connection quality
 */
export const getRecommendedTimeout = (): number => {
  const { quality } = getConnectionQuality();

  switch (quality) {
    case 'fast':
      return 5000; // 5 seconds
    case 'moderate':
      return 10000; // 10 seconds
    case 'slow':
      return 20000; // 20 seconds
    case 'offline':
      return 30000; // 30 seconds
    default:
      return 10000;
  }
};

/**
 * Should we prefetch resources?
 */
export const shouldPrefetch = (): boolean => {
  const { quality, saveData } = getConnectionQuality();
  
  // Don't prefetch if data saver is on or connection is slow
  if (saveData || quality === 'slow' || quality === 'offline') {
    return false;
  }

  return true;
};

/**
 * Get image quality based on connection
 */
export const getImageQuality = (): 'low' | 'medium' | 'high' => {
  const { quality, saveData } = getConnectionQuality();

  if (saveData || quality === 'slow') {
    return 'low';
  } else if (quality === 'moderate') {
    return 'medium';
  } else {
    return 'high';
  }
};
