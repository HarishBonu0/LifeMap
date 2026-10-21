import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n';
import { Logo } from '../../components/Logo';

export const SignInPage: React.FC = () => {
  const { user, signIn, resetPassword } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Preserve intended destination from router state
  const from = (location.state as any)?.from?.pathname || '/overview';

  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage(t('enterBothEmailPassword') || 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(cleanEmail, password);
      if (error) {
        setErrorMessage(error.message || t('invalidCredentials') || 'Invalid email or password.');
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      setErrorMessage(t('networkError') || 'Sign in request failed. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanResetEmail = resetEmail.trim();
    if (!cleanResetEmail) return;

    setResetLoading(true);
    try {
      const { error } = await resetPassword(cleanResetEmail);
      if (error) {
        setErrorMessage(error.message || 'Could not send reset email.');
      } else {
        setResetSent(true);
      }
    } catch {
      setErrorMessage(t('networkError') || 'Password reset failed.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12">
      <div className="bg-white rounded-2xl border border-brand-border shadow-card p-7 sm:p-9 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-brand-teal/50 rounded-lg">
            <Logo variant="compact" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-brand-navy pt-2">
            {t('signInTitle') || 'Sign In to LifeMap'}
          </h1>
          <p className="text-xs text-brand-textSecondary">
            {t('signInSub') || 'Enter your credentials to access your private protection plan.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-brand-navy">{t('emailLabel') || 'Email Address'}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder') || 'name@example.com'}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-brand-navy">{t('passwordLabel') || 'Password'}</label>
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(true);
                  setResetEmail(email);
                }}
                className="text-[11px] font-semibold text-brand-teal hover:underline cursor-pointer"
              >
                {t('forgotPassword') || 'Forgot password?'}
              </button>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-brand-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-textSecondary hover:text-brand-navy cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{t('login') || 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-2 text-center text-xs text-brand-textSecondary border-t border-brand-border">
          <span>{t('dontHaveAccount') || "Don't have an account?"} </span>
          <Link to="/signup" className="font-bold text-brand-teal hover:underline ml-1">
            {t('createFreeAccount') || 'Create Account'}
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-brand-border p-6 max-w-sm w-full space-y-4 shadow-float animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-brand-navy">{t('resetPasswordTitle') || 'Reset Password'}</h3>
            {resetSent ? (
              <div className="space-y-3 text-center py-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  {t('resetSentSuccess') || 'Password reset link has been sent. Please check your inbox.'}
                </p>
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setResetSent(false);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-brand-navy cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <p className="text-xs text-brand-textSecondary">
                  {t('resetPasswordDesc') || 'Enter your registered email to receive password reset instructions.'}
                </p>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder={t('emailPlaceholder') || 'name@example.com'}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-navy"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-textSecondary hover:bg-slate-100 cursor-pointer"
                  >
                    {t('cancel') || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-navy cursor-pointer"
                  >
                    {resetLoading ? 'Sending...' : (t('sendResetLink') || 'Send Reset Link')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
