import React, { useState, useEffect } from 'react';

interface VideoThumbnailProps {
  thumbnailUrl?: string | null;
  alt: string;
  className?: string;
  platform?: 'tiktok' | 'youtube' | 'instagram' | string;
  onError?: () => void;
}

/**
 * Optimized video thumbnail component with lazy loading and blur-up effect
 * Similar to OptimizedImage but specifically for video thumbnails
 */
export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  thumbnailUrl,
  alt,
  className = '',
  platform,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!thumbnailUrl) {
      setHasError(true);
      return;
    }

    setIsLoaded(false);
    setHasError(false);

    // Preload the image
    const img = new Image();
    img.src = thumbnailUrl;
    img.onload = () => {
      setIsLoaded(true);
    };
    img.onerror = () => {
      setHasError(true);
      onError?.();
    };
  }, [thumbnailUrl, onError]);

  if (hasError) {
    if (platform === 'tiktok') {
      return (
        <div className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center rounded-lg border border-slate-700/50 ${className}`}>
          <svg className="w-8 h-8 text-white/20 mb-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 15.68l.01.2a6.29 6.29 0 0010.57 4.1h.02a6.22 6.22 0 001.76-4.52V8.41a8.31 8.31 0 004.23 1.15v-3a5.52 5.52 0 01-2-1.07V6.69z"/>
          </svg>
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">TikTok Video</span>
        </div>
      );
    }
    return (
      <div className={`absolute inset-0 bg-slate-800 flex items-center justify-center rounded-lg ${className}`}>
        <span className="text-slate-500 text-xs">Video Unavailable</span>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ aspectRatio: '16/9', backgroundColor: '#f3f4f6' }}>
      <img 
        src={thumbnailUrl || ''} 
        alt={alt}
        className={`${className} ${!isLoaded ? 'blur-sm opacity-70' : ''} transition-all duration-300`}
        loading="lazy"
        decoding="async"
        width={320}
        height={180}
        onError={() => {
          setHasError(true);
          onError?.();
        }}
      />
    </div>
  );
};
