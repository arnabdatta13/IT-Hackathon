import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { English } from "./Pages/English Practice/English";
import ChatBot from "./Pages/ChatBot/ChatBot";
import ChatBotHome from "./Pages/ChatBot/ChatBotHome";
import TestTTS from "./Pages/English Practice/Test";
import LandingPage from "./Landing/LandingPage";
import { AuthProvider, useAuth } from "./contexts/auth-context";
import { LanguageProvider } from "./contexts/language-context";
import ForgotPassword from "./AuthPage/ForgotPassword";
import ResetPassword from "./AuthPage/ResetPassword";
import AuthPage from "./AuthPage/AuthPage";
import Dashboard from "./AuthPage/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthCallback from "./AuthPage/AuthCallback";
import Navigation from "./components/Navigation";

// Layout for authenticated routes with navigation
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

// Layout for Dashboard without navigation
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] to-[#164e63] text-white">
      <main className="flex-1">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

// Layout for English and ChatBot interfaces
const FeatureLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#141c2f]">
      <Navigation />
      <main className="flex-1">{children}</main>
    </div>
  );
};

// Layout for public routes
const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] to-[#164e63]">
      {children}
    </div>
  );
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - always accessible regardless of auth status */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        }
      />

      {/* Auth routes - only accessible when logged out */}
      <Route
        path="/auth"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <PublicLayout>
              <AuthPage />
            </PublicLayout>
          )
        }
      />
      <Route
        path="/auth/callback"
        element={
          <PublicLayout>
            <AuthCallback />
          </PublicLayout>
        }
      />
      <Route
        path="/auth/forgot-password"
        element={
          <PublicLayout>
            <ForgotPassword />
          </PublicLayout>
        }
      />
      <Route
        path="/auth/reset-password"
        element={
          <PublicLayout>
            <ResetPassword />
          </PublicLayout>
        }
      />

      {/* Protected routes - only accessible when logged in */}
      <Route
        path="/dashboard"
        element={
          !user ? (
            <Navigate
              to="/auth"
              state={{ from: { pathname: "/dashboard" } }}
              replace
            />
          ) : (
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          )
        }
      />
      <Route
        path="/english"
        element={
          !user ? (
            <Navigate
              to="/auth"
              state={{ from: { pathname: "/english" } }}
              replace
            />
          ) : (
            <FeatureLayout>
              <English />
            </FeatureLayout>
          )
        }
      />
      <Route
        path="/chatbot"
        element={
          !user ? (
            <Navigate
              to="/auth"
              state={{ from: { pathname: "/chatbot" } }}
              replace
            />
          ) : (
            <FeatureLayout>
              <ChatBot />
            </FeatureLayout>
          )
        }
      />
      <Route
        path="/chatbothome"
        element={
          !user ? (
            <Navigate
              to="/auth"
              state={{ from: { pathname: "/chatbothome" } }}
              replace
            />
          ) : (
            <AuthenticatedLayout>
              <ChatBotHome />
            </AuthenticatedLayout>
          )
        }
      />
      <Route
        path="/test"
        element={
          !user ? (
            <Navigate
              to="/auth"
              state={{ from: { pathname: "/test" } }}
              replace
            />
          ) : (
            <AuthenticatedLayout>
              <TestTTS />
            </AuthenticatedLayout>
          )
        }
      />

      {/* Redirect any unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppRoutes />
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
