import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import { CONFIGURABLE_GAMES } from '../../data/gamesData';
import { GameMetadata, UserLearningProgress } from '../../types';
import { gameService } from '../../services/gameService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Clock,
  Award
} from 'lucide-react';

export const GamesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState<GameMetadata | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [userProgress, setUserProgress] = useState<UserLearningProgress[]>([]);

  useEffect(() => {
    gameService.getUserProgress(user?.id).then(setUserProgress);
  }, [user]);

  const startGame = (game: GameMetadata) => {
    setActiveGame(game);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setCompleted(false);
  };

  const handleAnswer = (idx: number) => {
    if (showExplanation) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    if (activeGame && idx === activeGame.previewConcept.sampleQuestions[currentQ].answerIndex) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = async () => {
    if (!activeGame) return;
    const questions = activeGame.previewConcept.sampleQuestions;
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
      const isPassed = score >= Math.ceil(questions.length / 2);
      const earnedBadge = isPassed ? activeGame.badgeName : undefined;
      const updated = await gameService.saveScore(
        user?.id || null,
        activeGame.id,
        score,
        true,
        earnedBadge
      );
      setUserProgress((prev) => {
        const filtered = prev.filter(p => p.gameId !== updated.gameId);
        return [...filtered, updated];
      });
    }
  };

  const exitGame = () => {
    setActiveGame(null);
    setCompleted(false);
    setCurrentQ(0);
  };

  const allBadges = Array.from(
    new Set(userProgress.flatMap(p => p.badgesEarned || []))
  );

  // Playing an active game
  if (activeGame) {
    const questions = activeGame.previewConcept.sampleQuestions;

    // Completed Screen
    if (completed) {
      const passed = score >= Math.ceil(questions.length / 2);
      return (
        <div className="max-w-xl mx-auto py-8 space-y-6">
          <div className="rounded-2xl p-6 sm:p-8 text-center space-y-4 border border-brand-border bg-white shadow-subtle">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-brand-teal flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold text-brand-navy">
              Challenge Complete
            </h2>

            <p className="text-sm font-semibold text-brand-navy">
              Score: {score} of {questions.length} correct
            </p>

            {passed && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
                Badge Earned: {activeGame.badgeName}
              </span>
            )}

            <p className="text-xs text-brand-textSecondary leading-relaxed pt-2 border-t border-brand-border">
              <strong>Takeaway:</strong> {activeGame.previewConcept.keyTakeaway}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => startGame(activeGame)}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={exitGame}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-brand-navy border border-brand-border hover:bg-slate-50 transition-colors"
            >
              All Challenges
            </button>
          </div>
        </div>
      );
    }

    // Active Question Screen
    const q = questions[currentQ];
    return (
      <div className="max-w-xl mx-auto py-6 space-y-5">
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={exitGame}
            className="font-semibold text-brand-textSecondary hover:text-brand-navy transition-colors"
          >
            ← Back to Challenges
          </button>
          <span className="font-bold text-brand-navy">
            Question {currentQ + 1} of {questions.length}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-subtle space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
              {activeGame.category}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-brand-navy leading-snug">
              {q.prompt}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {q.options.map((option, idx) => {
              const isCorrect = idx === q.answerIndex;
              const isSelected = selectedAnswer === idx;
              let style = 'bg-white border-brand-border hover:border-brand-teal';

              if (showExplanation) {
                if (isCorrect) style = 'bg-emerald-50 border-emerald-400 font-semibold';
                else if (isSelected && !isCorrect) style = 'bg-red-50 border-red-300 opacity-80';
                else style = 'bg-slate-50 border-slate-200 opacity-50';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={showExplanation}
                  className={`w-full text-left p-3 rounded-xl border text-xs text-brand-navy transition-colors flex items-start gap-2.5 ${style}`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {showExplanation && isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> :
                     showExplanation && isSelected && !isCorrect ? <XCircle className="w-3.5 h-3.5 text-red-600" /> :
                     String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-brand-textSecondary space-y-1">
              <span className="font-bold text-brand-navy block">Explanation</span>
              <p className="leading-relaxed">{q.explanation}</p>
            </div>
          )}

          {showExplanation && (
            <button
              onClick={nextQuestion}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight transition-colors flex items-center justify-center gap-1.5"
            >
              {currentQ < questions.length - 1 ? 'Next Question' : 'Complete Challenge'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Games Listing
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Title & Subtitle */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          Financial Literacy
        </h1>
        <p className="text-xs sm:text-sm text-brand-textSecondary">
          Quick interactive challenges to understand term insurance and financial risk.
        </p>
      </div>

      {/* Badges Earned */}
      {allBadges.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3 text-xs">
          <span className="font-bold text-amber-900">Your Badges:</span>
          <div className="flex flex-wrap gap-1.5">
            {allBadges.map((badge) => (
              <span key={badge} className="px-2.5 py-0.5 rounded-full bg-white border border-amber-300 text-[11px] font-semibold text-amber-800">
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Clean Compact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CONFIGURABLE_GAMES.map((game) => {
          const progress = userProgress.find(p => p.gameId === game.id);

          return (
            <div
              key={game.id}
              className="bg-white rounded-2xl border border-brand-border shadow-subtle p-5 flex flex-col justify-between space-y-4 hover:border-brand-teal/40 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-brand-textSecondary">
                    {game.category}
                  </span>
                  <span className="text-[10px] font-medium text-brand-textSecondary">
                    {game.difficulty}
                  </span>
                </div>

                <h2 className="text-sm font-bold text-brand-navy flex items-center justify-between">
                  <span>{game.title}</span>
                  {progress?.completed && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                </h2>

                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  {game.shortDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-brand-border flex items-center justify-between">
                <span className="text-[11px] text-brand-textSecondary">
                  {game.estimatedMinutes} min
                  {progress && progress.attempts > 0 && ` • ${progress.attempts} played`}
                </span>

                <button
                  onClick={() => startGame(game)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight transition-colors"
                >
                  {progress?.completed ? 'Play Again' : 'Play Challenge'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
