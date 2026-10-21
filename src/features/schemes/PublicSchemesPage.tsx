import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  Filter, 
  ExternalLink, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Bookmark, 
  LogIn, 
  FileText,
  Lock
} from 'lucide-react';
import { VERIFIED_INSURANCE_SCHEMES, SCHEME_CATEGORIES } from '../../data/schemesData';
import { InsuranceScheme } from '../../types';
import { useTranslation } from '../../i18n';

export const PublicSchemesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDetailScheme, setActiveDetailScheme] = useState<InsuranceScheme | null>(null);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginPromptReason, setLoginPromptReason] = useState('save this scheme to your personal protection plan');

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

  const handleRequiresAuth = (actionName: string) => {
    setLoginPromptReason(actionName);
    setLoginPromptOpen(true);
  };

  const getCategoryLabel = (catId: string, fallback: string) => {
    if (catId === 'all') return t('allCategories');
    if (catId === 'term') return t('pureTermCategory');
    if (catId === 'endowment') return t('endowmentCategory');
    if (catId === 'whole_life') return t('wholeLifeCategory');
    if (catId === 'ulip') return t('ulipCategory');
    return fallback;
  };

  return (
    <div className="space-y-8 py-4 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-brand-teal text-[10px] font-bold uppercase tracking-wider mb-1">
            <Shield className="w-3 h-3" /> {t('irdaiCompliantCatalog')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            {t('schemesCatalogTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-brand-textSecondary mt-0.5">
            {t('schemesCatalogSub')}
          </p>
        </div>

        <Link
          to="/signup"
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle transition-all"
        >
          <span>{t('getStarted')}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Educational Notice: Distinguishing Protection from Investment */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 shadow-subtle">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950">
            {t('consumerProtectionNotice')}
          </p>
          <p className="leading-relaxed text-[11px] text-amber-900">
            {t('consumerProtectionNoticeDesc')}
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-brand-navy text-white shadow-subtle'
                : 'bg-white text-brand-textSecondary border border-brand-border hover:bg-slate-50'
            }`}
          >
            {t('allCategories')} ({VERIFIED_INSURANCE_SCHEMES.length})
          </button>
          {SCHEME_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-brand-navy text-white shadow-subtle'
                  : 'bg-white text-brand-textSecondary border border-brand-border hover:bg-slate-50'
              }`}
            >
              {getCategoryLabel(cat.id, cat.label)}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('searchSchemesPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-white text-xs text-brand-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
          />
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className="rounded-2xl border-2 border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50/70 p-5 shadow-subtle hover:border-teal-400 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-4 overflow-hidden relative"
          >
            {/* Category Top Bar Accent */}
            <div className={`h-1.5 w-full absolute top-0 left-0 ${
              scheme.category === 'term' ? 'bg-gradient-to-r from-teal-400 to-emerald-500' :
              scheme.category === 'ulip' ? 'bg-gradient-to-r from-purple-400 to-pink-500' :
              scheme.category === 'whole_life' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
              'bg-gradient-to-r from-amber-400 to-orange-500'
            }`} />

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  scheme.category === 'term' 
                    ? 'bg-teal-100 text-teal-800 border border-teal-300' 
                    : scheme.category === 'ulip'
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : scheme.category === 'whole_life'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {scheme.categoryLabel}
                </span>

                <button
                  onClick={() => handleRequiresAuth('save this scheme to your personal plan')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Sign in to save scheme"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>

              <div>
                <span className="text-[10px] uppercase font-extrabold text-teal-700 block tracking-wider">
                  {scheme.insurer}
                </span>
                <h3 className="text-sm font-bold text-brand-navy mt-0.5 line-clamp-1">
                  {scheme.name}
                </h3>
              </div>

              <p className="text-xs text-brand-textSecondary line-clamp-2 leading-relaxed">
                {scheme.policyPurpose}
              </p>

              <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/20 border border-slate-200/90 space-y-1.5 text-xs">
                <div className="flex justify-between text-brand-navy">
                  <span className="text-slate-500 font-medium">{t('indicativeCost')}:</span>
                  <span className="font-extrabold text-teal-700">{scheme.indicativeAnnualCost}</span>
                </div>
                <div className="flex justify-between text-brand-navy">
                  <span className="text-slate-500 font-medium">{t('sumAssured')}:</span>
                  <span className="font-bold">{scheme.sumAssuredText}</span>
                </div>
                <div className="flex justify-between text-brand-navy">
                  <span className="text-slate-500 font-medium">{t('entryAge')}:</span>
                  <span className="font-bold">{scheme.entryAgeMin} - {scheme.entryAgeMax} yrs</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setActiveDetailScheme(scheme)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-navy border border-brand-border hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-brand-teal" />
                <span>{t('viewDetails')}</span>
              </button>

              <button
                onClick={() => handleRequiresAuth('compare schemes side-by-side')}
                className="inline-flex items-center justify-center p-2 rounded-xl text-xs font-semibold text-slate-500 border border-brand-border hover:bg-slate-50 transition-colors"
                title={t('compare')}
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Scheme Detail Modal */}
      {activeDetailScheme && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-teal">
                  {activeDetailScheme.insurer}
                </span>
                <h3 className="text-lg font-bold text-brand-navy">{activeDetailScheme.name}</h3>
              </div>
              <button
                onClick={() => setActiveDetailScheme(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-brand-navy leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-400 uppercase text-[10px]">{t('policyPurpose')}</h4>
                <p className="text-brand-textSecondary mt-0.5">{activeDetailScheme.policyPurpose}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 uppercase text-[10px]">{t('keyBenefits')}</h4>
                <ul className="list-disc pl-5 space-y-1 text-brand-textSecondary mt-1">
                  {activeDetailScheme.keyBenefits.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 uppercase text-[10px]">{t('majorExclusions')}</h4>
                <ul className="list-disc pl-5 space-y-1 text-brand-textSecondary mt-1">
                  {activeDetailScheme.majorExclusions.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold block text-slate-700">{t('officialSite')}</span>
                <a
                  href={activeDetailScheme.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-teal hover:underline inline-flex items-center gap-1 mt-1 font-semibold"
                >
                  <span>{activeDetailScheme.officialUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-brand-border flex justify-end gap-2">
              <button
                onClick={() => setActiveDetailScheme(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-textSecondary hover:bg-slate-100"
              >
                {t('close')}
              </button>
              <button
                onClick={() => {
                  setActiveDetailScheme(null);
                  handleRequiresAuth('save this scheme to your personal plan');
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{t('savePlan')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Required Modal */}
      {loginPromptOpen && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-brand-teal flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-brand-navy">{t('login')}</h3>
              <p className="text-xs text-brand-textSecondary leading-relaxed">
                {loginPromptReason}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                to="/signin"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('login')}</span>
              </Link>
              <Link
                to="/signup"
                className="w-full inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-brand-navy border border-brand-border hover:bg-slate-50 transition-colors"
              >
                <span>{t('register')}</span>
              </Link>
            </div>

            <button
              onClick={() => setLoginPromptOpen(false)}
              className="text-[11px] text-slate-400 hover:text-brand-navy transition-colors pt-1"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
