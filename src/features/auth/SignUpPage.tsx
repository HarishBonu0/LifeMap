import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Globe 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n';
import { Language } from '../../types';
import { Logo } from '../../components/Logo';

export const SignUpPage: React.FC = () => {
  const { signUp } = useAuth();
  const { language, setLanguage } = useTranslation();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(language);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email.trim(), password, fullName.trim(), selectedLang);
      if (error) {
        setErrorMessage(error.message || 'Failed to create account.');
      } else {
        setLanguage(selectedLang);
        setSuccess(true);
        setTimeout(() => {
          navigate('/overview', { replace: true });
        }, 1200);
      }
    } catch {
      setErrorMessage('Sign up failed. Please check your network connection.');
    } finally {
      setLoading(false);
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
            Create Your Account
          </h1>
          <p className="text-xs text-brand-textSecondary">
            Independent life insurance and wealth planning for you and your family.
          </p>
        </div>

        {/* Error or Success Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>Account created successfully! Opening your dashboard...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-brand-navy">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-brand-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-brand-navy">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-brand-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-textSecondary hover:text-brand-navy"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-brand-navy">Confirm Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-brand-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                minLength={6}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-brand-navy">Preferred Language</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'en' as Language, label: 'English', short: 'English' },
                { code: 'te' as Language, label: 'Telugu', short: 'తెలుగు' },
                { code: 'hi' as Language, label: 'Hindi', short: 'हिंदी' },
              ].map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setSelectedLang(l.code)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-colors ${
                    selectedLang === l.code
                      ? 'bg-teal-50 border-brand-teal text-brand-teal font-bold'
                      : 'bg-white border-brand-border text-brand-textSecondary hover:bg-slate-50'
                  }`}
                >
                  {l.short}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Free Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-2 text-center text-xs text-brand-textSecondary border-t border-brand-border">
          <span>Already have an account? </span>
          <Link to="/signin" className="font-bold text-brand-teal hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
