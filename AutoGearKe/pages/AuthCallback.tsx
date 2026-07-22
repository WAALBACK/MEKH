import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

        if (error) {
          console.error('Auth callback error:', error);
          navigate(`/auth?error=${encodeURIComponent(error.message)}`);
          return;
        }

        if (data.session) {
          const role = data.session.user.user_metadata?.role;
          const isNewUser = data.session.user.email_confirmed_at && !data.session.user.last_sign_in_at; // first confirmation

          if (role === 'technician') {
            navigate('/join', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        } else {
          navigate('/auth', { replace: true });
        }
      } catch (err: any) {
        navigate('/auth?error=unexpected_error', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Confirming your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
