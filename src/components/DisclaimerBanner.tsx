import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../i18n';

interface DisclaimerBannerProps {
  className?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ className = '' }) => {
  const { t } = useTranslation();

  return (
    <div className={`p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs leading-relaxed flex items-start gap-3 shadow-subtle ${className}`}>
      <AlertCircle className="w-4 h-4 text-brand-amber flex-shrink-0 mt-0.5" />
      <div>
        <strong className="font-bold">Educational Disclaimer: </strong>
        {t('disclaimerText')}
      </div>
    </div>
  );
};
