/**
 * Optimize Cloudinary URLs with transformation parameters
 * Automatically converts to WebP/AVIF for better performance
 */

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit';
  quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  gravity?: 'face' | 'center' | 'auto' | 'faces';
  dpr?: 'auto' | number; // Device pixel ratio
  fetchFormat?: 'auto'; // Let Cloudinary choose best format
}

/**
 * Detect browser support for modern image formats
 */
const detectFormatSupport = (): 'avif' | 'webp' | 'auto' => {
  // Check for AVIF support
  const avifSupport = document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0;
  if (avifSupport) return 'avif';

  // Check for WebP support
  const webpSupport = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
  if (webpSupport) return 'webp';

  return 'auto';
};

// Cache format support detection
let cachedFormatSupport: 'avif' | 'webp' | 'auto' | null = null;

/**
 * Get best supported format
 */
const getBestFormat = (): 'avif' | 'webp' | 'auto' => {
  if (cachedFormatSupport === null) {
    cachedFormatSupport = detectFormatSupport();
  }
  return cachedFormatSupport;
};

/**
 * Add Cloudinary transformations to an image URL
 * Automatically uses WebP/AVIF for better compression
 */
export const optimizeCloudinaryUrl = (
  url: string,
  options: CloudinaryTransformOptions = {}
): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format,
    gravity = 'face',
    dpr = 'auto',
    fetchFormat = 'auto',
  } = options;

  // Build transformation string
  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  
  // Use best format if not specified
  const bestFormat = format || getBestFormat();
  if (bestFormat !== 'auto') {
    transformations.push(`f_${bestFormat}`);
  } else {
    // Let Cloudinary auto-detect best format
    transformations.push('f_auto');
  }
  
  if (gravity && crop === 'fill') transformations.push(`g_${gravity}`);
  if (dpr) transformations.push(`dpr_${dpr}`);

  const transformString = transformations.join(',');

  // Insert transformations into URL
  // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{path}
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const beforeUpload = url.substring(0, uploadIndex + 8); // Include '/upload/'
  const afterUpload = url.substring(uploadIndex + 8);

  // Check if there are already transformations
  const existingTransformIndex = afterUpload.indexOf('/');
  if (existingTransformIndex > 0 && !afterUpload.startsWith('v')) {
    // There are existing transformations, replace them
    const pathStart = afterUpload.indexOf('/', existingTransformIndex + 1);
    const path = afterUpload.substring(pathStart);
    return `${beforeUpload}${transformString}${path}`;
  }

  // No existing transformations, add them
  return `${beforeUpload}${transformString}/${afterUpload}`;
};

/**
 * Preset transformations for common use cases
 * All presets automatically use WebP/AVIF for optimal compression
 */
export const CloudinaryPresets = {
  /** Small thumbnail for menu icons (100x100) - WebP/AVIF, low quality */
  menuIcon: (url: string) =>
    optimizeCloudinaryUrl(url, {
      width: 100,
      height: 100,
      crop: 'fill',
      quality: 'auto:low',
      dpr: 'auto',
    }),

  /** Medium thumbnail for cards (300x300) - WebP/AVIF, good quality */
  cardThumbnail: (url: string) =>
    optimizeCloudinaryUrl(url, {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto:good',
      dpr: 'auto',
    }),

  /** Large profile image (600x600) - WebP/AVIF, best quality */
  profileLarge: (url: string) =>
    optimizeCloudinaryUrl(url, {
      width: 600,
      height: 600,
      crop: 'fill',
      quality: 'auto:best',
      dpr: 'auto',
    }),

  /** Cover photo for cards (800x400) - WebP/AVIF, good quality */
  coverPhoto: (url: string) =>
    optimizeCloudinaryUrl(url, {
      width: 800,
      height: 400,
      crop: 'fill',
      quality: 'auto:good',
      dpr: 'auto',
    }),

  /** Responsive image - adapts to device */
  responsive: (url: string, width: number) =>
    optimizeCloudinaryUrl(url, {
      width,
      crop: 'limit', // Don't upscale
      quality: 'auto',
      dpr: 'auto',
    }),

  /** Gallery image - high quality */
  gallery: (url: string) =>
    optimizeCloudinaryUrl(url, {
      width: 1200,
      crop: 'limit',
      quality: 'auto:best',
      dpr: 'auto',
    }),

  /** Thumbnail grid - small, optimized */
  thumbnailGrid: (url: string) =>
    optimizeCloudinaryUrl(url, {
      width: 200,
      height: 200,
      crop: 'fill',
      quality: 'auto:low',
      dpr: 'auto',
    }),
};

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (url: string, widths: number[] = [320, 640, 960, 1280, 1920]): string => {
  return widths
    .map(width => {
      const optimizedUrl = optimizeCloudinaryUrl(url, {
        width,
        crop: 'limit',
        quality: 'auto',
        dpr: 'auto',
      });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
};

/**
 * Get optimal image based on connection quality
 */
export const getOptimalImage = (
  url: string,
  connectionQuality: 'fast' | 'moderate' | 'slow' | 'offline'
): string => {
  const qualityMap = {
    fast: 'auto:best',
    moderate: 'auto:good',
    slow: 'auto:low',
    offline: 'auto:low',
  };

  return optimizeCloudinaryUrl(url, {
    quality: qualityMap[connectionQuality] as any,
    dpr: connectionQuality === 'slow' ? 1 : 'auto',
  });
};
