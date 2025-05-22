import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import logoImage from '../assets/images/logo.png';

export default function Navigation() {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) return null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#0a192f]/90 backdrop-blur-md py-3 shadow-lg"
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImage} alt="OpenLearn Logo" className="h-16 w-auto" />
          </Link>
        </div>
        
        {user && (
          <div className="hidden md:flex items-center gap-6">
            <nav>
              <ul className="flex gap-6">
                <li>
                  <Link to="/dashboard" className="text-gray-300 hover:text-teal-400 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/english" className="text-gray-300 hover:text-teal-400 transition-colors">
                    English
                  </Link>
                </li>
                <li>
                  <Link to="/chatbot" className="text-gray-300 hover:text-teal-400 transition-colors">
                    ChatBot
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
        
        <div className="flex items-center">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300 hidden sm:inline-block">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="border border-teal-400 text-teal-400 hover:bg-teal-400/10 transition-colors px-4 py-2 rounded-md"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/auth"
                className="border border-teal-400 text-teal-400 hover:bg-teal-400/10 transition-colors px-4 py-2 rounded-md"
              >
                Login
              </Link>
              <Link
                to="/auth?tab=signup"
                className="bg-teal-500 hover:bg-teal-600 text-white transition-colors px-4 py-2 rounded-md"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
