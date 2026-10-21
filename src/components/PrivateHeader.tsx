import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Globe, 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Check, 
  ShieldCheck, 
  Brain, 
  LayoutDashboard,
  Shield,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../i18n';
import { Language } from '../types';
import { StorageAdapter } from '../lib/storage';

interface PrivateHeaderProps {
  onMenuToggle: () => void;
}

export const PrivateHeader: React.FC<PrivateHeaderProps> = ({ onMenuToggle }) => {
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const languages: { code: Language; label: string; native: string; short: string }[] = [
    { code: 'en', label: 'English', native: 'English', short: 'EN' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు', short: 'తె' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी', short: 'हि' },
  ];

  // Derive human-readable page title and icon from current route
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/overview') {
      return { title: 'Overview', icon: LayoutDashboard, category: 'Dashboard' };
    }
    if (path.startsWith('/schemes')) {
      return { title: 'Insurance Schemes', icon: Shield, category: 'IRDAI Catalog' };
    }
    if (path.startsWith('/plan') || path === '/coverage' || path === '/simulator' || path === '/calculator') {
      return { title: 'My Plan', icon: ShieldCheck, category: 'Protection & Goals' };
    }
    if (path.startsWith('/learning') || path === '/mindset' || path === '/games') {
      return { title: 'Financial Learning', icon: Brain, category: 'Education & Mindset' };
    }
    if (path.startsWith('/chat') || path === '/assistant') {
      return { title: 'AI Assistant', icon: MessageSquare, category: 'Advisory Guide' };
    }
    if (path === '/profile') {
      return { title: 'My Profile', icon: User, category: 'Account' };
    }
    if (path === '/settings') {
      return { title: 'Settings & Privacy', icon: Settings, category: 'Preferences' };
    }
    return { title: 'Platform', icon: Sparkles, category: 'LifeMap' };
  };

  const pageInfo = getPageInfo();
  const PageIcon = pageInfo.icon;

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-brand-border h-16">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Side: Mobile Menu Toggle + Breadcrumb / Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-brand-navy hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center flex-shrink-0">
              <PageIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                {pageInfo.category}
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-brand-navy leading-tight truncate">
                {pageInfo.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Right Side: Compact Language Switcher + Top-Right Account Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-brand-border bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-brand-navy transition-colors"
              title="Change Language"
              aria-expanded={langDropdownOpen}
            >
              <Globe className="w-3.5 h-3.5 text-brand-teal" />
              <span className="hidden sm:inline">{languages.find(l => l.code === language)?.native || 'English'}</span>
              <span className="sm:hidden">{languages.find(l => l.code === language)?.short || 'EN'}</span>
              <ChevronDown className="w-3 h-3 text-brand-textSecondary" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white text-brand-textPrimary rounded-xl shadow-float border border-brand-border py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      language === l.code ? 'font-bold text-brand-teal bg-teal-50/50' : 'text-brand-navy'
                    }`}
                  >
                    <span>{l.native}</span>
                    {language === l.code && <Check className="w-3 h-3 text-brand-teal" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account Dropdown Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setLangDropdownOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-brand-border bg-white hover:bg-slate-50 text-brand-navy transition-all focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              aria-expanded={userDropdownOpen}
              aria-label="User account menu"
            >
              <div className="w-7 h-7 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-black shadow-inner">
                {initials}
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <span className="block text-xs font-bold text-brand-navy max-w-[120px] truncate leading-tight">
                  {displayName}
                </span>
                <span className="block text-[10px] text-brand-textSecondary max-w-[120px] truncate leading-tight">
                  {displayEmail}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-brand-textSecondary" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-brand-textPrimary rounded-2xl shadow-float border border-brand-border py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="px-3.5 py-2.5 border-b border-brand-border">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Signed in as</span>
                  <p className="text-xs font-bold text-brand-navy truncate mt-0.5">{displayName}</p>
                  <p className="text-[11px] text-brand-textSecondary truncate">{displayEmail}</p>
                </div>

                {/* Account Navigation Links */}
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 flex items-center gap-2.5 text-brand-navy transition-colors"
                  >
                    <User className="w-4 h-4 text-brand-teal" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 flex items-center gap-2.5 text-brand-navy transition-colors"
                  >
                    <Settings className="w-4 h-4 text-brand-teal" />
                    <span>Settings & Privacy</span>
                  </Link>
                </div>

                {/* Sign Out CTA */}
                <div className="pt-1 border-t border-brand-border">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
