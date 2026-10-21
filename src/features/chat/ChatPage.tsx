import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Bot, 
  User, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n';
import { ChatConversation, ChatMessage } from '../../types';
import { chatService } from '../../services/chatService';
import { calculateInsuranceNeeds, formatIndianCurrency, sanitizeFinancialInputs } from '../../lib/calculator';
import { DEMO_PROFILES } from '../../data/demoProfiles';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useTranslation();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user context (assessment and protection gap) to provide to chatbot
  const userContext = React.useMemo(() => {
    let inputs = DEMO_PROFILES[0].inputs;
    const stored = sessionStorage.getItem('lifemap_assessment');
    if (stored) {
      try {
        inputs = sanitizeFinancialInputs(JSON.parse(stored));
      } catch {}
    }
    const result = calculateInsuranceNeeds(inputs);
    return {
      monthlyIncome: inputs.monthlyIncome,
      monthlyExpenses: inputs.monthlyExpenses,
      dependantsCount: inputs.dependantsCount,
      totalProtectionNeed: result.totalProtectionNeed,
      existingCoverage: result.existingTotalCoverage,
      coverageGap: result.coverageGap,
      outstandingHomeLoan: inputs.outstandingHomeLoan
    };
  }, []);

  // 1. Load Conversations
  useEffect(() => {
    chatService.getUserConversations(user?.id || null).then((convList) => {
      setConversations(convList);
      if (convList.length > 0) {
        setActiveConvId(convList[0].id);
      }
    });
  }, [user]);

  // 2. Load Messages for Active Conversation
  useEffect(() => {
    if (!activeConvId) {
      setLoadingMessages(false);
      return;
    }
    setLoadingMessages(true);
    chatService.getMessages(user?.id || null, activeConvId).then((msgList) => {
      setMessages(msgList);
      setLoadingMessages(false);
    });
  }, [activeConvId, user]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleCreateNewConversation = async () => {
    if (!user) return;
    const newConv = await chatService.createNewConversation(user.id, `Chat #${conversations.length + 1}`, language);
    setConversations([newConv, ...conversations]);
    setActiveConvId(newConv.id);
  };

  const handleRename = async (convId: string) => {
    if (!user || !editingTitle.trim()) return;
    const success = await chatService.renameConversation(convId, user.id, editingTitle.trim());
    if (success) {
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: editingTitle.trim() } : c));
    }
    setEditingConvId(null);
  };

  const handleDelete = async (convId: string) => {
    if (!user) return;
    const success = await chatService.deleteConversation(convId, user.id);
    if (success) {
      const remaining = conversations.filter(c => c.id !== convId);
      setConversations(remaining);
      if (activeConvId === convId) {
        setActiveConvId(remaining[0]?.id || null);
      }
    }
    setDeleteConfirmId(null);
  };

  const handleSendMessage = async (msgToSend?: string) => {
    const text = (msgToSend || inputMessage).trim();
    if (!text || loading) return;

    setInputMessage('');
    setLoading(true);

    try {
      const { reply, messages: updated } = await chatService.sendMessage({
        userId: user?.id || null,
        conversationId: activeConvId,
        message: text,
        language,
        context: userContext
      });

      setMessages(updated);
    } catch (err) {
      console.error('Chat error', err);
    } finally {
      setLoading(false);
    }
  };

  const starterSuggestions = [
    'Why should I not rely solely on my employer group cover?',
    'What is the difference between Pure Term and Traditional Endowment plans?',
    'How much life insurance cover do I need for my home loan?',
    'How does 6% annual inflation impact my dependants\' future expenses?'
  ];

  return (
    <div className="max-w-6xl mx-auto py-2">
      <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden flex flex-col md:flex-row h-[750px]">
        {/* Left Conversations Sidebar */}
        <div className="w-full md:w-72 border-r border-brand-border bg-slate-50/60 flex flex-col justify-between flex-shrink-0">
          <div className="p-4 border-b border-brand-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-brand-teal" /> AI Conversations
              </span>
              <button
                onClick={handleCreateNewConversation}
                className="p-1.5 rounded-lg bg-brand-navy hover:bg-brand-navyLight text-white transition-colors"
                title="New Conversation"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-brand-textSecondary">
              Persisted and scoped strictly to your account.
            </p>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              const isEditing = conv.id === editingConvId;

              return (
                <div
                  key={conv.id}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-brand-navy text-white font-semibold shadow-subtle'
                      : 'hover:bg-slate-200/60 text-brand-navy'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1 w-full">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs text-brand-navy rounded border border-brand-border bg-white"
                        autoFocus
                      />
                      <button onClick={() => handleRename(conv.id)} className="p-1 text-emerald-600 hover:text-emerald-700">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditingConvId(null)} className="p-1 text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setActiveConvId(conv.id)}
                        className="flex-1 text-left truncate flex items-center gap-2 pr-2"
                      >
                        <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-brand-teal' : 'text-slate-400'}`} />
                        <span className="truncate">{conv.title}</span>
                      </button>

                      {/* Rename and Delete Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingConvId(conv.id);
                            setEditingTitle(conv.title);
                          }}
                          className={`p-1 rounded hover:bg-black/10 ${isActive ? 'text-slate-200' : 'text-slate-500'}`}
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(conv.id)}
                          className="p-1 rounded hover:bg-rose-500/20 text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Context Badge */}
          <div className="p-3 border-t border-brand-border bg-white text-[11px] text-brand-textSecondary space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Context Active</span>
            <div className="flex justify-between">
              <span>Protection Need:</span>
              <strong className="text-brand-navy">{formatIndianCurrency(userContext.totalProtectionNeed, true)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Coverage Gap:</span>
              <strong className="text-red-600">{formatIndianCurrency(userContext.coverageGap, true)}</strong>
            </div>
          </div>
        </div>

        {/* Right Main Chat Area */}
        <div className="flex-1 flex flex-col justify-between bg-white">
          {/* Header Bar with Disclaimer */}
          <div className="p-3.5 border-b border-brand-border flex items-center justify-between bg-slate-50/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-brand-teal shadow-inner">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
                  LifeMap AI Financial Assistant
                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-teal-50 text-brand-teal">
                    Educational
                  </span>
                </h2>
                <p className="text-[10px] text-brand-textSecondary">
                  Provides explainable actuarial principles and IRDAI product guidance.
                </p>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full text-xs text-brand-textSecondary gap-2">
                <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
                <span>Restoring conversation history...</span>
              </div>
            ) : messages.length === 0 ? (
              /* Empty State with Starters */
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-brand-teal flex items-center justify-center shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-brand-navy">How can LifeMap assist you today?</h3>
                  <p className="text-xs text-brand-textSecondary">
                    Ask questions about your protection gap, term vs endowment plans, riders, or compounding calculations.
                  </p>
                </div>

                <div className="w-full space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Topics:</span>
                  {starterSuggestions.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt)}
                      className="w-full text-left p-2.5 rounded-xl border border-brand-border bg-slate-50 hover:bg-slate-100 text-xs text-brand-navy transition-colors flex items-center justify-between"
                    >
                      <span className="line-clamp-1">{prompt}</span>
                      <ArrowRight className="w-3 h-3 text-brand-teal flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                      isUser ? 'bg-brand-navy text-white' : 'bg-teal-50 text-brand-teal border border-teal-200'
                    }`}>
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-brand-navy text-white rounded-tr-none'
                        : 'bg-slate-50 border border-slate-200 text-brand-navy rounded-tl-none space-y-1'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <span className={`text-[9px] block ${isUser ? 'text-slate-300' : 'text-slate-400'} pt-1`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-teal-50 text-brand-teal border border-teal-200 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-brand-textSecondary flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing calculations & formulating guidance...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Input Box */}
          <div className="p-3.5 border-t border-brand-border bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about your protection gap, insurance schemes, or 20-year simulator..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="p-2.5 rounded-xl bg-brand-navy hover:bg-brand-navyLight disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-center text-brand-textSecondary mt-1.5">
              Educational assistant. Not a substitute for a licensed insurance agent or SEBI registered financial advisor.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-brand-border p-6 max-w-sm w-full space-y-4 shadow-float animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-brand-navy">Delete Conversation?</h3>
            <p className="text-xs text-brand-textSecondary">
              Are you sure you want to delete this chat history? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-navy bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
