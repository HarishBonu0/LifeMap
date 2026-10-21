import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { ChatMessage } from '../types';
import { chatService } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import { StorageAdapter } from '../lib/storage';
import { calculateInsuranceNeeds, formatIndianCurrency } from '../lib/calculator';

export const FloatingChatButton: React.FC = () => {
  const { language } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const defaultWelcomeMessage: ChatMessage = {
    id: 'welcome',
    sender: 'assistant',
    content: language === 'te'
      ? 'నమస్కారం! నేను మీ లైఫ్‌మ్యాప్ AI ఫైనాన్షియల్ గైడ్‌ని. మీ రక్షణ అంచనాలు, కవరేజ్ గ్యాప్ లేదా పాలసీల గురించి నన్ను అడగవచ్చు.'
      : language === 'hi'
      ? 'नमस्ते! मैं आपका लाइफमैप AI वित्तीय गाइड हूँ। आप अपनी बीमा सुरक्षा गणना या कवरेज गैप के बारे में मुझसे पूछ सकते हैं।'
      : 'Hello! I am your LifeMap AI Financial Guide. I can explain your protection calculations, coverage gap, and term insurance concepts.',
    language: language,
    timestamp: new Date().toISOString(),
    suggestedPrompts: [
      'Explain my coverage gap',
      'Difference between term and endowment',
      'Why is employer cover not enough?'
    ]
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultWelcomeMessage]);

  const currentUser = StorageAdapter.getUserProfile();
  const userInputs = StorageAdapter.getAssessmentInputs();
  const calculationResult = calculateInsuranceNeeds(userInputs);

  // Load message history on user change or modal open
  useEffect(() => {
    if (isOpen) {
      chatService.getMessages(user?.id || null).then((hist) => {
        if (hist && hist.length > 0) {
          setMessages(hist);
        } else {
          setMessages([defaultWelcomeMessage]);
        }
      });
    }
  }, [isOpen, user]);

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

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { reply, messages: updatedList } = await chatService.sendMessage({
        userId: user?.id || null,
        conversationId,
        message: query,
        language,
        context: {
          inputs: userInputs,
          calculation: {
            totalProtectionNeed: calculationResult.totalProtectionNeed,
            coverageGap: calculationResult.coverageGap,
            existingTotalCoverage: calculationResult.existingTotalCoverage
          }
        }
      });

      if (updatedList && updatedList.length > 0) {
        setMessages(updatedList);
      } else {
        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          content: reply,
          language: language,
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (e) {
      console.error('Chat send error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Visually Subtle Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white text-brand-navy border border-brand-border shadow-card hover:bg-slate-50 hover:shadow-float transition-all"
          aria-label="Open AI Financial Guide"
        >
          <Bot className="w-4 h-4 text-brand-teal" />
          <span className="text-xs font-semibold">AI Guide</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] h-[500px] max-h-[85vh] bg-white rounded-2xl shadow-float border border-brand-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="bg-brand-navy text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-brand-tealLight" />
              <div>
                <h3 className="text-xs font-bold leading-tight">AI Financial Guide</h3>
                <p className="text-[10px] text-slate-300">
                  {user ? 'Cloud History Active' : 'English • తెలుగు • हिंदी'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context Line */}
          <div className="bg-slate-50 px-3.5 py-1.5 border-b border-brand-border flex items-center justify-between text-[11px] text-brand-textSecondary">
            <span className="truncate">Profile: <strong className="text-brand-navy font-semibold">{currentUser.name}</strong></span>
            <span>Gap: <strong className="text-red-600">{formatIndianCurrency(calculationResult.coverageGap, true)}</strong></span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-brand-navy text-white'
                      : 'bg-white text-brand-navy border border-brand-border shadow-subtle whitespace-pre-line'
                  }`}
                >
                  {m.content}
                </div>

                {/* Suggested Prompts */}
                {m.suggestedPrompts && (
                  <div className="mt-2 flex flex-wrap gap-1 max-w-[95%]">
                    {m.suggestedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 text-brand-navy font-medium border border-brand-border text-left transition-colors"
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
                <Bot className="w-3.5 h-3.5 text-brand-teal animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-white border-t border-brand-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your protection..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-brand-border focus:outline-none focus:ring-1 focus:ring-brand-teal bg-slate-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-brand-navy text-white hover:bg-brand-navyLight disabled:opacity-40 transition-colors"
                aria-label="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
