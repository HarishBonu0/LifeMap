import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingChatButton } from './FloatingChatButton';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-textPrimary font-sans">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
      <Footer />
      <FloatingChatButton />
    </div>
  );
};
