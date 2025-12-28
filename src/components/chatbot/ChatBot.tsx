import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Calendar,
  Building2,
  Users,
  Globe,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  Target,
  Heart
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'suggestion' | 'action';
  quickReplies?: string[];
  suggestions?: Array<{
    title: string;
    description: string;
    action: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialiser la conversation
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Messages d'accueil selon le type d'utilisateur
      const getWelcomeMessage = () => {
        if (!isAuthenticated) {
          return {
            content: "👋 Bonjour ! Je suis l'Assistant SIPORTS, votre guide intelligent pour le salon. Connectez-vous pour accéder à toutes mes fonctionnalités personnalisées !",
            quickReplies: ["Se connecter", "Découvrir SIPORTS", "Voir les exposants", "Programme des événements"]
          };
        }

        const userType = user?.type;
        const firstName = user?.profile?.firstName || 'cher utilisateur';

        switch (userType) {
          case 'admin':
            return {
              content: `👑 Bonjour ${firstName} ! En tant qu'administrateur, je peux vous aider avec la gestion de la plateforme, les métriques et la supervision des comptes.`,
              quickReplies: ["Métriques du salon", "Comptes en attente", "Modération contenu", "Statistiques système"]
            };
          case 'exhibitor':
            return {
              content: `🏢 Bonjour ${firstName} ! Je peux vous aider à optimiser votre présence au salon, gérer vos rendez-vous et améliorer votre mini-site.`,
              quickReplies: ["Optimiser mon stand", "Gérer mes RDV", "Modifier mon mini-site", "Voir mes statistiques"]
            };
          case 'partner':
            return {
              content: `🤝 Bonjour ${firstName} ! En tant que partenaire, je peux vous accompagner dans la gestion de votre partenariat et l'optimisation de votre ROI.`,
              quickReplies: ["ROI de mon partenariat", "Événements sponsorisés", "Networking VIP", "Métriques d'impact"]
            };
          case 'visitor':
            return {
              content: `👥 Bonjour ${firstName} ! Je vais vous aider à planifier votre visite, trouver les bons exposants et optimiser votre agenda SIPORTS.`,
              quickReplies: ["Planifier ma visite", "Recommandations exposants", "Mes rendez-vous", "Programme personnalisé"]
            };
          default:
            return {
              content: `👋 Bonjour ${firstName} ! Comment puis-je vous aider aujourd'hui avec SIPORTS 2026 ?`,
              quickReplies: ["Aide navigation", "Informations salon", "Support technique", "Contact organisateurs"]
            };
        }
      };

      const welcomeMsg = getWelcomeMessage();
      const initialMessage: ChatMessage = {
        id: '1',
        content: welcomeMsg.content,
        isBot: true,
        timestamp: new Date(),
        type: 'quick_reply',
        quickReplies: welcomeMsg.quickReplies
      };
      setMessages([initialMessage]);
    }
  }, [isOpen, isAuthenticated, user, messages.length]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Réponses automatiques du bot
  const getBotResponse = (userMessage: string): ChatMessage => {
    const message = userMessage.toLowerCase();
    const timestamp = new Date();
    const userType = user?.type || 'visitor';
    const firstName = user?.profile?.firstName || 'cher utilisateur';

    // Réponses selon l'authentification
    if (!isAuthenticated) {
      if (message.includes('connecter') || message.includes('connexion')) {
        return {
          id: Date.now().toString(),
          content: "🔐 Pour vous connecter, cliquez sur le bouton 'Connexion' en haut à droite de la page. Vous pouvez utiliser votre email ou vous connecter avec Google pour accéder à toutes les fonctionnalités SIPORTS !",
          isBot: true,
          timestamp,
          type: 'suggestion',
          suggestions: [
            {
              title: "Page de connexion",
              description: "Accéder à la page de connexion",
              action: "/login",
              icon: User
            }
          ]
        };
      }

      if (message.includes('exposant') || message.includes('entreprise')) {
        return {
          id: Date.now().toString(),
          content: "🏢 SIPORTS 2026 accueille 330+ exposants internationaux ! Découvrez les leaders de l'industrie portuaire. Connectez-vous pour accéder au réseautage intelligent et aux RDV B2B.",
          isBot: true,
          timestamp,
          type: 'suggestion',
          suggestions: [
            {
              title: "Voir les exposants",
              description: "Découvrir tous les exposants",
              action: "/exhibitors",
              icon: Building2
            },
            {
              title: "S'inscrire",
              description: "Créer un compte gratuit",
              action: "/register",
              icon: User
            }
          ]
        };
      }

      if (message.includes('salon') || message.includes('siports') || message.includes('information')) {
        return {
          id: Date.now().toString(),
          content: "🚢 SIPORTS 2026 - Le plus grand salon portuaire international ! 📅 1-3 Avril 2026 à El Jadida, Maroc. 330+ exposants, 6000+ visiteurs de 40 pays, 40+ conférences !",
          isBot: true,
          timestamp,
          type: 'quick_reply',
          quickReplies: ["Voir le programme", "Liste des exposants", "S'inscrire", "Informations pratiques"]
        };
      }

      if (message.includes('programme') || message.includes('événement')) {
        return {
          id: Date.now().toString(),
          content: "📅 Le programme SIPORTS comprend 40+ événements : conférences plénières, ateliers techniques, sessions de networking, webinaires. Connectez-vous pour personnaliser votre agenda !",
          isBot: true,
          timestamp,
          type: 'suggestion',
          suggestions: [
            {
              title: "Programme complet",
              description: "Voir tous les événements",
              action: "/events",
              icon: Calendar
            }
          ]
        };
      }

      return {
        id: Date.now().toString(),
        content: "👋 Bonjour ! Je suis l'Assistant SIPORTS, votre guide intelligent pour le salon. Connectez-vous pour accéder à toutes mes fonctionnalités personnalisées !",
        isBot: true,
        timestamp,
        type: 'quick_reply',
        quickReplies: ["Se connecter", "Informations salon", "Voir les exposants", "Programme événements"]
      };
    }

    // Réponses pour utilisateurs connectés

    // Réponses communes
    if (message.includes('salon') || message.includes('siports') || message.includes('information')) {
      return {
        id: Date.now().toString(),
        content: `🚢 Bonjour ${firstName} ! SIPORTS 2026 se déroule du 1er au 3 avril 2026 à El Jadida, Maroc. C'est le plus grand salon portuaire international avec 330+ exposants, 6000+ visiteurs de 40 pays !`,
        isBot: true,
        timestamp,
        type: 'suggestion',
        suggestions: [
          {
            title: "Programme complet",
            description: "Voir tous les événements",
            action: "/events",
            icon: Calendar
          },
          {
            title: "Plan du salon",
            description: "Navigation interactive",
            action: "/pavilions",
            icon: Globe
          }
        ]
      };
    }

    if (message.includes('rendez-vous') || message.includes('rdv') || message.includes('appointment')) {
      const rdvText = userType === 'visitor' 
        ? "vous pouvez programmer des RDV B2B garantis avec les exposants"
        : "En tant qu'exposant, vous pouvez créer des créneaux pour recevoir des visiteurs";

      return {
        id: Date.now().toString(),
        content: `📅 ${firstName}, ${rdvText}. Je peux vous aider à optimiser votre planning !`,
        isBot: true,
        timestamp,
        type: 'suggestion',
        suggestions: [
          {
            title: userType === 'visitor' ? "Demander un RDV" : "Créer un créneau",
            description: userType === 'visitor' ? "Avec un exposant" : "Pour recevoir des visiteurs",
            action: "/appointments",
            icon: Calendar
          },
          {
            title: "Mes rendez-vous",
            description: "Voir mon planning",
            action: "/appointments",
            icon: Calendar
          }
        ]
      };
    }

    if (message.includes('réseautage') || message.includes('networking') || message.includes('contact')) {
      return {
        id: Date.now().toString(),
        content: `🤝 ${firstName}, le réseautage SIPORTS utilise l'IA pour vous recommander les meilleurs contacts ! ${userType === 'visitor' ? 'Découvrez les exposants qui correspondent à vos objectifs.' : 'Connectez-vous avec des visiteurs qualifiés.'}`,
        isBot: true,
        timestamp,
        type: 'suggestion',
        suggestions: [
          {
            title: "Réseautage IA",
            description: "Recommandations personnalisées",
            action: "/networking",
            icon: Users
          },
          {
            title: "Messages",
            description: "Voir mes conversations",
            action: "/messages",
            icon: MessageCircle
          }
        ]
      };
    }

    if (message.includes('aide') || message.includes('help') || message.includes('support')) {
      return {
        id: Date.now().toString(),
        content: `🆘 ${firstName}, je suis là pour vous aider ! En tant que ${userType === 'admin' ? 'administrateur' : userType === 'exhibitor' ? 'exposant' : userType === 'partner' ? 'partenaire' : 'visiteur'}, voici ce que je peux faire pour vous :`,
        isBot: true,
        timestamp,
        type: 'quick_reply',
        quickReplies: ["Navigation du site", "Gestion du profil", "Système de RDV", "Réseautage IA", "Support technique"]
      };
    }
    // Réponses spécifiques par type d'utilisateur
    switch (userType) {
      case 'admin':
        if (message.includes('métrique') || message.includes('statistique') || message.includes('performance')) {
          return {
            id: Date.now().toString(),
            content: `📊 ${firstName}, voici les métriques clés : 330 exposants actifs, 6300 visiteurs inscrits, 1247 utilisateurs en ligne. Voulez-vous voir le tableau de bord complet ?`,
            isBot: true,
            timestamp,
            type: 'suggestion',
            suggestions: [
              {
                title: "Métriques complètes",
                description: "Tableau de bord admin",
                action: "/metrics",
                icon: TrendingUp
              },
              {
                title: "Validation comptes",
                description: "12 comptes en attente",
                action: "/admin/validation",
                icon: CheckCircle
              }
            ]
          };
        }
        
        if (message.includes('validation') || message.includes('compte') || message.includes('modération')) {
          return {
            id: Date.now().toString(),
            content: `👑 ${firstName}, vous avez 12 comptes exposants en attente de validation et 8 contenus à modérer. Voulez-vous traiter ces demandes ?`,
            isBot: true,
            timestamp,
            type: 'suggestion',
            suggestions: [
              {
                title: "Validation comptes",
                description: "12 exposants en attente",
                action: "/admin/validation",
                icon: CheckCircle
              },
              {
                title: "Modération contenu",
                description: "8 contenus à examiner",
                action: "/admin/moderation",
                icon: FileText
              }
            ]
          };
        }
        break;

      case 'exhibitor':
        if (message.includes('stand') || message.includes('mini-site') || message.includes('optimiser')) {
          return {
            id: Date.now().toString(),
            content: `🎨 ${firstName}, votre mini-site a eu 2,156 vues ! Je peux vous aider à l'optimiser pour attirer plus de visiteurs et générer plus de leads.`,
            isBot: true,
            timestamp,
            type: 'suggestion',
            suggestions: [
              {
                title: "Modifier mon mini-site",
                description: "Éditeur de contenu",
                action: "/minisite/editor",
                icon: Building2
              },
              {
                title: "Mes statistiques",
                description: "Performance de mon stand",
                action: "/dashboard",
                icon: TrendingUp
              }
            ]
          };
        }
        
        if (message.includes('statistique') || message.includes('performance') || message.includes('vue')) {
          return {
            id: Date.now().toString(),
            content: `📈 ${firstName}, votre stand performe bien ! 2,156 vues de mini-site, 89 téléchargements de catalogue, 47 leads générés. Voulez-vous voir le détail ?`,
            isBot: true,
            timestamp,
            type: 'suggestion',
            suggestions: [
              {
                title: "Tableau de bord",
                description: "Voir toutes mes stats",
                action: "/dashboard",
                icon: TrendingUp
              },
              {
                title: "Mes rendez-vous",
                description: "Gérer mon planning",
                action: "/appointments",
                icon: Calendar
              }
            ]
          };
        }
        break;

      case 'partner':
        if (message.includes('partenariat') || message.includes('roi') || message.includes('impact')) {
          return {
            id: Date.now().toString(),
            content: `🤝 ${firstName}, votre partenariat génère un excellent ROI de 285% ! 3,247 vues, 450 connexions VIP, 12 événements sponsorisés. Impressionnant !`,
            isBot: true,
            timestamp,
            type: 'suggestion',
            suggestions: [
              {
                title: "ROI détaillé",
                description: "Voir l'impact complet",
                action: "/dashboard",
                icon: TrendingUp
              },
              {
                title: "Networking VIP",
                description: "Accès privilégié",
                action: "/networking",
                icon: Users
              }
            ]
          };
        }
        break;

      case 'visitor':
        if (message.includes('visite') || message.includes('planifier') || message.includes('programme')) {
          return {
            id: Date.now().toString(),
            content: `🗓️ ${firstName}, je peux vous aider à planifier votre visite ! Vous avez accès à de nombreux avantages personnalisés.`,
            isBot: true,
            timestamp,
            type: 'suggestion',
            suggestions: [
              {
                title: "Mon agenda",
                description: "Voir mes événements",
                action: "/visitor/dashboard",
                icon: Calendar
              },
              {
                title: "Exposants recommandés",
                description: "Basé sur vos intérêts",
                action: "/exhibitors",
                icon: Target
              }
            ]
          };
        }
        
        if (message.includes('exposant') || message.includes('recommandation') || message.includes('contact')) {
          return {
            id: Date.now().toString(),
            content: `🎯 ${firstName}, j'ai analysé votre profil et trouvé 12 exposants parfaitement compatibles avec vos objectifs ! Voulez-vous voir mes recommandations ?`,
            isBot: true,
            timestamp,
            type: 'suggestion',
            suggestions: [
              {
                title: "Recommandations IA",
                description: "Exposants pour vous",
                action: "/networking",
                icon: Target
              },
              {
                title: "Mes favoris",
                description: "Exposants sauvegardés",
                action: "/visitor/dashboard",
                icon: Heart
              }
            ]
          };
        }
        break;
    }

    // Réponses par défaut selon le type d'utilisateur
    const getDefaultResponse = () => {
      switch (userType) {
        case 'admin':
          return {
            content: `👑 ${firstName}, en tant qu'administrateur, je peux vous aider avec la gestion de la plateforme, les métriques et la supervision des comptes.`,
            suggestions: [
              { title: "Métriques système", description: "Performance globale", action: "/metrics", icon: TrendingUp },
              { title: "Validation comptes", description: "12 en attente", action: "/admin/validation", icon: CheckCircle },
              { title: "Gestion utilisateurs", description: "6847 utilisateurs", action: "/admin/users", icon: Users }
            ]
          };
        case 'exhibitor':
          return {
            content: `🏢 ${firstName}, je peux vous aider à optimiser votre présence au salon, gérer vos rendez-vous et améliorer votre mini-site.`,
            suggestions: [
              { title: "Mon mini-site", description: "2,156 vues", action: "/minisite/editor", icon: Building2 },
              { title: "Mes RDV", description: "Gérer mon planning", action: "/appointments", icon: Calendar },
              { title: "Mes statistiques", description: "Performance stand", action: "/dashboard", icon: TrendingUp }
            ]
          };
        case 'partner':
          return {
            content: `🤝 ${firstName}, en tant que partenaire, je peux vous accompagner dans la gestion de votre partenariat et l'optimisation de votre ROI.`,
            suggestions: [
              { title: "ROI partenariat", description: "285% de retour", action: "/dashboard", icon: TrendingUp },
              { title: "Événements sponsorisés", description: "12 événements", action: "/events", icon: Calendar },
              { title: "Networking VIP", description: "Accès privilégié", action: "/networking", icon: Users }
            ]
          };
        case 'visitor':
          return {
            content: `👥 ${firstName}, je vais vous aider à planifier votre visite, trouver les bons exposants et optimiser votre agenda SIPORTS.`,
            suggestions: [
              { title: "Planifier ma visite", description: "Agenda personnalisé", action: "/visitor/dashboard", icon: Calendar },
              { title: "Recommandations", description: "Exposants pour vous", action: "/networking", icon: Target },
              { title: "Mes rendez-vous", description: "RDV programmés", action: "/appointments", icon: Calendar }
            ]
          };
        default:
          return {
            content: `👋 ${firstName}, comment puis-je vous aider aujourd'hui avec SIPORTS 2026 ?`,
            suggestions: [
              { title: "Informations salon", description: "Dates, lieu, programme", action: "/", icon: Globe },
              { title: "Voir les exposants", description: "330+ entreprises", action: "/exhibitors", icon: Building2 },
              { title: "Programme événements", description: "40+ conférences", action: "/events", icon: Calendar }
            ]
          };
      }
    };

    const defaultResponse = getDefaultResponse();

    return {
      id: Date.now().toString(),
      content: defaultResponse.content,
      isBot: true,
      timestamp,
      type: 'suggestion',
      suggestions: defaultResponse.suggestions
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simuler le temps de réponse du bot
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickReply = (reply: string) => {
    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: reply,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Générer la réponse du bot
    setTimeout(() => {
      const botResponse = getBotResponse(reply);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800);
  };

  const handleSuggestionClick = (action: string) => {
    if (action.startsWith('/')) {
      // Vérifier l'authentification pour les pages protégées
      if (action === '/appointments' && !isAuthenticated) {
        // Rediriger vers la page de connexion avec retour vers les RDV
        navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.APPOINTMENTS)}`);
        return;
      }

      // Navigation interne
      navigate(action);
    } else {
      // Action personnalisée
      const actionMessages = {
        'info_salon': `ℹ️ SIPORTS 2026 - Salon International des Ports\n📅 1-3 Avril 2026\n📍 El Jadida, Maroc\n🏢 330+ exposants\n👥 6000+ visiteurs\n🌍 40 pays`,
        'support': `📞 SUPPORT SIPORTS\n📧 Email: support@siportevent.com\n📱 Tél: +212 1 23 45 67 89\n🕒 Lun-Ven: 9h-18h\n💬 Chat en direct disponible`,
        'contact_commercial': `💼 ÉQUIPE COMMERCIALE\n📧 commercial@siportevent.com\n📱 +212 1 23 45 67 90\n🤝 Partenariats & Sponsoring\n📋 Devis personnalisés`
      };
      
      const message = actionMessages[action as keyof typeof actionMessages] || `🚀 Action: ${action}`;
      toast(message as string);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className={`fixed bottom-4 right-4 z-50 ${
        isMinimized ? 'w-80 h-16' : 'w-80 h-96'
      } transition-all duration-300`}
    >
      <Card className="h-full flex flex-col shadow-2xl border-blue-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Assistant SIPORTS</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs opacity-90">En ligne • IA</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button aria-label="Close"
                onClick={onToggle}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-xs ${
                      message.isBot 
                        ? 'bg-white border border-gray-200' 
                        : 'bg-blue-600 text-white'
                    } rounded-lg p-3 shadow-sm`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.isBot ? 'text-gray-500' : 'text-blue-100'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>

                      {/* Quick Replies */}
                      {message.quickReplies && (
                        <div className="mt-3 space-y-1">
                          {message.quickReplies.map((reply) => (
                            <button
                              key={reply}
                              onClick={() => handleQuickReply(reply)}
                              className="block w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs transition-colors"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Suggestions */}
                      {message.suggestions && (
                        <div className="mt-3 space-y-2">
                          {message.suggestions.map((suggestion) => (
                            <button
                              key={suggestion.title}
                              onClick={() => handleSuggestionClick(suggestion.action)}
                              className="flex items-center space-x-2 w-full p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs transition-colors"
                            >
                              <suggestion.icon className="h-4 w-4" />
                              <div className="text-left">
                                <div className="font-medium">{suggestion.title}</div>
                                <div className="text-blue-600">{suggestion.description}</div>
                              </div>
                              <ArrowRight className="h-3 w-3 ml-auto" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-gray-500 ml-2">Assistant écrit...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Tapez votre question..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                
                <Button 
                  variant="default"
                  onClick={handleSendMessage} 
                  disabled={!inputMessage.trim() || isTyping}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Suggestions rapides */}
              <div className="mt-2 flex flex-wrap gap-1">
                {[
                  "Aide navigation",
                  "Mes statistiques", 
                  "Contact support",
                  "Infos pratiques"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleQuickReply(suggestion)}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
};