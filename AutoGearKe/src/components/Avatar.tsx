import React from 'react';

interface AvatarProps {
  imageUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-16 h-16 text-lg',
  lg: 'w-28 h-28 text-3xl',
  xl: 'w-32 h-32 text-4xl',
};

const SIZE_PX: Record<string, number> = {
  sm: 40,
  md: 64,
  lg: 112,
  xl: 128,
};

export const Avatar = ({ imageUrl, name, size = 'md', className = '' }: AvatarProps) => {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const sizeClass = SIZE_CLASSES[size];
  const px = SIZE_PX[size];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover ${className}`}
        loading="lazy"
        decoding="async"
        width={px}
        height={px}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-blue-600 flex items-center justify-center text-[#ffff] font-bold ${className}`}>
      {initial}
    </div>
  );
};

