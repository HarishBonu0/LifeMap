import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Maximize2, 
  Globe, 
  Info,
  ShieldCheck,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { ChatMessage, Language } from '../types';
import { aiChatService } from '../services/aiChat';
import { StorageAdapter } from '../lib/storage';
import { calculateInsuranceNeeds, formatIndianCurrency } from '../lib/calculator';

export const FloatingChatButton: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = StorageAdapter.getChatHistory();
    if (saved && saved.length > 0) return saved;
    return [
      {
        id: 'welcome',
        sender: 'assistant',
        content: language === 'te'
          ? 'నమస్కారం! నేను మీ లైఫ్‌మ్యాప్ AI ఫైనాన్షియల్ గైడ్‌ని. మీ బీమా రక్షణ అంచనాలు, కవరేజ్ గ్యాప్ లేదా పాలసీల గురించి నన్ను ఏ భాషలోనైనా అడగవచ్చు.'
          : language === 'hi'
          ? 'नमस्ते! मैं आपका लाइफमैप AI वित्तीय गाइड हूँ। आप अपनी बीमा सुरक्षा गणना, कवरेज गैप या टर्म इंश्योरेंस के बारे में मुझसे कुछ भी पूछ सकते हैं।'
          : 'Hello! I am your LifeMap AI Financial Guide. I can explain your protection calculations, coverage gap, or difference between term and endowment policies.',
        language: language,
        timestamp: new Date().toISOString(),
        suggestedPrompts: [
          'Explain my coverage gap',
          'Difference between term and endowment',
          'Why is employer cover not enough?',
          'తెలుగులో వివరించండి (Explain in Telugu)'
        ]
      }
    ];
  });

  const currentUser = StorageAdapter.getUserProfile();
  const userInputs = StorageAdapter.getAssessmentInputs();
  const calculationResult = calculateInsuranceNeeds(userInputs);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: query,
      language: language,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const reply = await aiChatService.sendMessage({
        message: query,
        language,
        userInputs,
        calculationResult
      });

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        content: reply,
        language: language,
        timestamp: new Date().toISOString()
      };

      const finalHistory = [...newHistory, assistantMsg];
      setMessages(finalHistory);
      StorageAdapter.saveChatHistory(finalHistory);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-navy to-brand-teal text-white shadow-float hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-brand-tealLight/30"
          aria-label="Open AI Financial Guide"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-brand-tealLight animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-emerald rounded-full ring-2 ring-brand-navy" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-tight flex items-center gap-1">
              LifeMap AI Guide
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-teal/40 text-brand-tealSoft font-semibold">
                Multilingual
              </span>
            </span>
            <span className="text-[10px] text-slate-300">Ask in English, Telugu, Hindi</span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[550px] max-h-[85vh] bg-white rounded-2xl shadow-float border border-brand-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-navy via-brand-navy to-brand-teal text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-brand-tealLight" />
              </div>
              <div>
                <h3 className="text-xs font-bold flex items-center gap-1.5">
                  LifeMap AI Financial Guide
                  <span className="w-2 h-2 rounded-full bg-brand-emerald" />
                </h3>
                <p className="text-[10px] text-slate-300">Contextual & Multilingual Guidance</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                to="/chat"
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Expand to Full Page"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Micro-banner */}
          <div className="bg-slate-50 px-3 py-1.5 border-b border-brand-border flex items-center justify-between text-[11px] text-brand-textSecondary">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-brand-teal" />
              <span className="font-medium text-brand-navy">{currentUser.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Gap: <strong className="text-brand-coral">{formatIndianCurrency(calculationResult.coverageGap, true)}</strong></span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-brand-navy text-white rounded-tr-none'
                      : 'bg-white text-brand-textPrimary border border-brand-border shadow-subtle rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {m.content}
                </div>

                {/* Suggested Prompts on Initial Welcome */}
                {m.suggestedPrompts && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[95%]">
                    {m.suggestedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-brand-tealSoft hover:bg-teal-100 text-brand-tealDark font-medium transition-colors border border-brand-teal/20 text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-brand-textSecondary">
                <div className="w-6 h-6 rounded-full bg-brand-tealSoft flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-brand-teal animate-spin" />
                </div>
                <span>Analyzing your financial scenario...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-brand-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chatPlaceholder')}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal bg-slate-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-brand-teal text-white hover:bg-brand-tealDark disabled:opacity-50 transition-colors"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-slate-400 mt-1.5 text-center">
              Educational advice only • Powered by LifeMap Deterministic Knowledge
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
