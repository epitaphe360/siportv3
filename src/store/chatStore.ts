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

const mockConversations: ChatConversation[] = [
  {
    id: '1',
    participants: ['user1', 'user2'],
    lastMessage: {
      id: '1',
      senderId: 'user2',
      receiverId: 'user1',
      content: 'Bonjour, je suis intéressé par vos solutions portuaires.',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    },
    unreadCount: 1,
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 3600000)
  },
  {
    id: '2',
    participants: ['user1', 'siports-bot'],
    lastMessage: {
      id: '2',
      senderId: 'siports-bot',
      receiverId: 'user1',
      content: 'Comment puis-je vous aider aujourd\'hui ?',
      type: 'text',
      timestamp: new Date(Date.now() - 7200000),
      read: true
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 7200000)
  }
];

const mockMessages: Record<string, ChatMessage[]> = {
  '1': [
    {
      id: '1',
      senderId: 'user2',
      receiverId: 'user1',
      content: 'Bonjour, je suis intéressé par vos solutions portuaires.',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    },
    {
      id: '2',
      senderId: 'user1',
      receiverId: 'user2',
      content: 'Bonjour ! Je serais ravi de vous présenter nos solutions. Souhaitez-vous planifier un rendez-vous ?',
      type: 'text',
      timestamp: new Date(Date.now() - 3000000),
      read: true
    }
  ],
  '2': [
    {
      id: '3',
      senderId: 'siports-bot',
      receiverId: 'user1',
      content: 'Bonjour ! Je suis l\'assistant SIPORTS. Comment puis-je vous aider aujourd\'hui ?',
      type: 'text',
      timestamp: new Date(Date.now() - 7200000),
      read: true
    },
    {
      id: '4',
      senderId: 'user1',
      receiverId: 'siports-bot',
      content: 'Je cherche des exposants spécialisés dans les grues portuaires.',
      type: 'text',
      timestamp: new Date(Date.now() - 7000000),
      read: true
    },
    {
      id: '5',
      senderId: 'siports-bot',
      receiverId: 'user1',
      content: 'Parfait ! J\'ai trouvé 3 exposants spécialisés dans les équipements de manutention portuaire. Souhaitez-vous que je vous les présente ?',
      type: 'text',
      timestamp: new Date(Date.now() - 6900000),
      read: true
    }
  ]
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ 
        conversations: mockConversations,
        messages: mockMessages,
        isLoading: false 
      });
    } catch {
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