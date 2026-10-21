import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  ExternalLink, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  FileText,
  Bookmark
} from 'lucide-react';
import { VERIFIED_INSURANCE_SCHEMES, SCHEME_CATEGORIES } from '../../data/schemesData';
import { InsuranceScheme, SchemeCategory } from '../../types';

export const SchemesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [activeDetailScheme, setActiveDetailScheme] = useState<InsuranceScheme | null>(null);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('lifemap_saved_schemes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleSaveScheme = (schemeId: string) => {
    setSavedSchemeIds(prev => {
      const next = prev.includes(schemeId) ? prev.filter(id => id !== schemeId) : [...prev, schemeId];
      try {
        localStorage.setItem('lifemap_saved_schemes', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return VERIFIED_INSURANCE_SCHEMES.filter((scheme) => {
      const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        scheme.name.toLowerCase().includes(q) ||
        scheme.insurer.toLowerCase().includes(q) ||
        scheme.policyPurpose.toLowerCase().includes(q) ||
        scheme.keyBenefits.some(b => b.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleComparison = (schemeId: string) => {
    if (selectedForComparison.includes(schemeId)) {
      setSelectedForComparison(prev => prev.filter(id => id !== schemeId));
    } else {
      if (selectedForComparison.length >= 3) {
        alert('You can compare a maximum of 3 schemes side-by-side.');
        return;
      }
      setSelectedForComparison(prev => [...prev, schemeId]);
    }
  };

  const comparedSchemes = useMemo(() => {
    return VERIFIED_INSURANCE_SCHEMES.filter(s => selectedForComparison.includes(s.id));
  }, [selectedForComparison]);

  return (
    <div className="space-y-8 py-4 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-brand-teal text-[10px] font-bold uppercase tracking-wider mb-1">
            <Shield className="w-3 h-3" /> IRDAI-Compliant Catalog
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            Life Insurance Schemes & Plans
          </h1>
          <p className="text-xs sm:text-sm text-brand-textSecondary mt-0.5">
            Browse, inspect, and objectively compare official Indian life insurance products.
          </p>
        </div>

        {/* Comparison Trigger Button */}
        {selectedForComparison.length > 0 && (
          <button
            onClick={() => setComparisonModalOpen(true)}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-teal hover:bg-brand-tealDark shadow-subtle transition-all animate-in fade-in"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Compare Selected ({selectedForComparison.length}/3)</span>
          </button>
        )}
      </div>

      {/* Critical Educational Notice: Distinguishing Protection from Investment */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 shadow-subtle">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950">
            Important Consumer Protection Notice: Insurance ≠ Investment
          </p>
          <p className="leading-relaxed text-[11px] text-amber-900">
            Life insurance is designed to replace lost income and shield dependants from loans upon premature demise. 
            <strong> Pure Term plans</strong> offer the highest cover at the lowest premium. Traditional savings/endowment plans and ULIPs blend small covers with conservative returns or market risk. Never assume insurance returns and investment equity are equivalent.
          </p>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {SCHEME_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-brand-navy text-white border-brand-navy shadow-subtle'
                  : 'bg-white text-brand-textSecondary border-brand-border hover:bg-slate-50 hover:text-brand-navy'
              }`}
            >
              <span>{cat.label}</span>
              {'badge' in cat && (cat as any).badge && (
                <span className={`ml-2 text-[10px] px-1.5 py-0.2 rounded font-normal ${
                  selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-brand-teal'
                }`}>
                  {(cat as any).badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-brand-textSecondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by insurer, plan name, or feature (e.g. LIC, HDFC, Critical Illness, Whole Life)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal shadow-subtle"
          />
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchemes.map((scheme) => {
          const isSelected = selectedForComparison.includes(scheme.id);

          return (
            <div
              key={scheme.id}
              className={`rounded-2xl p-5 flex flex-col justify-between transition-all overflow-hidden relative ${
                isSelected
                  ? 'border-2 border-brand-teal ring-4 ring-brand-teal/20 shadow-lg bg-gradient-to-br from-white via-teal-50/20 to-white'
                  : 'border-2 border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50/70 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-0.5'
              }`}
            >
              {/* Category Top Bar Accent */}
              <div className={`h-1.5 w-full absolute top-0 left-0 ${
                scheme.category === 'term' ? 'bg-gradient-to-r from-teal-400 to-emerald-500' :
                scheme.category === 'ulip' ? 'bg-gradient-to-r from-purple-400 to-pink-500' :
                scheme.category === 'whole_life' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                'bg-gradient-to-r from-amber-400 to-orange-500'
              }`} />

              <div className="space-y-3 pt-1">
                {/* Header Badge & Compare Checkbox */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    scheme.category === 'term' ? 'bg-teal-100 text-teal-800 border border-teal-300' :
                    scheme.category === 'ulip' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                    scheme.category === 'whole_life' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                    'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {scheme.categoryLabel}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSaveScheme(scheme.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        savedSchemeIds.includes(scheme.id)
                          ? 'text-brand-teal bg-teal-50'
                          : 'text-slate-400 hover:text-brand-navy hover:bg-slate-100'
                      }`}
                      title={savedSchemeIds.includes(scheme.id) ? 'Saved to My Plan' : 'Save to My Plan'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${savedSchemeIds.includes(scheme.id) ? 'fill-brand-teal' : ''}`} />
                    </button>

                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-textSecondary cursor-pointer hover:text-brand-navy select-none">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleComparison(scheme.id)}
                        className="w-3.5 h-3.5 accent-brand-teal rounded cursor-pointer"
                      />
                      <span>Compare</span>
                    </label>
                  </div>
                </div>

                {/* Scheme & Insurer Name */}
                <div>
                  <h3 className="text-sm font-bold text-brand-navy leading-snug">
                    {scheme.name}
                  </h3>
                  <p className="text-[11px] text-brand-textSecondary mt-0.5 font-medium">
                    {scheme.insurer}
                  </p>
                </div>

                {/* Purpose Snippet */}
                <p className="text-xs text-brand-textSecondary leading-relaxed line-clamp-2">
                  {scheme.policyPurpose}
                </p>

                {/* Core Parameters Table */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/20 border border-slate-200/90 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-brand-textSecondary">Entry Age:</span>
                    <span className="font-bold text-brand-navy">{scheme.entryAgeMin} to {scheme.entryAgeMax} yrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-textSecondary">Sum Assured:</span>
                    <span className="font-bold text-brand-navy truncate max-w-[150px]">{scheme.sumAssuredText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-textSecondary">Policy Term:</span>
                    <span className="font-bold text-brand-navy">{scheme.policyTerm}</span>
                  </div>
                </div>

                {/* Key Benefits Preview */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brand-navy uppercase tracking-wider">Top Benefits:</span>
                  <ul className="text-[11px] text-brand-textSecondary space-y-1">
                    {scheme.keyBenefits.slice(0, 2).map((benefit, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-200/80 mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveDetailScheme(scheme)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-brand-navy bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  View Details
                </button>
                <a
                  href={scheme.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-teal hover:text-brand-tealDark transition-colors"
                >
                  <span>Visit Insurer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-brand-border space-y-2">
          <p className="text-sm font-bold text-brand-navy">No matching insurance schemes found</p>
          <p className="text-xs text-brand-textSecondary">Try clearing your search query or switching categories.</p>
        </div>
      )}

      {/* Scheme Detail Modal */}
      {activeDetailScheme && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-brand-border shadow-float max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-brand-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                  {activeDetailScheme.categoryLabel}
                </span>
                <h2 className="text-xl font-bold text-brand-navy mt-0.5">
                  {activeDetailScheme.name}
                </h2>
                <p className="text-xs text-brand-textSecondary">
                  {activeDetailScheme.insurer}
                </p>
              </div>
              <button
                onClick={() => setActiveDetailScheme(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Purpose */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-brand-navy leading-relaxed">
              <strong>Policy Purpose: </strong> {activeDetailScheme.policyPurpose}
            </div>

            {/* Eligibility & Cost Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-brand-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-brand-textSecondary">Eligibility & Ages</span>
                <p className="font-semibold text-brand-navy">Entry: {activeDetailScheme.entryAgeMin}–{activeDetailScheme.entryAgeMax} years</p>
                <p className="text-[11px] text-brand-textSecondary">Max Maturity: {activeDetailScheme.maxMaturityAge} years</p>
              </div>
              <div className="p-3 rounded-xl border border-brand-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-brand-textSecondary">Premium Terms</span>
                <p className="font-semibold text-brand-navy">{activeDetailScheme.premiumPaymentTerms}</p>
                <p className="text-[11px] text-brand-textSecondary">{activeDetailScheme.indicativeAnnualCost}</p>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                Key Benefits & Features
              </h3>
              <ul className="text-xs text-brand-navy space-y-1.5">
                {activeDetailScheme.keyBenefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Major Exclusions */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider">
                Major Exclusions & Waiting Periods
              </h3>
              <ul className="text-xs text-brand-textSecondary space-y-1.5">
                {activeDetailScheme.majorExclusions.map((e, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1.5" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Important Conditions */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                Important Conditions to Note
              </h3>
              <ul className="text-xs text-brand-textSecondary space-y-1">
                {activeDetailScheme.importantConditions.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>

            {/* Specific Notice */}
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-brand-navy leading-relaxed">
              <strong>LifeMap Guidance: </strong> {activeDetailScheme.investmentVsInsuranceNotice}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-brand-border">
              <button
                onClick={() => setActiveDetailScheme(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-navy bg-slate-100 hover:bg-slate-200"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSaveScheme(activeDetailScheme.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    savedSchemeIds.includes(activeDetailScheme.id)
                      ? 'border-brand-teal text-brand-teal bg-teal-50 font-bold'
                      : 'border-brand-border text-brand-navy hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${savedSchemeIds.includes(activeDetailScheme.id) ? 'fill-brand-teal' : ''}`} />
                  <span>{savedSchemeIds.includes(activeDetailScheme.id) ? 'Saved in My Plan' : 'Save to My Plan'}</span>
                </button>
                <a
                  href={activeDetailScheme.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle"
                >
                  <span>Visit Insurer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      {comparisonModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-brand-border shadow-float max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-brand-navy">
                  Side-by-Side Scheme Comparison
                </h2>
                <p className="text-xs text-brand-textSecondary">
                  Comparing {comparedSchemes.length} selected official products
                </p>
              </div>
              <button
                onClick={() => setComparisonModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-brand-border">
              {comparedSchemes.map((scheme) => (
                <div key={scheme.id} className="pt-4 md:pt-0 md:px-4 space-y-4 text-xs first:pl-0 last:pr-0">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                      {scheme.categoryLabel}
                    </span>
                    <h3 className="font-bold text-brand-navy text-sm mt-0.5">{scheme.name}</h3>
                    <p className="text-[11px] text-brand-textSecondary">{scheme.insurer}</p>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-brand-textSecondary text-[10px] uppercase font-bold block">Sum Assured</span>
                      <span className="font-bold text-brand-navy">{scheme.sumAssuredText}</span>
                    </div>
                    <div>
                      <span className="text-brand-textSecondary text-[10px] uppercase font-bold block">Entry Age</span>
                      <span className="font-semibold text-brand-navy">{scheme.entryAgeMin} to {scheme.entryAgeMax} yrs</span>
                    </div>
                    <div>
                      <span className="text-brand-textSecondary text-[10px] uppercase font-bold block">Indicative Cost</span>
                      <span className="font-semibold text-brand-teal">{scheme.indicativeAnnualCost}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-navy block mb-1">Key Strengths</span>
                    <ul className="space-y-1 text-brand-textSecondary text-[11px]">
                      {scheme.keyBenefits.slice(0, 3).map((b, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <CheckCircle2 className="w-3 h-3 text-brand-teal flex-shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-red-600 block mb-1">Key Limitation</span>
                    <p className="text-[11px] text-brand-textSecondary">
                      {scheme.majorExclusions[0]}
                    </p>
                  </div>

                  <div className="pt-2">
                    <a
                      href={scheme.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-navy hover:bg-brand-navyLight transition-colors"
                    >
                      <span>Visit Insurer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-brand-border">
              <button
                onClick={() => setComparisonModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-brand-navy bg-slate-100 hover:bg-slate-200"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
