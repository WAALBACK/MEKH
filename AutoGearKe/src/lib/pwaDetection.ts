/**
 * Utility functions for detecting PWA installation status
 */

/**
 * Check if the app is running as an installed PWA
 * Returns true if running in standalone mode (installed PWA)
 * Returns false if running in a browser
 */
export const isPWA = (): boolean => {
  // Check if running in standalone mode (iOS)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check if running as PWA on Android
  const isAndroidPWA = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
  
  // Check if running in fullscreen mode (some PWAs)
  const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
  
  // Check if running in minimal-ui mode (some PWAs)
  const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
  
  return isStandalone || isAndroidPWA || isFullscreen || isMinimalUI;
};

/**
 * Check if the device is mobile
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Check if PWA is installable (beforeinstallprompt event was fired)
 */
export const isPWAInstallable = (): boolean => {
  return !localStorage.getItem('pwaInstallDismissed') && !isPWA();
};
