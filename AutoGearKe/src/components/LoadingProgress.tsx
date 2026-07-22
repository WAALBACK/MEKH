import React from 'react';

interface LoadingProgressProps {
  message?: string;
}

/**
 * Loading progress indicator with branded styling.
 * Consistent with SimpleFallback for a seamless experience.
 */
export const LoadingProgress: React.FC<LoadingProgressProps> = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-[#1A56DB]">

    {/* Logo */}
    <div className="flex flex-col items-center mb-12">
      <img
        src="/assets/mekh.png"
        alt="Mekh"
        className="w-20 h-20 mb-4"
        width={80}
        height={80}
        decoding="async"
      />
      <h1 className="text-white text-3xl font-bold tracking-wide">mekh</h1>
      <p className="text-blue-200 text-sm mt-1">Automotive Services Marketplace</p>
    </div>

    {/* Animated spinner */}
    <div className="relative w-12 h-12 mb-8">
      <div className="absolute inset-0 rounded-full border-4 border-blue-400/30" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin" />
    </div>

    {/* Dynamic message */}
    <p className="text-blue-200 text-sm animate-pulse">{message}</p>

  </div>
);
