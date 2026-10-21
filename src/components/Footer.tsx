import React from 'react';
import { useTranslation } from '../i18n';
import { ShieldAlert } from 'lucide-react';

/**
 * Global Footer removed per explicit specification.
 * Renders null so no repeated footer appears across any page or layout.
 */
export const Footer: React.FC = () => {
  return null;
};

/**
 * Contextual educational and regulatory disclaimer to be embedded only
 * at the bottom of calculation and planning results.
 */
export const ContextualDisclaimer: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useTranslation();

  return (
    <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-3 leading-relaxed ${className}`}>
      <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
      <div>
        <strong className="text-slate-700 block mb-0.5">{t('disclaimerHeading') || 'Educational Guidance Disclosure'}:</strong>
        <p>
          {t('disclaimerText') || 'LifeMap provides educational information and deterministic planning estimates based on the numbers and assumptions entered. All outputs are for informational guidance and do not constitute insurance solicitation, financial advice, or an insurer\'s underwriting commitment.'}
        </p>
      </div>
    </div>
  );
};
