import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { useTranslation } from '../i18n';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-brand-border py-8 text-brand-textSecondary text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo variant="compact" />
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-brand-textSecondary">
              Independent life protection analysis & financial education.
            </span>
          </div>

          {/* 4 Main Destinations */}
          <nav className="flex items-center gap-4 text-xs font-semibold text-brand-navy" aria-label="Footer Navigation">
            <Link to="/dashboard" className="hover:text-brand-teal transition-colors">
              {t('navDashboard') || 'Dashboard'}
            </Link>
            <Link to="/assessment" className="hover:text-brand-teal transition-colors">
              {t('navPlan') || 'Plan'}
            </Link>
            <Link to="/coverage" className="hover:text-brand-teal transition-colors">
              {t('navCoverage') || 'Coverage'}
            </Link>
            <Link to="/games" className="hover:text-brand-teal transition-colors">
              {t('navLearn') || 'Learn'}
            </Link>
          </nav>
        </div>

        {/* Regulatory & Educational Disclaimer */}
        <div className="pt-4 border-t border-brand-border text-[11px] text-brand-textSecondary leading-relaxed">
          <p>
            <strong>Disclaimer:</strong> LifeMap is an educational planning platform. All calculations are deterministic estimates for informational guidance only and do not constitute insurance solicitation, financial advice, or an insurer's underwriting commitment.
          </p>
        </div>

        {/* Bottom Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>© {new Date().getFullYear()} LifeMap • Team AspireX</span>
          <span>English • తెలుగు • हिंदी</span>
        </div>
      </div>
    </footer>
  );
};
