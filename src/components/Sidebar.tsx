import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  ShieldCheck, 
  Brain, 
  MessageSquare, 
  X,
  User,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { StorageAdapter } from '../lib/storage';
import { useTranslation } from '../i18n';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { t } = useTranslation();

  const currentUser = profile || StorageAdapter.getUserProfile();
  const displayName = currentUser.name || user?.email?.split('@')[0] || 'LifeMap Member';
  const displayEmail = user?.email || 'member@lifemap.in';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'LM';

  // Exactly 5 destinations as specified
  const navItems = [
    { 
      to: '/overview', 
      label: t('navOverview') || 'Overview', 
      icon: LayoutDashboard,
      isActive: location.pathname === '/overview' || location.pathname === '/dashboard'
    },
    { 
      to: '/schemes', 
      label: t('navSchemes') || 'Insurance Schemes', 
      icon: Shield,
      isActive: location.pathname.startsWith('/schemes')
    },
    { 
      to: '/plan', 
      label: t('navMyPlan') || 'My Plan', 
      icon: ShieldCheck,
      isActive: location.pathname.startsWith('/plan') || location.pathname === '/coverage' || location.pathname === '/simulator' || location.pathname === '/calculator'
    },
    { 
      to: '/learning', 
      label: t('navFinancialLearning') || 'Financial Learning', 
      icon: Brain,
      isActive: location.pathname.startsWith('/learning') || location.pathname === '/mindset' || location.pathname === '/games'
    },
    { 
      to: '/chat', 
      label: t('navAIAssistant') || 'AI Assistant', 
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

      {/* Sidebar Container: Vibrant, Brighter Gradient Theme */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gradient-to-b from-[#0F2F59] via-[#0B2545] to-[#07182D] text-white flex flex-col justify-between border-r border-slate-700/60 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        aria-label="Application Sidebar Navigation"
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-5 border-b border-slate-700/60 flex items-center justify-between bg-white/5 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <Logo variant="compact" />
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={t('closeSidebar') || "Close sidebar"}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items: Exactly 5 destinations */}
          <nav className="px-3 py-5 space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    item.isActive
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25 font-bold scale-[1.02]'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${item.isActive ? 'text-white' : 'text-teal-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-400/25 text-teal-200 border border-teal-400/40">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card at Bottom of Left Sidebar */}
        <div className="p-3 border-t border-slate-700/60 bg-black/20">
          <Link
            to="/profile"
            onClick={onClose}
            className="group flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all cursor-pointer"
            title={t('viewMyProfile') || "View My Profile"}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-md">
                  {initials}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0B2545]" title="Online" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-teal-300 transition-colors">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-300 truncate leading-tight mt-0.5">
                  {displayEmail}
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors flex-shrink-0" />
          </Link>
        </div>
      </aside>
    </>
  );
};

