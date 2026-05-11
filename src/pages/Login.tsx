import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { env } from '../config/env';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const message = (location.state as any)?.message;
  const nonceRef = React.useRef('');

  React.useEffect(() => {
    // Generate a secure, URL-safe hex nonce
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    const rawNonce = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    nonceRef.current = rawNonce;

    // Initialize Google Identity Services
    const initializeGoogle = () => {
      const google = (window as any).google;
      if (google) {
        try {
          google.accounts.id.initialize({
            client_id: env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            nonce: rawNonce,
            auto_select: false,
            use_fedcm_for_prompt: true, // Crucial for modern browser support
            cancel_on_tap_outside: true,
            context: 'signin',
            ux_mode: 'popup'
          });
          console.log('Google Identity initialized with FedCM support.');
        } catch (e) {
          console.error('Failed to initialize Google Identity:', e);
        }
      }
    };

    const timer = setTimeout(initializeGoogle, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Received Google response, signing in with IdToken...');
      const { session, error: authError } = await authService.signInWithIdToken(response.credential, nonceRef.current);
      if (authError) throw authError;
      if (session) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'Google sign in failed. Please ensure your account is verified.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.signIn(email, password);
      if (response.session) {
        navigate('/dashboard');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const google = (window as any).google;
    if (google) {
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.warn('Google native prompt failed/skipped. Falling back to standard OAuth.');
          setIsLoading(true);
          authService.signInWithGoogle().catch(err => {
            setError(err.message || 'Google sign in failed');
            setIsLoading(false);
          });
        }
      });
    } else {
      // Fallback to standard OAuth if script failed
      setIsLoading(true);
      authService.signInWithGoogle().catch(err => {
        setError(err.message || 'Google sign in failed');
        setIsLoading(false);
      });
    }
  };

  const inputClasses = "appearance-none block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FC6100] focus:border-[#FC6100] transition-all sm:text-sm";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-center text-2xl font-bold text-white">Log in to your account</h2>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-4 py-3 rounded-xl text-sm font-bold">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-bold" role="alert">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              data-testid="login-email-input"
              autoComplete="email"
              required
              className={inputClasses}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              data-testid="login-password-input"
              autoComplete="current-password"
              required
              className={inputClasses}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            data-testid="login-submit-btn"
            className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-[#FC6100] hover:bg-[#E35205] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FC6100] transition-all shadow-lg shadow-[#FC6100]/10 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Sign In'}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
            <span className="bg-[#000000] px-3 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            data-testid="login-google-btn"
            className="w-full flex justify-center items-center py-4 px-4 border border-white/10 text-sm font-bold rounded-2xl text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
        </div>
      </form>
      <div className="text-center">
        <Link to="/signup" className="text-sm font-bold text-[#FC6100] hover:underline">
          Don't have an account? Create one
        </Link>
      </div>
    </div>
  );
};
