import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, X, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { Logo } from './Logo';
import { useTranslation } from '../i18n';
import { Language } from '../types';

export const PublicHeader: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages: { code: Language; label: string; native: string; short: string }[] = [
    { code: 'en', label: 'English', native: 'English', short: 'EN' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు', short: 'తె' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी', short: 'हि' },
  ];

  const navLinks = [
    { to: '/#how-it-works', label: t('howItWorks') || 'How It Works' },
    { to: '/plans', label: t('insurancePlans') || 'Insurance Plans' },
    { to: '/#about', label: t('about') || 'About' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-brand-teal/50 rounded-lg">
              <Logo variant="compact" />
            </Link>

            {/* Public Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Public Navigation">
              {navLinks.map((link) => (
                <a
                  key={link.to}
                  href={link.to}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-brand-textSecondary hover:text-brand-navy hover:bg-slate-50 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Right Public Controls: Language, Sign In, Get Started */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-slate-50 text-xs font-medium text-brand-navy transition-colors cursor-pointer"
                title="Change Language"
                aria-expanded={langDropdownOpen}
              >
                <Globe className="w-3.5 h-3.5 text-brand-teal" />
                <span className="hidden sm:inline">{languages.find(l => l.code === language)?.native || 'English'}</span>
                <span className="sm:hidden">{languages.find(l => l.code === language)?.short || 'EN'}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-float border border-brand-border py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
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

            {/* Sign In Button */}
            <Link
              to="/signin"
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg border border-brand-border text-xs font-semibold text-brand-navy hover:bg-slate-50 transition-colors"
            >
              {t('login') || 'Sign In'}
            </Link>

            {/* Get Started Primary Button */}
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-subtle transition-all"
            >
              <span>{t('getStarted') || 'Get Started'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-brand-textSecondary hover:text-brand-navy hover:bg-slate-100 transition-colors"
              aria-label="Toggle Public Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-border bg-white px-4 py-3 shadow-card space-y-2 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.to}
                href={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-brand-textSecondary hover:bg-slate-50 hover:text-brand-navy"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-brand-border flex flex-col gap-2">
            <Link
              to="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-xl text-xs font-semibold text-brand-navy border border-brand-border hover:bg-slate-50"
            >
              {t('login') || 'Sign In'}
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight"
            >
              {t('getStarted') || 'Get Started'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
