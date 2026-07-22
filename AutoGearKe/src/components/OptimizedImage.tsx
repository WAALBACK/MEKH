import React, { useState, useEffect } from 'react';
import { getLQIP, getOptimizedImage } from '../lib/cloudinary-advanced';
import { useLazyImage } from '../hooks/useIntersectionObserver';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'limit';
  gravity?: 'face' | 'auto';
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  placeholder?: boolean;
}

/**
 * OptimizedImage component with LQIP (Low Quality Image Placeholder) and Intersection Observer
 * Shows a tiny blurred placeholder while the full image loads
 * Perfect for slow 2G/3G connections with automatic lazy loading
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  crop = 'fill',
  gravity,
  className = '',
  loading = 'lazy',
  onLoad,
  placeholder = true,
}) => {
  const [lqipSrc, setLqipSrc] = useState('');
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
  
  // Use intersection observer for lazy loading (unless loading is eager)
  const shouldUseLazyLoading = loading === 'lazy';
  const { targetRef, imageSrc, isLoaded, shouldLoad } = useLazyImage(
    shouldUseLazyLoading ? getOptimizedImage(src, { width, height, crop, gravity }) : '',
    { rootMargin: '100px' }
  );

  // For eager loading, load immediately
  const [eagerImageSrc, setEagerImageSrc] = useState('');
  const [eagerIsLoaded, setEagerIsLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;
    
    // Generate LQIP if placeholder is enabled
    if (placeholder) {
      const lqip = getLQIP(src);
      setLqipSrc(lqip);
    }

    // Handle eager loading
    if (loading === 'eager') {
      const fullUrl = getOptimizedImage(src, { width, height, crop, gravity });
      const img = new Image();
      img.src = fullUrl;
      img.onload = () => {
        setEagerImageSrc(fullUrl);
        setEagerIsLoaded(true);
        onLoad?.();
      };
    }
  }, [src, width, height, crop, gravity, loading, onLoad, placeholder]);

  // Handle lazy loading completion
  useEffect(() => {
    if (shouldUseLazyLoading && isLoaded) {
      setIsFullImageLoaded(true);
      onLoad?.();
    }
  }, [isLoaded, shouldUseLazyLoading, onLoad]);

  // Determine which source to use
  const currentSrc = shouldUseLazyLoading 
    ? (isLoaded ? imageSrc : lqipSrc)
    : (eagerIsLoaded ? eagerImageSrc : lqipSrc);

  const isImageLoaded = shouldUseLazyLoading ? isFullImageLoaded : eagerIsLoaded;

  return (
    <img
      ref={shouldUseLazyLoading ? targetRef : undefined}
      src={currentSrc}
      alt={alt}
      className={`${className} ${
        placeholder && !isImageLoaded ? 'blur-sm' : ''
      } transition-all duration-300`}
      loading={loading}
      width={width}
      height={height}
      style={{
        backgroundColor: placeholder && !currentSrc ? '#f1f5f9' : undefined,
      }}
    />
  );
};
