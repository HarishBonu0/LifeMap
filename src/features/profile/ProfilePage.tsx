import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Globe, 
  Brain, 
  Check, 
  RotateCcw, 
  Save, 
  ShieldCheck, 
  Target, 
  Sliders,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n';
import { Language, LifeGoal } from '../../types';
import { StorageAdapter } from '../../lib/storage';
import { assessmentService } from '../../services/assessmentService';

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { language, setLanguage } = useTranslation();

  const [name, setName] = useState('');
  const [preferredLang, setPreferredLang] = useState<Language>(language);
  const [targetRetirementAge, setTargetRetirementAge] = useState<number>(60);
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState<number>(25000);
  const [riskComfort, setRiskComfort] = useState<'conservative' | 'moderate' | 'growth'>('moderate');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mindsetCategory, setMindsetCategory] = useState<string | null>(null);
  const [mindsetScore, setMindsetScore] = useState<number | null>(null);

  useEffect(() => {
    const current = profile || StorageAdapter.getUserProfile();
    setName(current.name || '');
    setPreferredLang(current.preferredLanguage || language);

    // Fetch assessment status
    if (user?.id) {
      assessmentService.getOrCreateSession(user.id).then(({ session }) => {
        if (session.status === 'completed') {
          setMindsetCategory(session.mindsetCategory || 'Prudent Protector');
          setMindsetScore(session.score || 85);
        }
      });
    }
  }, [profile, user, language]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (user) {
        await updateProfile({
          name,
          preferredLanguage: preferredLang
        });
      } else {
        StorageAdapter.setUserProfile({
          ...StorageAdapter.getUserProfile(),
          name,
          preferredLanguage: preferredLang
        });
      }

      setLanguage(preferredLang);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setSaving(false);
    }
  };

  const goals: LifeGoal[] = StorageAdapter.getLifeGoals();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Title */}
      <div className="border-b border-brand-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          My Profile & Planning Preferences
        </h1>
        <p className="text-xs sm:text-sm text-brand-textSecondary mt-0.5">
          Manage your personal details, language, financial mindset status, and life goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-brand-border shadow-subtle p-6 space-y-5">
            <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-brand-teal" /> Personal Details
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-navy">Display Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-brand-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-navy">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-brand-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={user?.email || 'guest@lifemap.in'}
                    disabled
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-slate-50 text-xs font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-brand-textSecondary">
                  Email is linked to your secure Supabase authenticated account.
                </p>
              </div>

              {/* Language Selection */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-brand-navy">Preferred Language</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { code: 'en' as Language, label: 'English', native: 'English' },
                    { code: 'te' as Language, label: 'Telugu', native: 'తెలుగు' },
                    { code: 'hi' as Language, label: 'Hindi', native: 'हिंदी' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setPreferredLang(l.code)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                        preferredLang === l.code
                          ? 'bg-teal-50 border-brand-teal text-brand-teal font-bold ring-1 ring-brand-teal'
                          : 'bg-white border-brand-border hover:bg-slate-50 text-brand-navy'
                      }`}
                    >
                      <span className="block">{l.native}</span>
                      <span className="text-[10px] text-brand-textSecondary">{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Financial Planning Preferences */}
              <div className="pt-3 border-t border-brand-border space-y-4">
                <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-teal" /> Long-Term Financial Preferences
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-brand-navy">Target Retirement Age</label>
                    <input
                      type="number"
                      min={45}
                      max={75}
                      value={targetRetirementAge}
                      onChange={(e) => setTargetRetirementAge(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-brand-navy">Monthly Target Savings (₹)</label>
                    <input
                      type="number"
                      step={5000}
                      value={monthlySavingsGoal}
                      onChange={(e) => setMonthlySavingsGoal(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-border flex items-center justify-between">
              <span className="text-xs text-brand-textSecondary">
                Changes are saved to your user profile in PostgreSQL.
              </span>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle disabled:opacity-50 transition-all"
              >
                {saveSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                <span>{saveSuccess ? 'Changes Saved' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Mindset Assessment & Goals Summary */}
        <div className="space-y-6">
          {/* Mindset Card */}
          <div className="bg-white rounded-2xl border border-brand-border shadow-subtle p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-brand-teal" /> Financial Mindset
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-brand-teal uppercase">
                {mindsetCategory ? 'Completed' : 'Pending'}
              </span>
            </div>

            {mindsetCategory ? (
              <div className="space-y-2">
                <p className="text-base font-bold text-brand-navy">
                  {mindsetCategory}
                </p>
                <p className="text-xs text-brand-textSecondary">
                  Preparedness Score: <strong className="text-brand-teal">{mindsetScore}%</strong>
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <Link
                    to="/mindset"
                    className="flex-1 text-center py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-brand-navy transition-colors"
                  >
                    Review Assessment
                  </Link>
                  <Link
                    to="/mindset"
                    className="flex-1 text-center py-2 rounded-xl text-xs font-semibold border border-brand-border hover:bg-slate-50 text-brand-navy transition-colors"
                  >
                    Retake
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  You haven't completed the 20-question mindset assessment yet. Discover your financial resilience profile today.
                </p>
                <Link
                  to="/mindset"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle transition-all"
                >
                  <span>Start Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Saved Life Goals */}
          <div className="bg-white rounded-2xl border border-brand-border shadow-subtle p-5 space-y-3">
            <span className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
              <Target className="w-4 h-4 text-brand-teal" /> Saved Financial Goals
            </span>
            <div className="space-y-2">
              {goals.map((goal) => (
                <div key={goal.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-brand-navy block">{goal.title}</span>
                    <span className="text-[10px] text-brand-textSecondary">{goal.targetYears} yrs timeline</span>
                  </div>
                  <span className="font-extrabold text-brand-teal">
                    ₹{(goal.targetAmount / 100000).toFixed(1)}L
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
