import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { CONFIGURABLE_GAMES } from '../../data/gamesData';
import { GameMetadata } from '../../types';
import {
  Gamepad2, Sparkles, Trophy, Clock, BarChart3, CheckCircle2,
  XCircle, ChevronRight, RotateCcw, Star, Zap, Award
} from 'lucide-react';

export const GamesPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeGame, setActiveGame] = useState<GameMetadata | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

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

  const nextQuestion = () => {
    if (!activeGame) return;
    const questions = activeGame.previewConcept.sampleQuestions;
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
      if (score >= Math.ceil(questions.length / 2) && !earnedBadges.includes(activeGame.badgeName)) {
        setEarnedBadges((prev) => [...prev, activeGame.badgeName]);
      }
    }
  };

  const exitGame = () => {
    setActiveGame(null);
    setCompleted(false);
    setCurrentQ(0);
  };

  // Playing a game
  if (activeGame) {
    const questions = activeGame.previewConcept.sampleQuestions;

    // Completed screen
    if (completed) {
      const perfect = score === questions.length;
      const passed = score >= Math.ceil(questions.length / 2);
      return (
        <div className="max-w-2xl mx-auto py-10 space-y-8">
          <div className={`rounded-3xl p-8 text-center space-y-4 border shadow-float ${
            perfect ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300' : passed ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
          }`}>
            {perfect ? (
              <Trophy className="w-16 h-16 mx-auto text-amber-500" />
            ) : passed ? (
              <Award className="w-16 h-16 mx-auto text-emerald-500" />
            ) : (
              <RotateCcw className="w-16 h-16 mx-auto text-slate-400" />
            )}
            <h2 className="text-2xl font-black text-brand-navy">
              {perfect ? '🎉 Perfect Score!' : passed ? 'Great Job!' : 'Keep Learning!'}
            </h2>
            <p className="text-lg font-bold text-brand-teal">{score} / {questions.length} Correct</p>
            {passed && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-amber/20 border border-brand-amber/40">
                <Sparkles className="w-4 h-4 text-brand-amber" />
                <span className="text-xs font-bold text-amber-800">Badge Earned: {activeGame.badgeName}</span>
              </div>
            )}
            <p className="text-xs text-brand-textSecondary max-w-md mx-auto">
              <strong>Key Takeaway:</strong> {activeGame.previewConcept.keyTakeaway}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button onClick={() => startGame(activeGame)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight transition-all">
              <RotateCcw className="w-3.5 h-3.5 inline mr-1.5" /> Play Again
            </button>
            <button onClick={exitGame} className="px-6 py-2.5 rounded-xl text-xs font-bold text-brand-navy bg-slate-100 hover:bg-slate-200 transition-all">
              All Games
            </button>
          </div>
        </div>
      );
    }

    // Active question
    const q = questions[currentQ];
    return (
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        {/* Game Header */}
        <div className="flex items-center justify-between">
          <button onClick={exitGame} className="text-xs font-bold text-brand-textSecondary hover:text-brand-navy transition-colors">
            ← All Games
          </button>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-brand-teal">Q{currentQ + 1}/{questions.length}</span>
            <span className="px-2 py-0.5 rounded-full bg-brand-tealSoft text-brand-tealDark">{score} pts</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-border shadow-card space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-brand-teal uppercase tracking-wider">{activeGame.category}</span>
            <h3 className="text-base font-bold text-brand-navy leading-relaxed">{q.prompt}</h3>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-teal rounded-full transition-all duration-500"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((option, idx) => {
              const isCorrect = idx === q.answerIndex;
              const isSelected = selectedAnswer === idx;
              let optionStyle = 'bg-white border-brand-border hover:border-brand-teal hover:shadow-card';

              if (showExplanation) {
                if (isCorrect) optionStyle = 'bg-emerald-50 border-emerald-400 shadow-card';
                else if (isSelected && !isCorrect) optionStyle = 'bg-red-50 border-red-400';
                else optionStyle = 'bg-slate-50 border-slate-200 opacity-60';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={showExplanation}
                  className={`w-full text-left px-5 py-3.5 rounded-xl border transition-all flex items-start gap-3 ${optionStyle}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                    showExplanation && isCorrect ? 'bg-emerald-500 text-white' :
                    showExplanation && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                    'bg-slate-100 text-brand-textSecondary'
                  }`}>
                    {showExplanation && isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                     showExplanation && isSelected && !isCorrect ? <XCircle className="w-3.5 h-3.5" /> :
                     String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-xs font-medium text-brand-navy leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
              <p className="text-xs font-bold text-blue-800">Explanation</p>
              <p className="text-xs text-blue-700 leading-relaxed">{q.explanation}</p>
            </div>
          )}

          {showExplanation && (
            <button
              onClick={nextQuestion}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight transition-all flex items-center justify-center gap-1.5"
            >
              {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Games Listing
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">{t('gamesTitle')}</h1>
        <p className="text-sm text-brand-textSecondary">{t('gamesSub')}</p>
      </div>

      {/* Badges Earned */}
      {earnedBadges.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-200 shadow-subtle">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-brand-amber" />
            <span className="text-xs font-bold text-amber-800">Your Earned Badges</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-amber-300 text-[11px] font-bold text-amber-700">
                <Trophy className="w-3 h-3" /> {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Game Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CONFIGURABLE_GAMES.map((game) => (
          <div
            key={game.id}
            className="bg-white rounded-2xl border border-brand-border shadow-subtle hover:shadow-card transition-all flex flex-col"
          >
            <div className="p-6 flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-tealSoft text-brand-tealDark border border-brand-teal/20">
                  {game.category}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  game.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700' :
                  game.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {game.difficulty}
                </span>
              </div>

              <h3 className="text-base font-bold text-brand-navy">{game.title}</h3>
              <p className="text-xs text-brand-textSecondary leading-relaxed">{game.shortDescription}</p>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[11px] text-brand-textPrimary">
                  <strong className="text-brand-teal">{t('gameObjective')}:</strong> {game.learningObjective}
                </p>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-brand-textSecondary">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {game.estimatedMinutes} min</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {game.badgeRewardPoints} pts</span>
              </div>
            </div>

            <div className="px-6 pb-6 pt-3 border-t border-brand-border flex items-center justify-between">
              <span className="text-xs font-bold text-brand-amber flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {game.badgeName}
              </span>
              <button
                onClick={() => startGame(game)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight transition-all"
              >
                {t('launchGame')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
