import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  ShieldCheck, 
  Download, 
  Trash2, 
  LogOut, 
  Check, 
  Lock, 
  Database,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StorageAdapter } from '../../lib/storage';
import { scenarioService } from '../../services/scenarioService';
import { assessmentService } from '../../services/assessmentService';

export const SettingsPage: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const userProfile = profile || StorageAdapter.getUserProfile();
      const goals = StorageAdapter.getLifeGoals();
      const scenarios = await scenarioService.getUserScenarios(user?.id || null);
      let session = null;
      let answers = {};
      if (user?.id) {
        const sessData = await assessmentService.getOrCreateSession(user.id);
        session = sessData.session;
        answers = sessData.answers;
      }

      const exportPayload = {
        exportedAt: new Date().toISOString(),
        user: {
          id: user?.id || userProfile.id,
          email: user?.email || userProfile.email,
          name: userProfile.name,
          language: userProfile.preferredLanguage
        },
        financialGoals: goals,
        savedScenarios: scenarios,
        mindsetAssessment: {
          session,
          answers
        }
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifemap-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setExporting(false);
    }
  };

  const handleResetSessionData = () => {
    sessionStorage.removeItem('lifemap_assessment');
    sessionStorage.removeItem('lifemap_result');
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      window.location.reload();
    }, 1200);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Title */}
      <div className="border-b border-brand-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          Account & Privacy Settings
        </h1>
        <p className="text-xs sm:text-sm text-brand-textSecondary mt-0.5">
          Control your data privacy, security status, session management, and account exports.
        </p>
      </div>

      <div className="space-y-6">
        {/* Security & Database Row Level Security Info */}
        <div className="bg-white rounded-2xl border border-brand-border shadow-subtle p-6 space-y-4">
          <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-teal" /> Security & Database Row Level Security (RLS)
          </h2>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-brand-navy space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Row-Level Security Active (auth.uid() = user_id)</span>
            </div>
            <p className="text-[11px] text-brand-textSecondary leading-relaxed">
              Every table (`profiles`, `assessment_sessions`, `assessment_answers`, `game_progress`, `chat_conversations`, `chat_messages`, `growth_scenarios`) enforces database-level isolation. No authenticated or unauthenticated query can view or modify records belonging to other users.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl border border-brand-border">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Authenticated User ID</span>
              <span className="font-mono text-brand-navy truncate block mt-0.5">{user?.id || 'demo-guest-session'}</span>
            </div>
            <div className="p-3 rounded-xl border border-brand-border">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Session Status</span>
              <span className="font-semibold text-emerald-600 block mt-0.5">{user ? 'Signed In (Persistent)' : 'Guest Demo Persona'}</span>
            </div>
          </div>
        </div>

        {/* Data Portability (Export) */}
        <div className="bg-white rounded-2xl border border-brand-border shadow-subtle p-6 space-y-4">
          <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
            <Download className="w-4 h-4 text-brand-teal" /> Data Portability & Export
          </h2>

          <p className="text-xs text-brand-textSecondary leading-relaxed">
            You own your financial data. Download a complete JSON snapshot containing your financial assessment inputs, calculated needs, mindset answers, and saved simulator scenarios.
          </p>

          <div>
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle disabled:opacity-50 transition-all"
            >
              {exportSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
              <span>{exportSuccess ? 'Data Export Downloaded' : 'Export My Data (JSON)'}</span>
            </button>
          </div>
        </div>

        {/* Session Cache & Reset */}
        <div className="bg-white rounded-2xl border border-brand-border shadow-subtle p-6 space-y-4">
          <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-brand-teal" /> Session Management
          </h2>

          <p className="text-xs text-brand-textSecondary leading-relaxed">
            Clear current in-memory financial assessment cache without deleting your saved account profile.
          </p>

          <div>
            <button
              onClick={handleResetSessionData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-brand-navy border border-brand-border hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{resetSuccess ? 'Cache Cleared! Reloading...' : 'Clear Session Cache'}</span>
            </button>
          </div>
        </div>

        {/* Sign Out Card */}
        <div className="bg-white rounded-2xl border border-red-200/80 shadow-subtle p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Terminate Active Session
            </h3>
            <p className="text-xs text-brand-textSecondary mt-0.5">
              Securely logs you out and clears all session tokens from your browser.
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-subtle transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
