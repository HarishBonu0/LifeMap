import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Globe, 
  Menu, 
  X, 
  Users, 
  Check, 
  ChevronDown,
  RotateCcw,
  LogIn,
  LogOut,
  Brain,
  UserCheck
} from 'lucide-react';
import { Logo } from './Logo';
import { useTranslation } from '../i18n';
import { Language } from '../types';
import { DEMO_PROFILES } from '../data/demoProfiles';
import { StorageAdapter } from '../lib/storage';
import { calculateInsuranceNeeds } from '../lib/calculator';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  onProfileChange?: () => void;
  onMenuToggle?: () => void;
  showSidebarToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onProfileChange, onMenuToggle, showSidebarToggle }) => {
  const { t, language, setLanguage } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const currentUser = profile || StorageAdapter.getUserProfile();

  const navLinks = [
    { 
      to: '/dashboard', 
      label: t('navDashboard') || 'Dashboard',
      isActive: location.pathname === '/dashboard'
    },
    { 
      to: '/assessment', 
      label: t('navPlan') || 'Plan',
      isActive: location.pathname === '/assessment' || location.pathname === '/calculator'
    },
    { 
      to: '/coverage', 
      label: t('navCoverage') || 'Coverage',
      isActive: location.pathname === '/coverage'
    },
    { 
      to: '/games', 
      label: t('navLearn') || 'Learn',
      isActive: location.pathname === '/games'
    },
  ];

  const handleSelectDemoProfile = (profileId: string) => {
    const pkg = StorageAdapter.loadDemoProfile(profileId);
    if (pkg) {
      sessionStorage.setItem('lifemap_assessment', JSON.stringify(pkg.inputs));
      sessionStorage.setItem('lifemap_result', JSON.stringify(calculateInsuranceNeeds(pkg.inputs)));
    }
    setDemoDropdownOpen(false);
    if (onProfileChange) onProfileChange();
    window.location.reload();
  };

  const handleResetDemo = () => {
    StorageAdapter.resetAllToDefault();
    sessionStorage.removeItem('lifemap_assessment');
    sessionStorage.removeItem('lifemap_result');
    setDemoDropdownOpen(false);
    window.location.reload();
  };

  const languages: { code: Language; label: string; native: string; short: string }[] = [
    { code: 'en', label: 'English', native: 'English', short: 'EN' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు', short: 'తె' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी', short: 'हि' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo on the left */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-brand-teal/50 rounded-lg">
              <Logo variant="compact" />
            </Link>

            {/* Main 4 Navigation Destinations */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    link.isActive
                      ? 'text-brand-navy bg-slate-100 font-bold'
                      : 'text-brand-textSecondary hover:text-brand-navy hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Controls: Auth, Demo Switcher, Language Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Authenticated User Menu */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setDemoDropdownOpen(false);
                    setLangDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-brand-teal/40 bg-teal-50/50 hover:bg-teal-50 text-brand-navy text-xs font-medium transition-colors"
                  aria-expanded={userDropdownOpen}
                >
                  <UserCheck className="w-3.5 h-3.5 text-brand-teal" />
                  <span className="max-w-[100px] truncate font-semibold">{currentUser.name || user.email.split('@')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-brand-textSecondary" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-white text-brand-textPrimary rounded-xl shadow-float border border-brand-border py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-brand-border text-xs text-brand-textSecondary">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Signed in as</span>
                      <span className="font-semibold text-brand-navy truncate block">{user.email}</span>
                    </div>

                    <Link
                      to="/mindset"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-brand-navy transition-colors"
                    >
                      <Brain className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Financial Mindset</span>
                    </Link>

                    <div className="pt-1 border-t border-brand-border mt-1">
                      <button
                        onClick={() => {
                          signOut();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-brand-coral hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated: Show Sign In Button & Demo Switcher */
              <>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-navy text-white text-xs font-semibold hover:bg-brand-navyLight shadow-subtle transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                {/* Demo Switcher */}
                <div className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() => {
                      setDemoDropdownOpen(!demoDropdownOpen);
                      setLangDropdownOpen(false);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-brand-border bg-slate-50 hover:bg-slate-100 text-brand-navy text-xs font-medium transition-colors"
                    title="Switch Demo Persona"
                    aria-expanded={demoDropdownOpen}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                    <span className="max-w-[90px] truncate">{currentUser.name}</span>
                    <span className="text-[10px] text-brand-textSecondary">(Demo)</span>
                    <ChevronDown className="w-3 h-3 text-brand-textSecondary" />
                  </button>

                  {demoDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-64 bg-white text-brand-textPrimary rounded-xl shadow-float border border-brand-border py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1 text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider">
                        Demo Personas
                      </div>
                      {DEMO_PROFILES.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectDemoProfile(p.id)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex flex-col transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-brand-navy">{p.name}</span>
                            {currentUser.id === p.id && (
                              <Check className="w-3.5 h-3.5 text-brand-teal" />
                            )}
                          </div>
                          <span className="text-[11px] text-brand-textSecondary truncate">{p.tagline}</span>
                        </button>
                      ))}
                      <div className="pt-1.5 px-3 border-t border-brand-border mt-1">
                        <button
                          onClick={handleResetDemo}
                          className="w-full py-1 text-center text-[11px] text-brand-coral hover:text-red-700 flex items-center justify-center gap-1 font-medium"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset to Default
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setDemoDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-slate-50 text-xs font-medium text-brand-navy transition-colors"
                title="Change Language"
                aria-expanded={langDropdownOpen}
              >
                <Globe className="w-3.5 h-3.5 text-brand-teal" />
                <span className="hidden sm:inline">{languages.find(l => l.code === language)?.native || 'English'}</span>
                <span className="sm:hidden">{languages.find(l => l.code === language)?.short || 'EN'}</span>
                <ChevronDown className="w-3 h-3 text-brand-textSecondary" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white text-brand-textPrimary rounded-xl shadow-float border border-brand-border py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
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

            {/* Mobile Menu / Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => {
                if (showSidebarToggle && onMenuToggle) {
                  onMenuToggle();
                } else {
                  setMobileMenuOpen(!mobileMenuOpen);
                }
              }}
              className="lg:hidden p-2 rounded-lg text-brand-textSecondary hover:text-brand-navy hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-border bg-white px-4 py-3 shadow-card animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  link.isActive
                    ? 'text-brand-navy bg-slate-100 font-bold'
                    : 'text-brand-textSecondary hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/mindset"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-brand-teal hover:bg-teal-50 flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              <span>Financial Mindset</span>
            </Link>

            {!user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-brand-navy hover:bg-slate-50 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </nav>
        </div>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
};
