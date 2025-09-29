import { create } from 'zustand';
import { ChatMessage, ChatConversation, ChatBot } from '../types';

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
    // In a real implementation, these would call Supabase
    // const conversations = await SupabaseService.getChatConversations(userId);
    // const messages = await SupabaseService.getChatMessages(conversationIds);
    
    // For now, return empty structures - will be populated by real data
    return {
      conversations: [],
      messages: {}
    };
  } catch (error) {
    console.error('Error loading chat data:', error);
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
      // This would normally fetch from Supabase
      // For now, we'll initialize with empty data - real chat will be implemented with backend
      const chatData = await loadChatData('current-user');
      set({ 
        conversations: chatData.conversations,
        messages: chatData.messages,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ isLoading: false });
    }
  },

  setActiveConversation: (conversationId) => {
    set({ activeConversation: conversationId });
    // Mark messages as read
    get().markAsRead(conversationId);
  },

  sendMessage: async (conversationId, content, type = 'text') => {
    const { messages, conversations } = get();
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'user1', // Current user
      receiverId: conversationId === '2' ? 'siports-bot' : 'user2',
      content,
      type,
      timestamp: new Date(),
      read: false
    };

    // Add message to conversation
    const updatedMessages = {
      ...messages,
      [conversationId]: [...(messages[conversationId] || []), newMessage]
    };

    // Update conversation last message
    const updatedConversations = conversations.map(conv => 
      conv.id === conversationId 
        ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
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