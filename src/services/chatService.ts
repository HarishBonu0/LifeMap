import { supabase } from '../lib/supabase';
import { ChatMessage, ChatConversation, Language } from '../types';
import { StorageAdapter } from '../lib/storage';

export const chatService = {
  // Get all conversations for a user
  async getUserConversations(userId: string | null): Promise<ChatConversation[]> {
    if (!userId) {
      return [{
        id: 'demo-conversation',
        userId: 'demo-guest',
        title: 'Financial Protection Guidance',
        language: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }];
    }

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        // Create initial conversation if none exists
        const initConv = await this.createNewConversation(userId, 'Financial Protection Guidance');
        return [initConv];
      }

      return data.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        title: c.title,
        language: c.language || 'en',
        createdAt: c.created_at,
        updatedAt: c.updated_at
      }));
    } catch {
      return [];
    }
  },

  // Create a new conversation
  async createNewConversation(
    userId: string, 
    title: string = 'New Conversation', 
    language: Language = 'en'
  ): Promise<ChatConversation> {
    const { data } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        title,
        language
      });

    const created = Array.isArray(data) ? data[0] : data;
    return {
      id: created?.id || 'conv_' + Date.now(),
      userId,
      title,
      language,
      createdAt: created?.created_at || new Date().toISOString(),
      updatedAt: created?.updated_at || new Date().toISOString()
    };
  },

  // Rename conversation
  async renameConversation(conversationId: string, userId: string, newTitle: string): Promise<boolean> {
    const { error } = await supabase
      .from('chat_conversations')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .update({ title: newTitle, updated_at: new Date().toISOString() });
    return !error;
  },

  // Delete conversation and messages
  async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    await supabase
      .from('chat_messages')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .delete();

    const { error } = await supabase
      .from('chat_conversations')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .delete();
    return !error;
  },

  // Get or create latest conversation for user
  async getOrCreateConversation(userId: string, language: Language = 'en'): Promise<string> {
    const convs = await this.getUserConversations(userId);
    if (convs.length > 0) {
      return convs[0].id;
    }
    const created = await this.createNewConversation(userId, 'Financial Protection Guidance', language);
    return created.id;
  },

  // Load messages for user and conversation
  async getMessages(userId: string | null, conversationId?: string | null): Promise<ChatMessage[]> {
    if (!userId) {
      return StorageAdapter.getChatHistory();
    }

    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return [];
      }

      return data.map((msg: any) => ({
        id: msg.id,
        sender: msg.sender as 'user' | 'assistant' | 'system',
        content: msg.content,
        language: 'en' as Language,
        timestamp: msg.created_at
      }));
    } catch {
      return [];
    }
  },

  // Send message through server-side /api/chat and persist to chat_messages
  async sendMessage(params: {
    userId: string | null;
    conversationId?: string | null;
    message: string;
    language: Language;
    context?: any;
  }): Promise<{ reply: string; messages: ChatMessage[] }> {
    const { userId, message, language, context } = params;

    let convId = params.conversationId;
    if (userId && !convId) {
      convId = await this.getOrCreateConversation(userId, language);
    }

    // 1. Record user message
    if (userId && convId) {
      await supabase.from('chat_messages').insert({
        conversation_id: convId,
        user_id: userId,
        sender: 'user',
        content: message
      });
    }

    // 2. Call server-side /api/chat endpoint (LLM key is kept server-side)
    let reply = '';
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          language,
          context
        })
      });

      if (response.ok) {
        const json = await response.json();
        reply = json.reply;
      }
    } catch {
      // Fallback
      reply = language === 'te'
        ? 'లైఫ్‌మ్యాప్: మీ రక్షణ లోటును పూడ్చడానికి తక్కువ ప్రీమియంతో కూడిన ప్యూర్ టర్మ్ ప్లాన్ తీసుకోవడం ఉత్తమం.'
        : language === 'hi'
        ? 'लाइफमैप: अपनी वित्तीय सुरक्षा के लिए शुद्ध टर्म इंश्योरेंस सबसे सुरक्षित और किफायती विकल्प है।'
        : 'Pure term insurance is the most cost-effective way to secure your family against income interruption, keeping protection separate from investments.';
    }

    // 3. Record assistant message
    if (userId && convId) {
      await supabase.from('chat_messages').insert({
        conversation_id: convId,
        user_id: userId,
        sender: 'assistant',
        content: reply
      });
    }

    // 4. Return updated message list
    const updatedMessages = await this.getMessages(userId, convId);
    if (!userId) {
      const userMsg: ChatMessage = {
        id: 'u_' + Date.now(),
        sender: 'user',
        content: message,
        language,
        timestamp: new Date().toISOString()
      };
      const assistantMsg: ChatMessage = {
        id: 'a_' + Date.now(),
        sender: 'assistant',
        content: reply,
        language,
        timestamp: new Date().toISOString()
      };
      const list = [...StorageAdapter.getChatHistory(), userMsg, assistantMsg];
      StorageAdapter.saveChatHistory(list);
      return { reply, messages: list };
    }

    return { reply, messages: updatedMessages };
  }
};
