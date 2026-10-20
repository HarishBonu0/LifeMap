import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'teal' | 'navy' | 'emerald' | 'coral' | 'amber' | 'blue';
  badge?: {
    text: string;
    type?: 'warning' | 'success' | 'info' | 'neutral';
  };
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'teal',
  badge,
  onClick,
  className = '',
}) => {
  const variantStyles = {
    teal: {
      border: 'border-brand-teal/20',
      iconBg: 'bg-brand-tealSoft text-brand-teal',
      accent: 'text-brand-teal',
    },
    navy: {
      border: 'border-brand-navy/20',
      iconBg: 'bg-slate-100 text-brand-navy',
      accent: 'text-brand-navy',
    },
    emerald: {
      border: 'border-brand-emerald/20',
      iconBg: 'bg-emerald-50 text-brand-emerald',
      accent: 'text-brand-emerald',
    },
    coral: {
      border: 'border-brand-coral/20',
      iconBg: 'bg-orange-50 text-brand-coral',
      accent: 'text-brand-coral',
    },
    amber: {
      border: 'border-brand-amber/20',
      iconBg: 'bg-amber-50 text-brand-amber',
      accent: 'text-brand-amber',
    },
    blue: {
      border: 'border-brand-blue/20',
      iconBg: 'bg-blue-50 text-brand-blue',
      accent: 'text-brand-blue',
    },
  }[variant];

  const badgeStyles = {
    warning: 'bg-orange-100 text-brand-coral border-orange-200',
    success: 'bg-emerald-100 text-brand-emerald border-emerald-200',
    info: 'bg-blue-100 text-brand-blue border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  }[badge?.type || 'neutral'];

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-2xl p-5 border shadow-subtle hover:shadow-card transition-all duration-200 ${
        variantStyles.border
      } ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold text-brand-textSecondary tracking-wide uppercase">
            {title}
          </p>
          <h3 className="text-2xl font-black text-brand-navy tracking-tight mt-1">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-brand-textSecondary mt-1 leading-snug">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${variantStyles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {badge && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeStyles}`}>
            {badge.text}
          </span>
        </div>
      )}
    </div>
  );
};
