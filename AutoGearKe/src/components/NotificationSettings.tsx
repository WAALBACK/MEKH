import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Capacitor } from '@capacitor/core';

interface NotificationSettingsProps {
  className?: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ className = '' }) => {
  const { isInitialized, hasPermission, isRegistered, requestPermissions, register, unregister } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  // Don't show on web since push notifications aren't supported
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  const handleToggleNotifications = async () => {
    setIsLoading(true);
    
    try {
      if (!hasPermission) {
        // Request permissions first
        const granted = await requestPermissions();
        if (granted) {
          await register();
        }
      } else if (!isRegistered) {
        // Register for notifications
        await register();
      } else {
        // Unregister from notifications
        await unregister();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = () => {
    if (!isInitialized) return 'Initializing...';
    if (!hasPermission) return 'Notifications disabled';
    if (!isRegistered) return 'Notifications available';
    return 'Notifications enabled';
  };

  const getStatusColor = () => {
    if (!isInitialized) return 'text-slate-400';
    if (!hasPermission) return 'text-red-400';
    if (!isRegistered) return 'text-amber-400';
    return 'text-green-400';
  };

  return (
    <div className={`bg-slate-900 border border-slate-700 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-500">
              <path d="M5.85 3.5a.75.75 0 00-1.117-1 9.719 9.719 0 00-2.348 6.242A9.719 9.719 0 002.117 15.5a.75.75 0 001.117-1A8.219 8.219 0 013.75 8.742c0-2.525 1.135-4.78 2.917-6.242z" />
              <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.91 32.91 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zm0 14.5a2 2 0 01-1.95-1.557 33.54 33.54 0 003.9 0A2 2 0 0110 16.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-blue-500 font-medium">Push Notifications</h3>
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleToggleNotifications}
          disabled={!isInitialized || isLoading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
            hasPermission && isRegistered
              ? 'bg-blue-600'
              : 'bg-slate-600'
          } ${(!isInitialized || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              hasPermission && isRegistered ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-3 h-3 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </button>
      </div>
      
      {hasPermission && isRegistered && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-slate-400 text-xs">
            You'll receive notifications about booking updates, messages from technicians, and important account information.
          </p>
        </div>
      )}
      
      {!hasPermission && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-slate-400 text-xs">
            Enable notifications to stay updated on your bookings and receive important messages from technicians.
          </p>
        </div>
      )}
    </div>
  );
};