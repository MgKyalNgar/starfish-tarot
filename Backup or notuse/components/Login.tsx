'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LoginProps {
  setGuestMode: (isGuest: boolean) => void;
}

export default function Login({ setGuestMode }: LoginProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    if (!email) {
        setError('Please enter your email address.');
        setLoading(false);
        return;
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
        setError('An unexpected error occurred.');
    } finally {
        setLoading(false);
    }
  };

  const handleGuestMode = () => {
    setGuestMode(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="text-center p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-200 mb-4">
            Check your email
          </h1>
          <p className="text-slate-300">
            A magic login link has been sent to <strong>{email}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 mb-2 drop-shadow-lg">
          Starfish Tarot
        </h1>
        <p className="text-slate-300 text-sm md:text-base">
          Sign in to save your daily draws or continue as a guest.
        </p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-xl max-w-sm w-full">
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-slate-700/50 text-white rounded-lg border border-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-full font-semibold shadow-lg shadow-cyan-900/50 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Sign In with Magic Link'}
          </button>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </form>
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="bg-slate-800 px-2 text-slate-400">or</span>
            </div>
        </div>
        <button
          onClick={handleGuestMode}
          className="w-full px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-purple-900/50 transition-all transform hover:scale-105 active:scale-95"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
