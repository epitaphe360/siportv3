import { create } from 'zustand';
import { ChatMessage, ChatConversation, ChatBot } from '../types';
import { SupabaseService } from '../services/supabaseService';

interface ChatState {
  conversations: ChatConversation[];
  activeConversation: string | null;
  messages: Record<string, ChatMessage[]>;
  isLoading: boolean;
  chatBot: ChatBot;
  onlineUsers: string[];
  
  // Actions
  fetchConversations: () => Promise<void>;
  setActiveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string, type?: 'text' | 'file') => Promise<void>;
  markAsRead: (conversationId: string) => void;
  startConversation: (userId: string) => Promise<string>;
  sendBotMessage: (message: string) => Promise<void>;
  setOnlineUsers: (users: string[]) => void;
}

const mockChatBot: ChatBot = {
  id: 'siports-bot',
  name: 'Assistant SIPORTS',
  avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
  status: 'online',
  capabilities: [
    'Aide à la navigation',
    'Recommandations de contacts',
    'Informations sur les exposants',
    'Planification de rendez-vous',
    'Support technique'
  ]
};

// Chat conversations and messages will be loaded from Supabase
const loadChatData = async (userId: string) => {
  try {
    console.log('📬 Chargement conversations pour utilisateur:', userId);

    // Charger les conversations depuis Supabase
    const conversations = await SupabaseService.getConversations(userId);
    console.log('✅ Conversations chargées:', conversations.length);

    // Charger les messages pour chaque conversation
    const messages: Record<string, ChatMessage[]> = {};
    for (const conversation of conversations) {
      const convMessages = await SupabaseService.getMessages(conversation.id);
      messages[conversation.id] = convMessages;
    }

    return {
      conversations,
      messages
    };
  } catch (error) {
    console.error('❌ Error loading chat data:', error);
    return {
      conversations: [],
      messages: {}
    };
  }
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  isLoading: false,
  chatBot: mockChatBot,
  onlineUsers: ['user2', 'siports-bot'],

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      // Récupérer l'utilisateur actuel (devrait être passé en paramètre dans une vraie app)
      // Pour l'instant, on utilise 'current-user' - à adapter selon votre authStore
      const chatData = await loadChatData('current-user');
      set({
        conversations: chatData.conversations,
        messages: chatData.messages,
        isLoading: false
      });
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      set({ isLoading: false });
    }
  },

  setActiveConversation: (conversationId) => {
    set({ activeConversation: conversationId });
    // Mark messages as read
    get().markAsRead(conversationId);
  },

  sendMessage: async (conversationId, content, type = 'text') => {
    try {
      console.log('📤 Envoi message:', { conversationId, content: content.substring(0, 50) });

      const { messages, conversations } = get();
      const conversation = conversations.find(c => c.id === conversationId);

      if (!conversation) {
        throw new Error('Conversation non trouvée');
      }

      // Identifier l'expéditeur et le destinataire
      const senderId = 'user1'; // TODO: Récupérer depuis authStore
      const receiverId = conversation.participants.find(p => p.id !== senderId)?.id || '';

      // Envoyer via Supabase
      const sentMessage = await SupabaseService.sendMessage(
        conversationId,
        senderId,
        receiverId,
        content,
        type
      );

      if (!sentMessage) {
        throw new Error('Échec envoi message');
      }

      console.log('✅ Message envoyé:', sentMessage.id);

      // Add message to conversation local state
      const updatedMessages = {
        ...messages,
        [conversationId]: [...(messages[conversationId] || []), sentMessage]
      };

      // Update conversation last message
      const updatedConversations = conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, lastMessage: sentMessage, updatedAt: new Date() }
          : conv
      );

      set({
        messages: updatedMessages,
        conversations: updatedConversations
      });

      // Simulate bot response if talking to bot
      if (conversationId === '2') {
        setTimeout(() => {
          get().sendBotMessage('Merci pour votre message. Je traite votre demande...');
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      throw error;
    }
  },

  markAsRead: (conversationId) => {
    const { conversations } = get();
    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId
        ? { ...conv, unreadCount: 0 }
        : conv
    );
    set({ conversations: updatedConversations });
  },

  startConversation: async (userId) => {
    const newConversationId = Date.now().toString();
    const newConversation: ChatConversation = {
      id: newConversationId,
      participants: ['user1', userId],
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { conversations } = get();
    set({ 
      conversations: [newConversation, ...conversations],
      activeConversation: newConversationId
    });

    return newConversationId;
  },

  sendBotMessage: async (message) => {
    const { messages, conversations, activeConversation } = get();
    if (!activeConversation) return;

    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'siports-bot',
      receiverId: 'user1',
      content: message,
      type: 'text',
      timestamp: new Date(),
      read: false
    };

    const updatedMessages = {
      ...messages,
      [activeConversation]: [...(messages[activeConversation] || []), botMessage]
    };

    const updatedConversations = conversations.map(conv => 
      conv.id === activeConversation 
        ? { ...conv, lastMessage: botMessage, updatedAt: new Date(), unreadCount: conv.unreadCount + 1 }
        : conv
    );

    set({ 
      messages: updatedMessages,
      conversations: updatedConversations
    });
  },

  setOnlineUsers: (users) => {
    set({ onlineUsers: users });
  }
}));