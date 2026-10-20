import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Globe, 
  Menu, 
  X, 
  Users, 
  Sparkles, 
  Check, 
  ChevronDown,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { Logo } from './Logo';
import { useTranslation } from '../i18n';
import { Language } from '../types';
import { DEMO_PROFILES } from '../data/demoProfiles';
import { StorageAdapter } from '../lib/storage';

interface HeaderProps {
  onProfileChange?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onProfileChange }) => {
  const { t, language, setLanguage } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const currentUser = StorageAdapter.getUserProfile();

  const navLinks = [
    { to: '/dashboard', label: t('navDashboard') },
    { to: '/goals', label: t('navGoals') },
    { to: '/assessment', label: t('navAssessment') },
    { to: '/calculator', label: t('navCalculator') },
    { to: '/coverage', label: t('navCoverage') },
    { to: '/simulator', label: t('navSimulator') },
    { to: '/games', label: t('navGames') },
    { to: '/compare', label: t('navCompare') },
    { to: '/chat', label: t('navChat'), badge: 'AI' },
  ];

  const handleSelectDemoProfile = (profileId: string) => {
    StorageAdapter.loadDemoProfile(profileId);
    setDemoDropdownOpen(false);
    if (onProfileChange) onProfileChange();
    window.location.reload();
  };

  const handleResetDemo = () => {
    StorageAdapter.resetAllToDefault();
    setDemoDropdownOpen(false);
    window.location.reload();
  };

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border shadow-subtle">
      {/* Top micro-bar for Demo Mode Notice & Quick Switcher */}
      <div className="bg-brand-navyDark text-white py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-brand-emerald animate-pulse" />
            <span className="font-medium text-slate-200">
              {currentUser.isDemoUser ? 'Interactive Hackathon Demo Mode' : 'Connected to LifeMap'}
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline text-slate-300">
              Active Profile: <strong className="text-brand-tealLight font-semibold">{currentUser.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* 1-Click Demo Profile Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-brand-navyLight hover:bg-brand-teal text-white text-[11px] font-medium transition-colors"
              >
                <Users className="w-3 h-3 text-brand-tealLight" />
                <span>Switch Demo Persona</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white text-brand-textPrimary rounded-xl shadow-float border border-brand-border py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-brand-border text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider">
                    Select Test Profile
                  </div>
                  {DEMO_PROFILES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectDemoProfile(p.id)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-brand-tealSoft flex flex-col transition-colors border-b border-slate-50 last:border-none"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-brand-navy">{p.name}</span>
                        {currentUser.id === p.id && (
                          <span className="text-[10px] bg-brand-emerald/15 text-brand-emerald font-bold px-1.5 py-0.2 rounded flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-brand-textSecondary mt-0.5">{p.tagline}</span>
                    </button>
                  ))}
                  <div className="pt-2 px-3 border-t border-brand-border mt-1">
                    <button
                      onClick={handleResetDemo}
                      className="w-full py-1 text-center text-[11px] text-brand-coral hover:text-red-700 flex items-center justify-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset to Default State
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                title="Change Language"
              >
                <Globe className="w-3 h-3 text-brand-tealLight" />
                <span>{languages.find(l => l.code === language)?.native || 'English'}</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white text-brand-textPrimary rounded-lg shadow-float border border-brand-border py-1 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-brand-tealSoft transition-colors ${
                        language === l.code ? 'font-bold text-brand-teal bg-brand-tealSoft/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{l.native}</span>
                      {language === l.code && <Check className="w-3 h-3 text-brand-teal" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center">
            <Logo variant="full" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-brand-navy bg-brand-teal/15 font-bold shadow-subtle'
                      : 'text-brand-textSecondary hover:text-brand-navy hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.label}
                    {link.badge && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-gradient-to-r from-brand-teal to-brand-emerald text-white uppercase tracking-wider">
                        {link.badge}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right CTA & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              to="/assessment"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-navy to-brand-teal hover:from-brand-navyLight hover:to-brand-tealDark shadow-subtle transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
              <span>{t('startLifeMap')}</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-brand-textSecondary hover:text-brand-navy hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-border bg-white px-4 pt-3 pb-6 shadow-float">
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-brand-textSecondary hover:bg-slate-100"
            >
              {t('navHome')}
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-between ${
                  location.pathname === link.to
                    ? 'text-brand-navy bg-brand-teal/15 font-bold'
                    : 'text-brand-textSecondary hover:bg-slate-100'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-teal text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-brand-border flex flex-col gap-2">
            <Link
              to="/assessment"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-navy to-brand-teal"
            >
              {t('startLifeMap')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
