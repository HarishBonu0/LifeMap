import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { assessmentService } from '../../services/assessmentService';
import { AssessmentSession, AssessmentAnswer, MindsetQuestion } from '../../types';
import { AuthModal } from '../../components/AuthModal';
import { formatIndianCurrency } from '../../lib/calculator';
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Lock,
  Eye,
  Info,
  TrendingUp,
  Award
} from 'lucide-react';

export const MindsetPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [questions, setQuestions] = useState<MindsetQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showAnswerReview, setShowAnswerReview] = useState(false);

  const activeUserId = user?.id || 'demo-guest';

  const initSession = async () => {
    setLoading(true);
    try {
      const { session: sess, questions: qList, answers: ansMap } = await assessmentService.getOrCreateSession(activeUserId);
      setSession(sess);
      setQuestions(qList);
      setAnswers(ansMap);
      setCurrentIndex(sess.currentQuestionIndex || Object.keys(ansMap).length);
    } catch (err) {
      console.error('Failed to initialize mindset session', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initSession();
  }, [user]);

  const handleSelectOption = async (optionIndex: number, points: number) => {
    if (!session || saving || currentIndex >= questions.length) return;
    setSaving(true);

    const currentQ = questions[currentIndex];
    const nextIdx = currentIndex + 1;

    try {
      const { answer, error } = await assessmentService.saveAnswer(
        session.id,
        activeUserId,
        currentQ.id,
        optionIndex,
        points,
        nextIdx
      );

      if (answer && !error) {
        setAnswers((prev) => ({ ...prev, [currentQ.id]: answer }));
      }

      if (nextIdx < questions.length) {
        setCurrentIndex(nextIdx);
      } else {
        // Complete the 20-question assessment
        const { session: completedSession } = await assessmentService.completeSession(session.id, activeUserId);
        if (completedSession) {
          setSession(completedSession);
        }
      }
    } catch (err) {
      console.error('Failed to record answer', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRetake = async () => {
    setLoading(true);
    await initSession();
  };

  // Map category to user-friendly title
  const getCategoryTitle = (cat?: string) => {
    if (!cat) return 'Balanced Planner';
    if (cat === 'Prudent Protector') return 'Protection-Focused (Prudent Protector)';
    if (cat === 'Disciplined Builder') return 'Balanced Planner (Disciplined Builder)';
    if (cat === 'Aggressive Accumulator') return 'Long-Term Growth-Oriented (Aggressive Accumulator)';
    return 'Vulnerable Starter';
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-2 text-xs text-brand-textSecondary">
        <div className="w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
        <span>Loading randomized assessment session...</span>
      </div>
    );
  }

  // Completed State View
  if (session?.status === 'completed') {
    const answeredList = questions.map((q) => {
      const ans = answers[q.id];
      const selectedOpt = ans !== undefined ? q.options[ans.selectedOptionIndex] : null;
      return { question: q, selectedOption: selectedOpt };
    });

    return (
      <div className="max-w-3xl mx-auto py-6 space-y-6">
        {/* Main Result Card */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 sm:p-8 shadow-card text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-brand-teal flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
              Assessment Completed & Scoped
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
              {getCategoryTitle(session.mindsetCategory)}
            </h1>
            <p className="text-xs text-brand-textSecondary">
              Financial Resilience & Preparedness Score: <strong className="text-brand-navy font-bold">{session.score}%</strong>
            </p>
          </div>

          {/* Transparent Category Explanation based on user's answers */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-brand-textSecondary leading-relaxed text-left space-y-3">
            <p className="font-bold text-brand-navy flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-amber" /> Transparent Profile Analysis
            </p>
            <p>
              {session.mindsetCategory === 'Prudent Protector' &&
                'Your responses reflect an exceptional actuarial understanding of financial vulnerability. You prioritize pure term insurance over high-fee endowment products, insist on full health transparency, recognize the portability risks of employer cover, and maintain strong liquidity.'}
              {session.mindsetCategory === 'Disciplined Builder' &&
                'You demonstrate sound foundational budgeting, debt discipline, and genuine concern for dependants. You can optimize further by ensuring that home loan liabilities and higher education milestones are fully insured with pure individual term coverage.'}
              {session.mindsetCategory === 'Aggressive Accumulator' &&
                'You place high emphasis on investments and wealth generation, but may have under-hedged core mortality and health risks. Remember that investment returns can fluctuate, while a term insurance backstop guarantees your family\'s standard of living.'}
              {session.mindsetCategory === 'Vulnerable Starter' &&
                'Your current strategy leaves dependants exposed to income disruption. Priority actions include establishing 3–6 months of emergency reserves and locking in an affordable pure term life insurance policy before taking investment risks.'}
            </p>
            <div className="pt-2 border-t border-slate-200 text-[11px] text-brand-textSecondary italic">
              <strong>Notice:</strong> This profile is an educational categorization based on your entered answers, not a psychological diagnosis or insurance recommendation.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/coverage"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle transition-all"
            >
              <span>View My Protection Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/simulator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-brand-navy border border-brand-border hover:bg-slate-50 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-brand-teal" />
              <span>Explore 10- & 20-Yr Projections</span>
            </Link>
            <button
              onClick={() => setShowAnswerReview(!showAnswerReview)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-brand-textSecondary border border-brand-border hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showAnswerReview ? 'Hide Review' : 'Review Answers'}</span>
            </button>
            <button
              onClick={handleRetake}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-brand-textSecondary hover:text-brand-navy transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>
          </div>
        </div>

        {/* Detailed Review of Answers */}
        {showAnswerReview && (
          <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-subtle space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-bold text-brand-navy">Review of Your 20 Answers</h3>
            <div className="space-y-3">
              {answeredList.map((item, idx) => (
                <div key={item.question.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <span className="text-[10px] font-bold uppercase text-brand-teal">Question {idx + 1}</span>
                  <p className="font-semibold text-brand-navy">{item.question.prompt}</p>
                  <p className="text-emerald-700 bg-emerald-50/60 p-2 rounded-lg mt-1 border border-emerald-100">
                    <strong>Your Answer:</strong> {item.selectedOption?.text || 'Not recorded'}
                  </p>
                  {item.selectedOption?.insight && (
                    <p className="text-[11px] text-brand-textSecondary">
                      <em>Insight:</em> {item.selectedOption.insight}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Assessment Question Stepper View
  const currentQ = questions[currentIndex] || questions[0];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / (questions.length || 20)) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Title */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-brand-teal text-[10px] font-bold uppercase tracking-wider">
          <Brain className="w-3 h-3" /> Financial Mindset Stepper
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          Discover Your Protection Mindset
        </h1>
        <p className="text-xs text-brand-textSecondary">
          20 meaningful questions assessing risk tolerance, liabilities, dependents, and time horizon.
        </p>
      </div>

      {/* Progress Bar & Counter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-brand-navy">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span className="text-brand-teal">{progressPercent}% Completed</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-teal rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="bg-white rounded-2xl border border-brand-border shadow-subtle p-6 space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
              {currentQ.category.replace('_', ' ')}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-brand-navy leading-snug">
              {currentQ.prompt}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = answers[currentQ.id]?.selectedOptionIndex === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx, opt.points)}
                  disabled={saving}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs text-brand-navy transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-teal-50 border-brand-teal ring-1 ring-brand-teal font-semibold'
                      : 'bg-white border-brand-border hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                    isSelected ? 'bg-brand-teal text-white' : 'bg-slate-100 text-brand-textSecondary'
                  }`}>
                    {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Footer Navigation Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-brand-border text-xs text-brand-textSecondary">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1 text-brand-textSecondary hover:text-brand-navy disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="text-[11px] text-brand-textSecondary">
              Answers persist automatically to your session
            </span>

            {!user && (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="text-[11px] text-brand-teal font-semibold hover:underline flex items-center gap-1"
              >
                <Lock className="w-3 h-3" /> Sign in to sync
              </button>
            )}
          </div>
        </div>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};
