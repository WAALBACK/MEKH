import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import { Capacitor } from '@capacitor/core';

const AuthConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    const handleConfirm = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type') as any;
      const next = searchParams.get('next');

      if (!token_hash || !type) {
        setStatus('error');
        return;
      }

      const { error } = await supabase.auth.verifyOtp({ token_hash, type });

      if (error) {
        console.error('OTP verification failed:', error);
        setStatus('error');
        return;
      }

      // Native app — open via deep link
      if (Capacitor.isNativePlatform() && next?.startsWith('com.mekh.app://')) {
        window.location.href = next;
      } else {
        // Web — go home
        navigate('/');
      }
    };

    handleConfirm();
  }, [searchParams, navigate]);

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8">
          <p className="text-red-500 font-medium text-lg">Confirmation failed</p>
          <p className="text-gray-500 text-sm mt-2">
            This link may have expired. Please try signing up again.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="mt-4 text-blue-600 text-sm underline"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-blue-600">
      <div className="text-white text-center px-8">
        <img src="/assets/Blue logo.png" className="w-16 mx-auto mb-4" alt="Mekh" />
        <p className="text-lg font-medium">Confirming your email...</p>
        <p className="text-sm text-blue-200 mt-2">Please wait</p>
      </div>
    </div>
  );
};

export default AuthConfirm;
