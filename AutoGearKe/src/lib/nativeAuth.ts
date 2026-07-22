import { App, type URLOpenListenerEvent } from '@capacitor/app';
import { supabase } from './supabase';
import { isNative } from './platform';

let deepLinkListenerSetup = false;

export function setupNativeAuthListener() {
  if (!isNative || deepLinkListenerSetup) return;
  deepLinkListenerSetup = true;

  App.addListener('appUrlOpen', async (event: URLOpenListenerEvent) => {
    const url = event.url;

    // Supabase OAuth or email confirmation callback
    // Handles tokens in fragment (#) or query (?)
    if (
      url.includes('access_token') ||
      url.includes('refresh_token') ||
      url.includes('code=') ||
      url.includes('token_hash=') ||
      url.includes('type=signup') ||
      url.includes('type=recovery')
    ) {
      try {
        // Primary: PKCE code exchange (works for Google OAuth deep links)
        const { error } = await supabase.auth.exchangeCodeForSession(url);

        if (error) {
          console.warn('[NATIVE AUTH] exchangeCodeForSession did not succeed, trying hash token fallback');

          // Fallback for implicit/hash-based tokens (#access_token=...&refresh_token=...)
          const hash = url.split('#')[1] || '';
          const hashParams = new URLSearchParams(hash);

          const access_token = hashParams.get('access_token');
          const refresh_token = hashParams.get('refresh_token');

          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          }
        }
      } catch (e) {
        console.error('[NATIVE AUTH] Failed to process deep link auth URL:', e);
      }
    }
  });
}
