import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  ShieldCheck, 
  Brain, 
  MessageSquare, 
  X,
  Lock,
  Sparkles
} from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  // Exactly 5 destinations as specified in Part 2
  const navItems = [
    { 
      to: '/overview', 
      label: 'Overview', 
      icon: LayoutDashboard,
      isActive: location.pathname === '/overview' || location.pathname === '/dashboard'
    },
    { 
      to: '/schemes', 
      label: 'Insurance Schemes', 
      icon: Shield,
      isActive: location.pathname.startsWith('/schemes')
    },
    { 
      to: '/plan', 
      label: 'My Plan', 
      icon: ShieldCheck,
      isActive: location.pathname.startsWith('/plan') || location.pathname === '/coverage' || location.pathname === '/simulator' || location.pathname === '/calculator'
    },
    { 
      to: '/learning', 
      label: 'Financial Learning', 
      icon: Brain,
      isActive: location.pathname.startsWith('/learning') || location.pathname === '/mindset' || location.pathname === '/games'
    },
    { 
      to: '/chat', 
      label: 'AI Assistant', 
      icon: MessageSquare, 
      badge: 'AI',
      isActive: location.pathname.startsWith('/chat') || location.pathname === '/assistant'
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-brand-navy/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Width 240px (w-60) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-brand-darkNavy text-white flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        aria-label="Application Sidebar Navigation"
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo variant="compact" />
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items: Exactly 5 destinations */}
          <nav className="px-3 py-4 space-y-1.5" aria-label="Main Navigation">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    item.isActive
                      ? 'bg-brand-teal text-white shadow-subtle'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-teal-400/20 text-teal-300">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Subtle Trust & Security Footer Badge */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1 text-center">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-brand-teal">
              <Lock className="w-3 h-3" /> Encrypted & Isolated
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Row-Level Security Active • Personal protection planning
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
