import { useState } from 'react';
import { MapPin, Mail, Phone, Globe, Calendar, Building2, Users, Star } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { User } from '../../types';
import AvailabilityCalendar from '../availability/AvailabilityCalendar';
import { toast } from 'sonner';

interface UserProfileViewProps {
  user: User;
  showBooking?: boolean;
  onClose?: () => void;
  onConnect?: (userId: string) => void;
  onMessage?: (userName: string) => void;
}

export default function UserProfileView({
  user,
  showBooking = false,
  onClose,
  onConnect,
  onMessage
}: UserProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'availability'>('profile');

  const handleConnect = () => {
    onConnect?.(user.id);
    toast.success(`Demande de connexion envoyée à ${user.profile.firstName} ${user.profile.lastName}`);
  };

  const handleMessage = () => {
    onMessage?.(`${user.profile.firstName} ${user.profile.lastName}`);
    toast.success(`Ouverture du chat avec ${user.profile.firstName} ${user.profile.lastName}`);
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'exhibitor': return 'Exposant';
      case 'partner': return 'Partenaire';
      case 'visitor': return 'Visiteur';
      case 'admin': return 'Administrateur';
      default: return type;
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'exhibitor': return 'bg-blue-100 text-blue-800';
      case 'partner': return 'bg-purple-100 text-purple-800';
      case 'visitor': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-4 border-white">
              <AvatarImage src={user.profile.avatar} alt={`${user.profile.firstName} ${user.profile.lastName}`} />
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                {user.profile.firstName[0]}{user.profile.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {user.profile.firstName} {user.profile.lastName}
              </h1>
              <p className="text-blue-100">{user.profile.position}</p>
              <p className="text-blue-100">{user.profile.company}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={`${getUserTypeColor(user.type)} border-white/30`}>
                  {getUserTypeLabel(user.type)}
                </Badge>
                {user.status === 'active' && (
                  <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                    Actif
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleConnect}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Users className="h-4 w-4 mr-2" />
            Se connecter
          </Button>
          <Button
            variant="outline"
            onClick={handleMessage}
          >
            <Mail className="h-4 w-4 mr-2" />
            Message
          </Button>
          {showBooking && (user.type === 'exhibitor' || user.type === 'partner') && (
            <Button
              variant="outline"
              onClick={() => setActiveTab('availability')}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Voir disponibilités
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Profil
          </button>
          {(user.type === 'exhibitor' || user.type === 'partner') && (
            <button
              onClick={() => setActiveTab('availability')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'availability'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Disponibilités
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                {user.profile.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-medium">{user.profile.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Localisation</p>
                    <p className="font-medium">{user.profile.country}</p>
                  </div>
                </div>
                {user.profile.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Site web</p>
                      <a
                        href={user.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {user.profile.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Bio */}
            {user.profile.bio && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">À propos</h3>
                <p className="text-gray-700 leading-relaxed">{user.profile.bio}</p>
              </Card>
            )}

            {/* Interests */}
            {user.profile.interests && user.profile.interests.length > 0 && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Centres d'intérêt</h3>
                <div className="flex flex-wrap gap-2">
                  {user.profile.interests.map((interest, index) => (
                    <Badge key={index} variant="default">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Sectors */}
            {user.profile.sectors && user.profile.sectors.length > 0 && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Secteurs d'activité</h3>
                <div className="flex flex-wrap gap-2">
                  {user.profile.sectors.map((sector, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800">
                      {sector}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Company Info */}
            {user.profile.company && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-gray-600" />
                  Entreprise
                </h3>
                <div className="space-y-2">
                  <p className="font-medium text-lg">{user.profile.company}</p>
                  {user.profile.companyDescription && (
                    <p className="text-gray-700">{user.profile.companyDescription}</p>
                  )}
                  {user.profile.companySize && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Taille: {user.profile.companySize}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Objectives */}
            {user.profile.objectives && user.profile.objectives.length > 0 && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Objectifs à SIPORTS 2026</h3>
                <div className="space-y-2">
                  {user.profile.objectives.map((objective, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'availability' && (user.type === 'exhibitor' || user.type === 'partner') && (
          <AvailabilityCalendar
            user={user}
            showBooking={showBooking}
            onBookSlot={(slot: any) => {
              toast.success(`Créneau réservé: ${slot.startTime} - ${slot.endTime} le ${new Date(slot.date).toLocaleDateString('fr-FR')}`);
            }}
          />
        )}
      </div>
    </div>
  );
}
