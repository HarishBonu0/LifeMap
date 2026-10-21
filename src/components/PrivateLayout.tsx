import React, { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PrivateHeader } from './PrivateHeader';
import { Footer } from './Footer';
import { FloatingChatButton } from './FloatingChatButton';
import { useAuth } from '../contexts/AuthContext';

export const PrivateLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, loading } = useAuth();

  // Show reliable session loading spinner while verifying credentials
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg text-brand-textPrimary space-y-3">
        <div className="w-8 h-8 border-3 border-brand-teal border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-brand-navy">Verifying secure session...</span>
      </div>
    );
  }

  // Redirect unauthenticated visitors to Sign In, preserving intended path
  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-textPrimary font-sans">
      {/* 1. Left Sidebar (Fixed 240px on desktop, drawer on mobile) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 2. Main Application Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-60">
        {/* Compact Private Top Bar with Page Title and Account Menu */}
        <PrivateHeader onMenuToggle={() => setSidebarOpen(true)} />

        {/* Content Outlet */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </main>

        <Footer />
      </div>

      {/* Floating AI entry point (only when not on /chat) */}
      {location.pathname !== '/chat' && <FloatingChatButton />}
    </div>
  );
};
