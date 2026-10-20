import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'iconOnly';
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  variant = 'full', 
  light = false 
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Abstract Protective Emblem SVG: Shield + Life Path + Human Spark Motif */}
      <div className="relative flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-navy to-brand-teal shadow-subtle p-1.5 border border-brand-teal/20">
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Outer Protective Shield Path */}
          <path 
            d="M16 3L6 7.5V15C6 21.5 10.3 27.5 16 29C21.7 27.5 26 21.5 26 15V7.5L16 3Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="opacity-90"
          />
          {/* Inner Life Planning Path / Directional Curve */}
          <path 
            d="M11 20C12.5 16.5 14.5 14 16 11C17.5 14 19.5 16.5 21 20" 
            stroke="#2DD4BF" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Future Aspiration Sparkle / Amber Accent */}
          <circle cx="16" cy="8.5" r="2" fill="#F59E0B" />
        </svg>
      </div>

      {variant !== 'iconOnly' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-brand-navy'}`}>
              Life<span className="text-brand-teal">Map</span>
            </span>
          </div>
          {variant === 'full' && (
            <span className={`text-[9px] font-bold tracking-widest uppercase ${light ? 'text-brand-tealLight/90' : 'text-brand-textSecondary'}`}>
              BY TEAM ASPIREX
            </span>
          )}
        </div>
      )}
    </div>
  );
};
