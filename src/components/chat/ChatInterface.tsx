import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { 
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  MessageCircle,
  Bot,
  User,
  Circle,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useChatStore } from '../../store/chatStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInterface() {
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    onlineUsers,
    fetchConversations,
    setActiveConversation,
    sendMessage
  } = useChatStore();

  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversation]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;
    
    await sendMessage(activeConversation, messageInput);
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const activeMessages = activeConversation ? messages[activeConversation] || [] : [];
  const activeConv = conversations.find(c => c.id === activeConversation);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bouton de retour */}
        <div className="mb-6">
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au Tableau de Bord
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="flex h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
                <div className="relative">
                  <input type="text"
                    placeholder="Rechercher une conversation..."
                    className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                   aria-label="Rechercher une conversation..." />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conversation) => {
                      const isBot = conversation.participants.includes('siports-bot');
                      const otherParticipant = isBot ? 'Assistant SIPORTS' : 'Sarah Johnson';
                      const isOnline = conversation.participants.some(p => onlineUsers.includes(p));
                      
                      return (
                        <motion.div
                          key={conversation.id}
                          whileHover={{ backgroundColor: '#f9fafb' }}
                          onClick={() => setActiveConversation(conversation.id)}
                          className={`p-4 cursor-pointer border-b border-gray-100 ${
                            activeConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="relative">
                              <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                                {isBot ? (
                                  <Bot className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <User className="h-5 w-5 text-gray-600" />
                                )}
                              </div>
                              {isOnline && (
                                <Circle className="absolute -bottom-1 -right-1 h-3 w-3 text-green-500 fill-current" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {otherParticipant}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="info" size="sm">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              
                              {conversation.lastMessage && (
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-sm text-gray-600 truncate">
                                    {conversation.lastMessage.content}
                                  </p>
                                  <span className="text-xs text-gray-400">
                                    {formatTime(conversation.lastMessage.timestamp)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                          {activeConv?.participants.includes('siports-bot') ? (
                            <Bot className="h-5 w-5 text-blue-600" />
                          ) : (
                            <User className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {activeConv?.participants.includes('siports-bot') ? 'Assistant SIPORTS' : 'Sarah Johnson'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {onlineUsers.includes(activeConv?.participants[1] || '') ? 'En ligne' : 'Hors ligne'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" title="Appel vocal">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Appel vidéo">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Options">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                      {activeMessages.map((message) => {
                        const isBot = message.senderId === 'siports-bot';
                        const isCurrentUser = message.senderId === 'user1';
                        
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isCurrentUser 
                                ? 'bg-blue-600 text-white' 
                                : isBot
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*,application/pdf,.doc,.docx,.txt';
                          input.multiple = true;
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files && files.length > 0) {
                              // Traiter les fichiers sélectionnés
                              Array.from(files).forEach(file => {
                                console.log(`Fichier sélectionné: ${file.name}, Taille: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
                                // Ici vous pouvez ajouter la logique pour uploader les fichiers
                              });
                              
                              // Afficher un message de confirmation
                              const fileNames = Array.from(files).map(f => f.name).join(', ');
                              alert(`📎 ${files.length} fichier(s) sélectionné(s):\n${fileNames}\n\n🚀 Upload en cours...`);
                            }
                          };
                          input.click();
                        }}
                        title="Joindre un fichier"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Tapez votre message..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          const emojis = ['😊', '👍', '❤️', '😂', '🎉', '👏', '🔥', '💯', '🙌', '✨', '💪', '🎯', '🚀', '💡', '⭐'];
                          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                          setMessageInput(prev => prev + randomEmoji);
                        }}
                        title="Ajouter un emoji"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="default" onClick={handleSendMessage} disabled={!messageInput.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p className="text-gray-600">
                      Choisissez une conversation pour commencer à échanger
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};