import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";

export default function AuthCallback() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, supabase } = useAuth();

  useEffect(() => {
    // Handle authentication from URL hash (for OAuth callbacks)
    const handleAuthFromHash = async () => {
      // Process the hash if present in URL
      if (location.hash && location.hash.includes("access_token")) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: new URLSearchParams(location.hash.substring(1)).get(
              "access_token"
            ),
            refresh_token: new URLSearchParams(location.hash.substring(1)).get(
              "refresh_token"
            ),
          });

          if (error) throw error;
          console.log("Successfully set session from URL hash");

          // Clear the hash from the URL without reloading the page
          window.history.replaceState(null, document.title, location.pathname);
        } catch (err) {
          console.error("Error setting session from URL hash:", err);
          setError(err.message);
        }
      }
    };

    handleAuthFromHash();
  }, [location.hash, supabase.auth]);

  useEffect(() => {
    // If we have a user and not loading, redirect to dashboard
    if (!isLoading) {
      if (user) {
        console.log("User authenticated, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        // Only show error if there's no hash in the URL (as hash is being processed)
        if (!location.hash || !location.hash.includes("access_token")) {
          console.log("Authentication failed");
          setError("Authentication failed. Please try again.");
          setTimeout(() => {
            navigate("/auth", { replace: true });
          }, 3000);
        }
      }
    }
  }, [user, isLoading, navigate, location.hash]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a192f] to-[#164e63] text-white px-4">
      <div className="bg-[#1e293b]/70 border border-gray-700/50 backdrop-blur-sm rounded-lg shadow-xl p-8 w-full max-w-md">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-transparent border-teal-500 rounded-full animate-spin"></div>
            <p className="mt-6 text-lg text-center">
              Completing authentication...
            </p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-400 mb-2">
              Authentication Error
            </h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <p className="text-sm text-gray-400">
              Redirecting you back to login...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-teal-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-teal-400 mb-2">
              Authentication Successful!
            </h2>
            <p className="text-gray-300">Redirecting to your dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
