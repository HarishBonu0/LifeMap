import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Sliders, 
  HelpCircle, 
  Globe, 
  Gamepad2, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  TrendingUp,
  HeartHandshake,
  Compass,
  Layers,
  Calculator,
  EyeOff,
  Flame
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { CONFIGURABLE_GAMES } from '../../data/gamesData';
import { formatIndianCurrency } from '../../lib/calculator';

export const LandingPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Mini interactive simulator state on landing page for instant WOW factor!
  const [demoExpense, setDemoExpense] = useState(60000);
  const [demoYears, setDemoYears] = useState(20);
  const [hasHomeLoan, setHasHomeLoan] = useState(true);
  const demoHomeLoanAmount = hasHomeLoan ? 4000000 : 0;
  // Estimated need: ~ (expense * 12 * years * 0.9) + loan
  const demoEstimatedNeed = Math.round((demoExpense * 12 * demoYears * 0.88) + demoHomeLoanAmount);

  const faqs = [
    {
      q: 'Why should I calculate life protection needs before looking at policies?',
      a: 'Traditional insurance agents often push products that maximize their commission—like low-cover endowment or ULIP plans. LifeMap calculates your family\'s actual requirements (living costs, loans, milestones) first, ensuring you buy the right coverage amount without being sold an expensive savings trap.'
    },
    {
      q: 'Does LifeMap sell insurance or take broker commissions?',
      a: 'No. LifeMap is a strictly independent, educational, and analytical decision platform. We do not sell insurance, accept broker commissions, or favor any insurance company. All calculations are 100% deterministic and open.'
    },
    {
      q: 'Why is employer-provided group insurance not enough on its own?',
      a: 'Corporate group life coverage ceases the day you resign, change jobs, or retire. If you contract a health condition while working, you may later find individual term insurance rejected or unaffordably expensive. Owning a personal term plan protects your family regardless of career changes.'
    },
    {
      q: 'Can I use LifeMap in Telugu or Hindi?',
      a: 'Yes! LifeMap provides native support for English, Telugu (తెలుగు), and Hindi (हिंदी). You can toggle languages at any time from the top bar, and our AI Guide can explain complex calculations in your preferred language.'
    },
    {
      q: 'How does LifeMap handle my personal financial data?',
      a: 'We practice strict data minimization. LifeMap does NOT ask for your Aadhaar, PAN card, banking passwords, or policy upload documents. Your assessment numbers stay on your device or in your secure personal session.'
    }
  ];

  return (
    <div className="space-y-16 md:space-y-24 py-4">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navyDark via-brand-navy to-brand-navyLight text-white px-6 py-16 sm:px-12 sm:py-20 shadow-float border border-brand-teal/20">
        {/* Subtle decorative glow element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-teal/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-brand-amber/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-teal/20 border border-brand-teal/40 text-brand-tealLight text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
            <span>{t('heroBadge')} • Team AspireX</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            {t('heroHeadline')}
          </h1>

          <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
            {t('heroSubheadline')}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/assessment"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-extrabold text-brand-navyDark bg-gradient-to-r from-brand-tealLight to-brand-emerald hover:brightness-105 shadow-float transition-all transform hover:-translate-y-0.5"
            >
              <span>{t('startLifeMap')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
            >
              <span>{t('exploreHowItWorks')}</span>
            </a>
          </div>

          {/* Key value micro-bullets */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald" /> 100% Free & Independent
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald" /> Transparent Actuarial Logic
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald" /> English • తెలుగు • हिंदी
            </span>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM WITH TRADITIONAL INSURANCE */}
      <section className="space-y-8">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <span className="text-xs font-bold text-brand-coral uppercase tracking-wider">
            Why Traditional Discovery Fails
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            {t('problemHeadline')}
          </h2>
          <p className="text-sm text-brand-textSecondary">
            {t('problemSub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-subtle hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-coral flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-navy mb-2">
              {t('problem1Title')}
            </h3>
            <p className="text-xs text-brand-textSecondary leading-relaxed">
              {t('problem1Desc')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-subtle hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-navy mb-2">
              {t('problem2Title')}
            </h3>
            <p className="text-xs text-brand-textSecondary leading-relaxed">
              {t('problem2Desc')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-subtle hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-navy mb-2">
              {t('problem3Title')}
            </h3>
            <p className="text-xs text-brand-textSecondary leading-relaxed">
              {t('problem3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW LIFEMAP REVERSES THE JOURNEY */}
      <section id="how-it-works" className="space-y-10 scroll-mt-24">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">
            Reversing The Journey
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            {t('howItWorksHeadline')}
          </h2>
          <p className="text-sm text-brand-textSecondary">
            {t('howItWorksSub')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: t('step1'), desc: t('step1Desc'), icon: Compass, color: 'text-brand-navy', bg: 'bg-slate-100', link: '/goals' },
            { title: t('step2'), desc: t('step2Desc'), icon: Layers, color: 'text-brand-teal', bg: 'bg-teal-50', link: '/assessment' },
            { title: t('step3'), desc: t('step3Desc'), icon: Calculator, color: 'text-brand-emerald', bg: 'bg-emerald-50', link: '/calculator' },
            { title: t('step4'), desc: t('step4Desc'), icon: ShieldCheck, color: 'text-brand-coral', bg: 'bg-orange-50', link: '/coverage' },
            { title: t('step5'), desc: t('step5Desc'), icon: Sliders, color: 'text-brand-blue', bg: 'bg-blue-50', link: '/simulator' },
            { title: t('step6'), desc: t('step6Desc'), icon: Gamepad2, color: 'text-brand-amber', bg: 'bg-amber-50', link: '/games' },
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <Link
                key={idx}
                to={step.link}
                className="group bg-white rounded-2xl p-6 border border-brand-border shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl ${step.bg} ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-brand-navy mb-2 flex items-center justify-between">
                  <span>{step.title}</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  {step.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. INTERACTIVE SIMULATOR PREVIEW */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-card space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-border pb-6">
          <div>
            <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">
              Interactive Teaser
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1">
              Test Future Needs in Real Time
            </h2>
            <p className="text-xs sm:text-sm text-brand-textSecondary mt-1">
              Adjust monthly expenses and loans below to see how protection needs react.
            </p>
          </div>
          <Link
            to="/simulator"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-teal hover:text-brand-tealDark"
          >
            <span>Open Full Scenario Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-brand-navy mb-2">
                <span>Monthly Family Living Expenses</span>
                <span className="text-brand-teal font-extrabold text-sm">{formatIndianCurrency(demoExpense)}/mo</span>
              </div>
              <input
                type="range"
                min="20000"
                max="250000"
                step="5000"
                value={demoExpense}
                onChange={(e) => setDemoExpense(Number(e.target.value))}
                className="w-full accent-brand-teal cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-brand-textSecondary mt-1">
                <span>₹20,000/mo</span>
                <span>₹2,50,000/mo</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-brand-navy mb-2">
                <span>Support Horizon (Years Family Needs Support)</span>
                <span className="text-brand-teal font-extrabold text-sm">{demoYears} Years</span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={demoYears}
                onChange={(e) => setDemoYears(Number(e.target.value))}
                className="w-full accent-brand-teal cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-brand-textSecondary mt-1">
                <span>5 Years</span>
                <span>35 Years</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-brand-border flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-brand-navy">Include Home Loan Protection?</h4>
                <p className="text-[11px] text-brand-textSecondary">Simulate outstanding ₹40 Lakh home loan principal</p>
              </div>
              <button
                type="button"
                onClick={() => setHasHomeLoan(!hasHomeLoan)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  hasHomeLoan ? 'bg-brand-teal' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    hasHomeLoan ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Interactive Result Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-brand-navyDark to-brand-navy text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-float border border-brand-teal/30">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-tealLight">
              Calculated Living + Debt Shield
            </span>
            <div className="text-3xl sm:text-4xl font-black text-brand-tealLight tracking-tight">
              {formatIndianCurrency(demoEstimatedNeed, true)}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To support your family for {demoYears} years at {formatIndianCurrency(demoExpense)}/month
              {hasHomeLoan ? ' and fully pay off the ₹40L home loan,' : ''} your family requires approximately {formatIndianCurrency(demoEstimatedNeed)} in protection.
            </p>
            <div className="pt-2">
              <Link
                to="/assessment"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-brand-teal hover:bg-brand-tealLight text-brand-navyDark transition-colors"
              >
                <span>Calculate Your Exact Personalized Need</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MULTILINGUAL SHOWCASE */}
      <section className="bg-gradient-to-r from-teal-50 via-slate-50 to-blue-50 rounded-3xl p-8 sm:p-12 border border-brand-border space-y-6 text-center">
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-tealSoft text-brand-tealDark text-xs font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span>Inclusive Indian Localization</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            Understand Insurance in Your Mother Tongue
          </h2>
          <p className="text-xs sm:text-sm text-brand-textSecondary">
            Life insurance is too critical to be lost in English fine print. Explore every calculation, concept, and AI explanation natively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
          <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-brand-navy">English</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">Native</span>
            </div>
            <p className="text-xs text-brand-textSecondary italic">
              "Your family requires ₹1.25 Cr to maintain household living standards and clear the home loan."
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-brand-teal">తెలుగు (Telugu)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-brand-teal font-medium">Native</span>
            </div>
            <p className="text-xs text-brand-textSecondary italic">
              "మీ కుటుంబ జీవన ప్రమాణాలను కొనసాగించడానికి మరియు రుణాలను తీర్చడానికి ₹1.25 కోట్ల రక్షణ అవసరం."
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-brand-blue">हिंदी (Hindi)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-brand-blue font-medium">Native</span>
            </div>
            <p className="text-xs text-brand-textSecondary italic">
              "परिवार के जीवन स्तर को बनाए रखने और होम लोन चुकाने के लिए ₹1.25 करोड़ की शुद्ध सुरक्षा आवश्यक है।"
            </p>
          </div>
        </div>
      </section>

      {/* 6. THREE CONFIGURABLE MINI-GAMES PREVIEW */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-brand-amber uppercase tracking-wider">
              Gamified Discovery Framework
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1">
              Learn Insurance Through Interactive Games
            </h2>
            <p className="text-xs sm:text-sm text-brand-textSecondary mt-1">
              Configurable micro-learning modules to master insurance concepts without boring textbooks.
            </p>
          </div>
          <Link
            to="/games"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-teal hover:text-brand-tealDark"
          >
            <span>View All Learning Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CONFIGURABLE_GAMES.map((game) => (
            <div
              key={game.id}
              className="bg-white rounded-2xl p-6 border border-brand-border shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-tealSoft text-brand-tealDark border border-brand-teal/20">
                    {game.category}
                  </span>
                  <span className="text-[10px] font-semibold text-brand-textSecondary">
                    {game.estimatedMinutes} mins
                  </span>
                </div>

                <h3 className="text-base font-bold text-brand-navy leading-snug">
                  {game.title}
                </h3>

                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  {game.shortDescription}
                </p>

                <div className="pt-2 text-[11px] text-brand-textPrimary bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <strong className="text-brand-teal">Takeaway: </strong>
                  {game.learningObjective}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-brand-border flex items-center justify-between">
                <span className="text-xs font-bold text-brand-amber flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> {game.badgeName}
                </span>
                <Link
                  to="/games"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight transition-colors"
                >
                  Play Preview
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. PRIVACY & TRANSPARENCY COMMITMENTS */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-border shadow-subtle space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-brand-emerald uppercase tracking-wider">
            Our Promise to You
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            100% Privacy & Transparent Ethics
          </h2>
          <p className="text-xs sm:text-sm text-brand-textSecondary">
            We built LifeMap to empower Indian families, not to harvest phone numbers for spam calls.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <Lock className="w-5 h-5 text-brand-emerald" />
            <h4 className="text-xs font-bold text-brand-navy">No Spam Ever</h4>
            <p className="text-[11px] text-brand-textSecondary leading-relaxed">
              We never sell your contact info to third-party telemarketers or call centers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <Calculator className="w-5 h-5 text-brand-teal" />
            <h4 className="text-xs font-bold text-brand-navy">Deterministic Math</h4>
            <p className="text-[11px] text-brand-textSecondary leading-relaxed">
              Every rupee is calculated using clear present-value math, not opaque black-box AI.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <EyeOff className="w-5 h-5 text-brand-blue" />
            <h4 className="text-xs font-bold text-brand-navy">Data Minimization</h4>
            <p className="text-[11px] text-brand-textSecondary leading-relaxed">
              No Aadhaar, PAN card, or bank account access requested. Explore in guest demo mode.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <HeartHandshake className="w-5 h-5 text-brand-amber" />
            <h4 className="text-xs font-bold text-brand-navy">Zero Commission Bias</h4>
            <p className="text-[11px] text-brand-textSecondary leading-relaxed">
              We do not broker policies or earn kickbacks on product recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-brand-textSecondary uppercase tracking-wider">
            Clear Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-subtle transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-brand-navy hover:text-brand-teal transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-teal' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs text-brand-textSecondary leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION */}
      <section className="rounded-3xl bg-gradient-to-r from-brand-navy via-brand-navyLight to-brand-teal text-white p-8 sm:p-14 text-center space-y-6 shadow-float border border-brand-tealLight/20">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Protect What Matters Most?
          </h2>
          <p className="text-xs sm:text-base text-slate-200 leading-relaxed">
            Begin your personalized LifeMap in under 3 minutes. Discover your genuine coverage needs with zero sales pitch.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/assessment"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-extrabold text-brand-navyDark bg-gradient-to-r from-brand-tealLight to-brand-emerald hover:brightness-105 shadow-float transition-all"
          >
            <span>{t('startLifeMap')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
          >
            <span>View Demo Dashboard</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
