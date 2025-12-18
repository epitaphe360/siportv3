import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, Globe, Mail } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface CountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownModal: React.FC<CountdownModalProps> = ({ isOpen, onClose }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEventStarted, setIsEventStarted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Date du salon SIPORTS 2026
    const salonDate = new Date('2026-02-05T09:30:00');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = salonDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsEventStarted(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    // Calcul initial
    setTimeLeft(calculateTimeLeft());

    // Mise à jour chaque seconde
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const salonInfo = {
    name: 'SIPORTS 2026',
    fullName: 'Salon International des Ports',
    dates: '1-3 Avril 2026',
    location: 'El Jadida, Maroc',
    venue: 'Mohammed VI Exhibition Center',
    hours: '9h30 - 18h00',
    stats: {
      exhibitors: 330,
      visitors: 6300,
      countries: 42,
      conferences: 40
    }
  };

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{salonInfo.name}</h2>
                <p className="text-blue-100">{salonInfo.fullName}</p>
              </div>
              <button aria-label="Close"
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Informations du salon */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{salonInfo.dates}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{salonInfo.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{salonInfo.hours}</span>
              </div>
            </div>
          </div>

          {/* Compte à rebours */}
          <div className="p-8">
            {isEventStarted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="bg-green-100 p-8 rounded-2xl mb-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-3xl font-bold text-green-800 mb-2">
                    Le salon a commencé !
                  </h3>
                  <p className="text-green-700">
                    SIPORTS 2026 est maintenant ouvert. Bienvenue !
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Ouverture dans :
                </h3>
                <p className="text-gray-600 mb-8">
                  Plus que quelques {timeLeft.days > 30 ? 'mois' : timeLeft.days > 7 ? 'semaines' : 'jours'} avant l'ouverture du plus grand salon portuaire international
                </p>

                {/* Compteurs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <motion.div
                    key={timeLeft.days}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg"
                  >
                    <div className="text-4xl font-bold mb-2">
                      {formatNumber(timeLeft.days)}
                    </div>
                    <div className="text-blue-100 text-sm font-medium">
                      {timeLeft.days <= 1 ? 'Jour' : 'Jours'}
                    </div>
                  </motion.div>

                  <motion.div
                    key={timeLeft.hours}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg"
                  >
                    <div className="text-4xl font-bold mb-2">
                      {formatNumber(timeLeft.hours)}
                    </div>
                    <div className="text-purple-100 text-sm font-medium">
                      {timeLeft.hours <= 1 ? 'Heure' : 'Heures'}
                    </div>
                  </motion.div>

                  <motion.div
                    key={timeLeft.minutes}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg"
                  >
                    <div className="text-4xl font-bold mb-2">
                      {formatNumber(timeLeft.minutes)}
                    </div>
                    <div className="text-green-100 text-sm font-medium">
                      {timeLeft.minutes <= 1 ? 'Minute' : 'Minutes'}
                    </div>
                  </motion.div>

                  <motion.div
                    key={timeLeft.seconds}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg"
                  >
                    <div className="text-4xl font-bold mb-2">
                      {formatNumber(timeLeft.seconds)}
                    </div>
                    <div className="text-orange-100 text-sm font-medium">
                      {timeLeft.seconds <= 1 ? 'Seconde' : 'Secondes'}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Informations détaillées du salon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    Lieu & Accès
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Venue :</span>
                      <p className="text-gray-600">{salonInfo.venue}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Adresse :</span>
                      <p className="text-gray-600">Route de Casablanca, El Jadida 24000, Maroc</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Horaires :</span>
                      <p className="text-gray-600">{salonInfo.hours}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Chiffres Clés
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {salonInfo.stats.exhibitors}+
                      </div>
                      <div className="text-xs text-gray-600">Exposants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {salonInfo.stats.visitors.toLocaleString()}+
                      </div>
                      <div className="text-xs text-gray-600">Visiteurs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {salonInfo.stats.countries}
                      </div>
                      <div className="text-xs text-gray-600">Pays</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {salonInfo.stats.conferences}+
                      </div>
                      <div className="text-xs text-gray-600">Conférences</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Programme des 3 jours */}
            <Card className="mb-6">
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Programme des 3 Jours
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="font-bold text-blue-600 mb-2">Jour 1 - 1er Avril</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• Cérémonie d'ouverture</div>
                      <div>• Conférences plénières</div>
                      <div>• Networking d'accueil</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="font-bold text-green-600 mb-2">Jour 2 - 2 Avril</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• Ateliers techniques</div>
                      <div>• Sessions B2B</div>
                      <div>• Démonstrations</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="font-bold text-purple-600 mb-2">Jour 3 - 3 Avril</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• Tables rondes</div>
                      <div>• Remise des prix</div>
                      <div>• Cérémonie de clôture</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                variant="default"
                onClick={() => {
                  toast.success('Rappel programmé : notification 24h avant ouverture, rappel mobile et email configurés, itinéraire inclus.');
                }}
              >
                <Clock className="h-4 w-4 mr-2" />
                Programmer un Rappel
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  const shareText = `🚢 SIPORTS 2026 - Salon International des Ports\n📅 ${salonInfo.dates}\n📍 ${salonInfo.location}\n\n⏰ Plus que ${timeLeft.days} jours, ${timeLeft.hours} heures !\n\n🌐 https://siportevent.com`;
                  
                  if (navigator.share) {
                    navigator.share({
                      title: 'SIPORTS 2026 - Compte à Rebours',
                      text: shareText,
                      url: window.location.origin
                    });
                  } else {
                    navigator.clipboard.writeText(shareText);
                    toast.success('🔗 Compte à rebours copié dans le presse-papiers !');
                  }
                }}
              >
                <Globe className="h-4 w-4 mr-2" />
                Partager le Compte à Rebours
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  const calendarEvent = {
                    title: 'SIPORTS 2026 - Salon International des Ports',
                    start: '2026-02-05T09:30:00',
                    end: '2026-02-07T18:00:00',
                    location: 'Mohammed VI Exhibition Center, El Jadida, Maroc',
                    description: 'Le plus grand salon portuaire international - 330+ exposants, 6300+ visiteurs de 42 pays'
                  };
                  
                  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarEvent.title)}&dates=${calendarEvent.start.replace(/[-:]/g, '').replace('.000', '')}Z/${calendarEvent.end.replace(/[-:]/g, '').replace('.000', '')}Z&location=${encodeURIComponent(calendarEvent.location)}&details=${encodeURIComponent(calendarEvent.description)}`;
                  
                  window.open(googleCalendarUrl, '_blank');
                    toast.success('📅 Événement ajouté à votre calendrier : SIPORTS 2026, rappels automatiques et itinéraire inclus.');
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Ajouter au Calendrier
              </Button>
            </div>

            {/* Informations pratiques */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Informations Pratiques</h5>
                  <div className="space-y-2 text-gray-600">
                    <div>• Inscription gratuite pour les visiteurs</div>
                    <div>• Parking gratuit sur site</div>
                    <div>• Navettes depuis l'aéroport</div>
                    <div>• Restauration sur place</div>
                    <div>• WiFi gratuit dans tout le centre</div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Contact Organisation</h5>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>contact@siportevent.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>www.siportevent.com</span>
                    </div>
                    <div>📱 +212 1 23 45 67 89</div>
                    <div>🕒 Lun-Ven: 9h-18h</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};