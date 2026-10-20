import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Info, ExternalLink } from 'lucide-react';
import { Logo } from './Logo';
import { useTranslation } from '../i18n';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-brand-navyDark text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Info */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <Logo variant="full" light={true} />
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              An AI-assisted, gamified life insurance discovery and financial protection platform by Team AspireX.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-brand-tealLight mt-1 font-medium">
              <ShieldCheck className="w-4 h-4 text-brand-emerald" />
              <span>Zero-Pressure Educational Experience</span>
            </div>
          </div>

          {/* Quick Links: Planning Journey */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              The Protection Journey
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/goals" className="hover:text-brand-tealLight transition-colors">
                  {t('navGoals')}
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="hover:text-brand-tealLight transition-colors">
                  {t('navAssessment')}
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="hover:text-brand-tealLight transition-colors">
                  {t('navCalculator')}
                </Link>
              </li>
              <li>
                <Link to="/coverage" className="hover:text-brand-tealLight transition-colors">
                  {t('navCoverage')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Exploration & AI */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Tools & Intelligence
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/simulator" className="hover:text-brand-tealLight transition-colors">
                  {t('navSimulator')}
                </Link>
              </li>
              <li>
                <Link to="/games" className="hover:text-brand-tealLight transition-colors">
                  {t('navGames')}
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-brand-tealLight transition-colors">
                  {t('navCompare')}
                </Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-brand-tealLight transition-colors flex items-center gap-1">
                  <span>{t('navChat')}</span>
                  <span className="px-1.5 py-0.2 text-[9px] bg-brand-teal text-white rounded font-bold">Multilingual</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Principles & Privacy */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Trust & Transparency
            </h4>
            <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <p>• Pure deterministic math; AI never invents calculations.</p>
              <p>• No policy sales commissions or commercial bias.</p>
              <p>• Data minimization: no Aadhaar, PAN, or bank credentials asked.</p>
              <p>• Offline-ready demo persistence.</p>
            </div>
          </div>
        </div>

        {/* Required Financial Regulatory Disclaimer */}
        <div className="mt-8 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand-amber flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">Legal & Educational Disclaimer: </strong>
              {t('disclaimerText')} LifeMap does not sell insurance policies, solicit commercial insurance business, or represent any specific insurer. Final product suitability must be evaluated against authorized insurer prospectus documents and official IRDAI policy wordings.
            </div>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            © {new Date().getFullYear()} LifeMap. Built with <Heart className="w-3 h-3 inline text-red-500 mx-0.5 fill-red-500" /> by <strong className="text-slate-300">Team AspireX</strong> for AP Mega Hackathon.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>English • తెలుగు • हिंदी</span>
            <span>Deterministic Engine v2026.1-IN</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
