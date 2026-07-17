'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface OAuthButtonsProps {
  /** 'login' shows "Sign in with …", 'signup' shows "Sign up with …" */
  mode?: 'login' | 'signup';
}

export function OAuthButtons({ mode = 'login' }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState('');

  const verb = mode === 'signup' ? 'Sign up' : 'Sign in';

  async function signInWith(provider: 'google' | 'apple') {
    setError('');
    setLoadingProvider(provider);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // The callback route handles session exchange + role-based routing
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: provider === 'google' ? { prompt: 'select_account' } : undefined,
      },
    });
    if (err) {
      setError(err.message);
      setLoadingProvider(null);
    }
    // On success Supabase redirects the browser — no further action needed
  }

  return (
    <div>
      {error && (
        <div style={{
          background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)',
          borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#C25B4E', marginBottom: 14,
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Google */}
        <button
          type="button"
          onClick={() => signInWith('google')}
          disabled={loadingProvider !== null}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            height: 48, width: '100%', borderRadius: 100,
            background: 'rgba(18,36,28,0.04)', border: '1px solid rgba(18,36,28,0.12)',
            color: '#12241C', fontSize: 14, fontWeight: 600,
            cursor: loadingProvider ? 'wait' : 'pointer',
            opacity: loadingProvider && loadingProvider !== 'google' ? 0.5 : 1,
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { if (!loadingProvider) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.28)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(18,36,28,0.12)'; }}
        >
          {loadingProvider === 'google' ? (
            <span style={{ fontSize: 13, color: '#4c6157' }}>Connecting to Google…</span>
          ) : (
            <>
              <GoogleIcon />
              <span>{verb} with Google</span>
            </>
          )}
        </button>

        {/* Apple */}
        <button
          type="button"
          onClick={() => signInWith('apple')}
          disabled={loadingProvider !== null}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            height: 48, width: '100%', borderRadius: 100,
            background: 'rgba(18,36,28,0.04)', border: '1px solid rgba(18,36,28,0.12)',
            color: '#12241C', fontSize: 14, fontWeight: 600,
            cursor: loadingProvider ? 'wait' : 'pointer',
            opacity: loadingProvider && loadingProvider !== 'apple' ? 0.5 : 1,
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { if (!loadingProvider) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.28)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(18,36,28,0.12)'; }}
        >
          {loadingProvider === 'apple' ? (
            <span style={{ fontSize: 13, color: '#4c6157' }}>Connecting to Apple…</span>
          ) : (
            <>
              <AppleIcon />
              <span>{verb} with Apple</span>
            </>
          )}
        </button>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(18,36,28,0.09)' }} />
        <span style={{ fontSize: 12, color: '#7d9188', fontWeight: 500 }}>or continue with email</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(18,36,28,0.09)' }} />
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.769 10.647c-.022-2.277 1.86-3.374 1.944-3.43-1.059-1.547-2.706-1.76-3.292-1.784-1.398-.142-2.74.824-3.45.824-.71 0-1.797-.804-2.96-.782-1.514.022-2.916.882-3.696 2.237C.56 10.218 1.686 14.65 3.38 17.07c.847 1.19 1.846 2.527 3.15 2.478 1.267-.05 1.744-.814 3.275-.814 1.53 0 1.963.814 3.3.789 1.367-.022 2.228-1.21 3.067-2.407.971-1.378 1.368-2.718 1.39-2.787-.03-.013-2.663-1.019-2.793-4.682ZM11.435 3.524C12.126 2.68 12.598 1.52 12.468.32c-.99.043-2.19.66-2.903 1.486-.638.736-1.197 1.92-1.047 3.055 1.103.086 2.23-.561 2.917-1.337Z" fill="#12241C"/>
    </svg>
  );
}
