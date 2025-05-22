import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSupabase } from '../lib/supabase-client';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = getSupabase();
        
        // Check for OAuth error in URL
        const errorDescription = searchParams.get('error_description');
        if (errorDescription) {
          throw new Error(errorDescription);
        }

        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          throw new Error('No active session found. Please try signing in again.');
        }

        // Successfully authenticated, redirect to dashboard
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        setError(error.message || 'An error occurred during authentication');
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a192f] to-[#164e63] flex flex-col items-center justify-center p-4 text-white">
        <div className="bg-red-500/20 border border-red-500/50 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="mt-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] to-[#164e63] flex flex-col items-center justify-center p-4 text-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-xl font-bold mb-2">Completing Sign In</h2>
        <p className="text-gray-300">Please wait while we authenticate your account...</p>
      </div>
    </div>
  )
}
