import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { isNative } from './platform';

/**
 * Opens the camera or photo gallery based on platform.
 * On native: Shows native camera/gallery chooser
 * On web: Falls back to file input
 */
export const takeOrPickPhoto = async (): Promise<File | null> => {
  try {
    if (isNative) {
      // Native: Use Capacitor Camera API
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera, // Opens camera directly
        saveToGallery: false,
      });

      if (!photo.webPath) return null;

      // Convert webPath to File object
      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      const file = new File([blob], `camera-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      return file;
    } else {
      // Web: Use file input fallback
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          resolve(file || null);
        };
        input.click();
      });
    }
  } catch (error) {
    console.error('Camera error:', error);
    return null;
  }
};
