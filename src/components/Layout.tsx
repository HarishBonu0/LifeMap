import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { FloatingChatButton } from './FloatingChatButton';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isAuthLanding = location.pathname === '/';
  const showSidebar = !isAuthLanding;

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-textPrimary font-sans">
      {showSidebar && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <div className={`flex-1 flex flex-col min-h-screen ${showSidebar ? 'lg:pl-64' : ''}`}>
        <Header 
          showSidebarToggle={showSidebar}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </main>
        <Footer />
      </div>

      {location.pathname !== '/chat' && <FloatingChatButton />}
    </div>
  );
};
