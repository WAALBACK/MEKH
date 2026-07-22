import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import { Capacitor } from '@capacitor/core';

const AuthConfirmPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleConfirm = async () => {
      // Unified extraction: query string first, then hash fragment (Supabase sometimes uses #)
      const searchParamsUnified = new URLSearchParams(
        window.location.search || window.location.hash.replace('#', '?')
      );
      const token_hash = searchParamsUnified.get('token_hash');
      const type = searchParamsUnified.get('type') as any;
      const next = searchParamsUnified.get('next');

      console.log('[AuthConfirm] Token hash:', token_hash ? 'present' : 'missing');
      console.log('[AuthConfirm] Type:', type);
      console.log('[AuthConfirm] Full URL:', window.location.href);

      if (!token_hash || !type) {
        setStatus('error');
        setErrorMessage('Invalid confirmation link');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type,
        });

        if (error) {
          setStatus('error');
          setErrorMessage(error.message || 'Confirmation failed');
          return;
        }

        setStatus('success');

        // Wait a moment to show success message
        setTimeout(() => {
          // If we have a next URL that is a custom scheme (com.mekh.app://),
          // we must use window.location.href to trigger the native app from a browser.
          if (next?.startsWith('com.mekh.app://')) {
            window.location.href = next;

            // Fallback: If the app doesn't open (user doesn't have it or link fails),
            // redirect to the home page on the web after a delay.
            setTimeout(() => {
              navigate('/');
            }, 3000);
          }
          // Native app already inside the webview — redirect to deep link or home
          else if (Capacitor.isNativePlatform()) {
            navigate(next || '/');
          }
          // Web — go to home or specified route
          else {
            navigate(next || '/');
          }
        }, 1500);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'An unexpected error occurred');
      }
    };

    handleConfirm();
  }, [navigate]);

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4">
        <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">✕</div>
          <p className="text-red-400 font-medium text-lg mb-2">Confirmation Failed</p>
          <p className="text-slate-400 text-sm mb-4">{errorMessage}</p>
          <p className="text-slate-500 text-xs">
            The link may have expired or already been used. Please try signing up again.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4">
        <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-lg max-w-md">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <p className="text-green-400 font-medium text-lg mb-2">Email Confirmed!</p>
          <p className="text-slate-400 text-sm">
            {Capacitor.isNativePlatform() 
              ? 'Redirecting to the app...' 
              : 'Redirecting you now...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-600">
      <div className="text-white text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg font-medium">Confirming your email...</p>
        <p className="text-sm text-blue-100 mt-2">Please wait a moment</p>
      </div>
    </div>
  );
};

export default AuthConfirmPage;
