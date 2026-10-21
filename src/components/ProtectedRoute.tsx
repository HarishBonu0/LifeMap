import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { Lock, ArrowRight } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode; title?: string }> = ({ 
  children,
  title = 'Authentication Required'
}) => {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-2 text-xs text-brand-textSecondary">
        <div className="w-5 h-5 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
        <span>Verifying secure session...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-2xl border border-brand-border bg-white shadow-subtle text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-brand-navy flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-brand-navy">{title}</h2>
          <p className="text-xs text-brand-textSecondary leading-relaxed">
            Please sign in to access your personal assessment records and encrypted scenario data.
          </p>
        </div>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle transition-all"
        >
          <span>Sign In / Create Account</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  return <>{children}</>;
};
