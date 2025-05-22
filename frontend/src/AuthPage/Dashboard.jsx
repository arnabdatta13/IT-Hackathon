import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { useEffect } from 'react';
import { LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Extract user's name from user data
  const getUserName = () => {
    if (!user) return '';
    
    // Try to get name from user metadata
    if (user.user_metadata && user.user_metadata.name) {
      return user.user_metadata.name;
    }
    
    // Try to get name from user data
    if (user.name) {
      return user.name;
    }
    
    // Try to get first part of email as fallback
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#1e293b]/70 to-[#1e293b]/40 border border-gray-700/50 backdrop-blur-sm rounded-lg shadow-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              Welcome back, <span className="text-teal-400">{getUserName()}</span>!
            </h1>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors text-sm sm:text-base"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Sign Out</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <DashboardCard 
              title="English Practice" 
              description="Practice your English skills with interactive exercises" 
              to="/english"
              icon="📚"
            />
            <DashboardCard 
              title="ChatBot" 
              description="Talk to our AI assistant for learning science topics easily" 
              to="/chatbot"
              icon="🤖"
            />
            
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, description, to, icon }) {
  return (
    <Link 
      to={to}
      className="group block p-4 sm:p-6 bg-gradient-to-br from-[#1e293b]/80 to-[#1e293b]/60 border border-gray-700/50 hover:border-teal-500/30 backdrop-blur-sm rounded-lg shadow-xl transition-all duration-300 h-full"
    >
      <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{icon}</div>
      <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-teal-400 group-hover:text-teal-300 transition-colors">{title}</h3>
      <p className="text-sm sm:text-base text-gray-300">{description}</p>
    </Link>
  );
}
