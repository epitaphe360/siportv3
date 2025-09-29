import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical, 
  Search,
  Star,
  Archive,
  Trash2,
  Flag,
  User,
  Circle,
  Check,
  CheckCheck,
  Clock,
  Shield,
  Crown,
  Filter,
  Plus,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import useAuthStore from '../../store/authStore';
import { useNetworkingStore } from '../../store/networkingStore';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'file' | 'image' | 'system';
  reactions?: { emoji: string; userId: string; userName: string }[];
  isEncrypted?: boolean;
  attachments?: { 
    name: string; 
    url: string; 
    size: string; 
    type: string; 
  }[];
}

interface ChatConversation {
  id: string;
  participants: { id: string; name: string; avatar?: string; type: string; online: boolean }[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
}

// Mock data with enhanced features
const mockConversations: ChatConversation[] = [
  {
    id: '1',
    participants: [
      { id: 'user1', name: 'Marie Dubois', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b851?w=150', type: 'exhibitor', online: true },
      { id: 'user2', name: 'Ahmed Ben Ali', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', type: 'partner', online: false },
    ],
    lastMessage: {
      id: '1',
      senderId: 'user2',
      receiverId: 'user1',
      content: 'Parfait ! Je vous envoie les détails techniques par email. Au plaisir de collaborer avec vous sur ce projet innovant.',
      timestamp: new Date(Date.now() - 300000),
      read: false,
      type: 'text',
      reactions: [{ emoji: '👍', userId: 'user1', userName: 'Marie Dubois' }],
    },
    unreadCount: 2,
    isPinned: true,
    isArchived: false,
    priority: 'high',
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    participants: [
      { id: 'user1', name: 'Sophie Martin', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', type: 'visitor', online: true },
      { id: 'user3', name: 'Karim Bensalem', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', type: 'exhibitor', online: true },
    ],
    lastMessage: {
      id: '2',
      senderId: 'user3',
      receiverId: 'user1',
      content: 'Nous pourrions organiser une démonstration de nos solutions IA pour la gestion portuaire.',
      timestamp: new Date(Date.now() - 1800000),
      read: true,
      type: 'text',
      isEncrypted: true,
    },
    unreadCount: 0,
    isPinned: false,
    isArchived: false,
    priority: 'normal',
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 1800000),
  },
];

const mockMessages: Record<string, ChatMessage[]> = {
  '1': [
    {
      id: '1',
      senderId: 'user2',
      receiverId: 'user1',
      content: 'Bonjour Marie, j\'ai vu votre présentation sur l\'automatisation portuaire. Très impressionnant !',
      timestamp: new Date(Date.now() - 3600000),
      read: true,
      type: 'text',
    },
    {
      id: '2',
      senderId: 'user1',
      receiverId: 'user2',
      content: 'Merci Ahmed ! J\'ai également consulté votre profil. Vos solutions de logistique intelligente pourraient parfaitement compléter nos systèmes.',
      timestamp: new Date(Date.now() - 3300000),
      read: true,
      type: 'text',
      reactions: [{ emoji: '🤝', userId: 'user2', userName: 'Ahmed Ben Ali' }],
    },
    {
      id: '3',
      senderId: 'user2',
      receiverId: 'user1',
      content: 'Exactement ! Nous cherchons justement des partenaires technologiques pour notre expansion au Maghreb.',
      timestamp: new Date(Date.now() - 3000000),
      read: true,
      type: 'text',
    },
    {
      id: '4',
      senderId: 'user1',
      receiverId: 'user2',
      content: 'Parfait ! Pourriez-vous me partager votre présentation technique ? Voici notre deck commercial.',
      timestamp: new Date(Date.now() - 2700000),
      read: true,
      type: 'text',
      attachments: [
        { name: 'Presentation_AutoPort_2026.pdf', url: '#', size: '2.4 MB', type: 'pdf' },
      ],
    },
    {
      id: '5',
      senderId: 'user2',
      receiverId: 'user1',
      content: 'Parfait ! Je vous envoie les détails techniques par email. Au plaisir de collaborer avec vous sur ce projet innovant.',
      timestamp: new Date(Date.now() - 300000),
      read: false,
      type: 'text',
      reactions: [{ emoji: '👍', userId: 'user1', userName: 'Marie Dubois' }],
    },
  ],
};

export const EnhancedChatInterface: React.FC = () => {
  const { user } = useAuthStore();
  const { permissions } = useNetworkingStore();
  const [conversations, setConversations] = useState<ChatConversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<string>('1');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(mockMessages);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'pinned' | 'archived'>('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversation]);

  // Check permissions
  if (!permissions?.canSendMessages) {
    return (
      <Card className="p-8 text-center">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat Non Disponible</h3>
        <p className="text-gray-600 mb-4">
          Votre forfait actuel ne permet pas d'utiliser le chat direct.
        </p>
        <Button variant="default">
          Mettre à Niveau Mon Forfait
        </Button>
      </Card>
    );
  }

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversation || !user) return;

    // Check daily limits
    const remaining = useNetworkingStore.getState().getRemainingQuota();
    if (remaining.messages === 0) {
      toast.error('Limite quotidienne de messages atteinte. Revenez demain !');
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: 'other-user', // Would be dynamic in real app
      content: messageInput,
      timestamp: new Date(),
      read: false,
      type: 'text',
    };

    setMessages(prev => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] || []), newMessage],
    }));

    // Update conversation
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation 
        ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
        : conv
    ));

    setMessageInput('');
    
    // Simulate typing indicator
    setIsTyping(prev => ({ ...prev, [activeConversation]: true }));
    setTimeout(() => {
      setIsTyping(prev => ({ ...prev, [activeConversation]: false }));
    }, 2000);

    toast.success('Message envoyé ! 💬');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!user) return;

    setMessages(prev => ({
      ...prev,
      [activeConversation]: prev[activeConversation]?.map(msg => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || [];
          const existingReaction = reactions.find(r => r.userId === user.id);
          
          if (existingReaction) {
            // Remove reaction if same emoji, otherwise update
            if (existingReaction.emoji === emoji) {
              return { ...msg, reactions: reactions.filter(r => r.userId !== user.id) };
            } else {
              return { 
                ...msg, 
                reactions: reactions.map(r => 
                  r.userId === user.id ? { ...r, emoji } : r
                )
              };
            }
          } else {
            // Add new reaction
            return { 
              ...msg, 
              reactions: [...reactions, { emoji, userId: user.id, userName: user.name }]
            };
          }
        }
        return msg;
      }) || []
    }));
  };

  const togglePin = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, isPinned: !conv.isPinned }
        : conv
    ));
  };

  const archiveConversation = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, isArchived: !conv.isArchived }
        : conv
    ));
    
    if (activeConversation === conversationId) {
      setActiveConversation(conversations.find(c => c.id !== conversationId)?.id || '');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (selectedFilter === 'unread' && conv.unreadCount === 0) return false;
    if (selectedFilter === 'pinned' && !conv.isPinned) return false;
    if (selectedFilter === 'archived' && !conv.isArchived) return false;
    if (selectedFilter === 'all' && conv.isArchived) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return conv.participants.some(p => p.name.toLowerCase().includes(query)) ||
             conv.lastMessage?.content.toLowerCase().includes(query);
    }
    
    return true;
  });

  const activeConv = conversations.find(c => c.id === activeConversation);
  const activeMessages = activeConversation ? messages[activeConversation] || [] : [];

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'normal': return 'text-gray-600';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-600';
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'partner': return <Crown className="h-3 w-3 text-amber-500" />;
      case 'exhibitor': return <Star className="h-3 w-3 text-blue-500" />;
      default: return <User className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="h-[700px] bg-white rounded-lg shadow-lg overflow-hidden flex">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          
          {/* Filters */}
          <div className="flex space-x-1 mt-3">
            {(['all', 'unread', 'pinned', 'archived'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedFilter === filter
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' && 'Tous'}
                {filter === 'unread' && 'Non lus'}
                {filter === 'pinned' && 'Épinglés'}
                {filter === 'archived' && 'Archivés'}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Aucune conversation trouvée</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
              if (!otherParticipant) return null;

              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    activeConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => setActiveConversation(conversation.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src={otherParticipant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.name)}`}
                        alt={otherParticipant.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        otherParticipant.online ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <div className="absolute -top-1 -right-1">
                        {getUserTypeIcon(otherParticipant.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {otherParticipant.name}
                          </h3>
                          {conversation.isPinned && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {conversation.lastMessage?.isEncrypted && (
                            <Shield className="h-3 w-3 text-green-500" />
                          )}
                          <span className={`text-xs ${getPriorityColor(conversation.priority)}`}>
                            {formatTime(conversation.updatedAt)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.lastMessage?.content || 'Aucun message'}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1">
                          {conversation.lastMessage?.reactions?.map((reaction, index) => (
                            <span key={index} className="text-xs">
                              {reaction.emoji}
                            </span>
                          ))}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="bg-blue-600 text-white text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const otherParticipant = activeConv.participants.find(p => p.id !== user?.id);
                    return otherParticipant ? (
                      <>
                        <div className="relative">
                          <img
                            src={otherParticipant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.name)}`}
                            alt={otherParticipant.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            otherParticipant.online ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 flex items-center">
                            {otherParticipant.name}
                            <span className="ml-2">{getUserTypeIcon(otherParticipant.type)}</span>
                          </h3>
                          <p className="text-sm text-gray-500">
                            {otherParticipant.online ? 'En ligne' : 'Hors ligne'}
                            {isTyping[activeConversation] && ' • En train d\'écrire...'}
                          </p>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => togglePin(activeConversation)}>
                    <Star className={`h-4 w-4 ${activeConv.isPinned ? 'text-yellow-500 fill-current' : ''}`} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => archiveConversation(activeConversation)}>
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {activeMessages.map((message) => {
                  const isCurrentUser = message.senderId === user?.id;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                        isCurrentUser 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded">
                                <Paperclip className="h-3 w-3" />
                                <span className="text-xs truncate">{attachment.name}</span>
                                <span className="text-xs opacity-75">({attachment.size})</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-75">
                            {formatTime(message.timestamp)}
                          </span>
                          <div className="flex items-center space-x-1">
                            {message.isEncrypted && (
                              <Shield className="h-3 w-3 opacity-75" />
                            )}
                            {isCurrentUser && (
                              message.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                        
                        {/* Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="absolute -bottom-6 left-0 flex space-x-1">
                            {message.reactions.map((reaction, index) => (
                              <span 
                                key={index}
                                className="bg-white border border-gray-200 rounded-full px-2 py-1 text-xs shadow-sm"
                                title={reaction.userName}
                              >
                                {reaction.emoji}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Quick Reaction */}
                        <div className="absolute top-0 right-0 transform translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            {['👍', '❤️', '😊', '👏'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(message.id, emoji)}
                                className="bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-50 shadow-sm"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {isTyping[activeConversation] && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 px-4 py-2 rounded-lg rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={() => {/* Handle file upload */}}
                  className="hidden"
                  multiple
                />
                
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={1}
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>
                
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="px-4 py-2"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Usage Info */}
              <div className="mt-2 text-xs text-gray-500 text-center">
                Messages restants aujourd'hui : {useNetworkingStore.getState().getRemainingQuota().messages === -1 ? '∞' : useNetworkingStore.getState().getRemainingQuota().messages}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
                <Send className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-600">
                Choisissez une conversation dans la liste pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};