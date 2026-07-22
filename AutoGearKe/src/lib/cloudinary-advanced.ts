// Advanced Cloudinary utilities with LQIP (Low Quality Image Placeholder) support
// This provides blurry placeholders for slow connections
// Automatically converts all images to WebP/AVIF for optimal compression

import { Cloudinary } from '@cloudinary/url-gen';
import { quality, format, dpr } from '@cloudinary/url-gen/actions/delivery';
import { fill, scale, limitFit } from '@cloudinary/url-gen/actions/resize';
import { blur } from '@cloudinary/url-gen/actions/effect';
import { focusOn } from '@cloudinary/url-gen/qualifiers/gravity';
import { face } from '@cloudinary/url-gen/qualifiers/focusOn';
import { auto as autoQuality, autoLow, autoGood, autoBest } from '@cloudinary/url-gen/qualifiers/quality';
import { auto as autoFormat, webp, avif } from '@cloudinary/url-gen/qualifiers/format';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dqzfqhfxo';

export const cld = new Cloudinary({
  cloud: {
    cloudName
  }
});

/**
 * Detect browser support for modern image formats
 */
const detectFormatSupport = (): 'avif' | 'webp' | 'auto' => {
  // Check for AVIF support
  try {
    const avifSupport = document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0;
    if (avifSupport) return 'avif';
  } catch (e) {
    // AVIF not supported
  }

  // Check for WebP support
  try {
    const webpSupport = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
    if (webpSupport) return 'webp';
  } catch (e) {
    // WebP not supported
  }

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
 * Apply best format to image
 */
const applyBestFormat = (img: any) => {
  const bestFormat = getBestFormat();
  
  if (bestFormat === 'avif') {
    img.delivery(format(avif()));
  } else if (bestFormat === 'webp') {
    img.delivery(format(webp()));
  } else {
    img.delivery(format(autoFormat()));
  }
  
  return img;
};

/**
 * Generate a Low Quality Image Placeholder (LQIP) URL
 * This creates a tiny, blurred version (~1-2KB) that loads instantly
 * Uses WebP/AVIF for even smaller file sizes
 */
export const getLQIP = (publicId: string): string => {
  if (!publicId) return '';
  
  // Extract public ID from full URL if needed
  const extractedId = publicId.includes('cloudinary.com') 
    ? publicId.split('/upload/')[1]?.split('.')[0] || publicId
    : publicId;
  
  const img = cld.image(extractedId);
  
  img
    .resize(scale().width(20)) // Tiny 20px width
    .delivery(quality(autoLow())) // Very low quality for placeholder
    .effect(blur(1000)); // Heavy blur
  
  // Apply best format (WebP/AVIF)
  applyBestFormat(img);
  
  // Auto DPR for retina displays
  img.delivery(dpr('auto'));
  
  return img.toURL();
};

/**
 * Generate optimized image URL with responsive sizing
 * Automatically uses WebP/AVIF for 30-50% smaller file sizes
 */
export const getOptimizedImage = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'scale' | 'limit';
    gravity?: 'face' | 'auto';
    quality?: 'auto' | 'low' | 'good' | 'best';
  } = {}
) => {
  if (!publicId) return '';
  
  const extractedId = publicId.includes('cloudinary.com') 
    ? publicId.split('/upload/')[1]?.split('.')[0] || publicId
    : publicId;
  
  const img = cld.image(extractedId);
  
  // Apply resize
  if (options.width || options.height) {
    if (options.crop === 'fill') {
      const resizeAction = fill();
      if (options.width) resizeAction.width(options.width);
      if (options.height) resizeAction.height(options.height);
      if (options.gravity === 'face') {
        resizeAction.gravity(focusOn(face()));
      }
      img.resize(resizeAction);
    } else if (options.crop === 'limit') {
      const resizeAction = limitFit();
      if (options.width) resizeAction.width(options.width);
      if (options.height) resizeAction.height(options.height);
      img.resize(resizeAction);
    } else {
      const resizeAction = scale();
      if (options.width) resizeAction.width(options.width);
      if (options.height) resizeAction.height(options.height);
      img.resize(resizeAction);
    }
  }
  
  // Apply quality
  const qualityMap = {
    auto: autoQuality(),
    low: autoLow(),
    good: autoGood(),
    best: autoBest(),
  };
  img.delivery(quality(qualityMap[options.quality || 'auto']));
  
  // Apply best format (WebP/AVIF)
  applyBestFormat(img);
  
  // Auto DPR for retina displays
  img.delivery(dpr('auto'));
  
  return img.toURL();
};

/**
 * Responsive image sizes for different use cases
 * All automatically converted to WebP/AVIF
 */
export const imageSizes = {
  profileThumb: { width: 120, height: 120, crop: 'fill' as const, gravity: 'face' as const, quality: 'low' as const },
  profileFull: { width: 300, height: 300, crop: 'fill' as const, gravity: 'face' as const, quality: 'good' as const },
  cardThumbnail: { width: 400, height: 250, crop: 'fill' as const, quality: 'good' as const },
  portfolioThumb: { width: 400, height: 300, crop: 'fill' as const, quality: 'good' as const },
  portfolioFull: { width: 1200, height: 900, crop: 'limit' as const, quality: 'best' as const },
  coverBanner: { width: 1400, height: 500, crop: 'fill' as const, quality: 'good' as const },
};
