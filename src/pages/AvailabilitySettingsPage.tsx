import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import useAuthStore from '@/store/authStore';
import AvailabilityManager from '@/components/availability/AvailabilityManager';
import { toast } from 'sonner';

export default function AvailabilitySettingsPage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Accès non autorisé
          </h3>
          <p className="text-gray-600">
            Veuillez vous connecter pour accéder à cette page
          </p>
        </div>
      </div>
    );
  }

  // Only exhibitors and partners can manage availability
  if (user.type !== 'exhibitor' && user.type !== 'partner') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Accès réservé
          </h3>
          <p className="text-gray-600">
            Cette fonctionnalité est réservée aux exposants et partenaires
          </p>
        </div>
      </div>
    );
  }

  const handleAvailabilityUpdate = (timeSlots: any[]) => {
    // In a real app, this would save to the backend
    toast.success(`${timeSlots.length} créneau${timeSlots.length !== 1 ? 'x' : ''} mis à jour`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Disponibilités
          </h1>
          <p className="text-gray-600 mt-2">
            Définissez vos créneaux horaires pour permettre aux autres participants de prendre rendez-vous avec vous.
          </p>
          <div className="mt-4 flex items-center space-x-2">
            <Badge variant="info">
              {user.type === 'partner' ? 'Partenaire' : 'Exposant'}
            </Badge>
            <Badge variant="success">
              {user.profile.company}
            </Badge>
          </div>
        </div>

        {/* Info Card */}
        <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <span className="text-2xl">ℹ️</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Pourquoi définir vos disponibilités ?
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Permettre aux visiteurs de réserver des rendez-vous personnalisés</li>
                <li>• Améliorer votre visibilité dans les recommandations IA</li>
                <li>• Optimiser votre temps sur le salon SIPORTS 2026</li>
                <li>• Créer des opportunités de networking ciblées</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Availability Manager */}
        <AvailabilityManager
          userId={user.id}
          userType={user.type}
          onAvailabilityUpdate={handleAvailabilityUpdate}
        />

        {/* Tips Card */}
        <Card className="p-6 mt-8 bg-green-50 border-green-200">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-2">
                Conseils pour optimiser vos disponibilités
              </h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Définissez des créneaux pendant les heures d'ouverture du salon (9h-18h)</li>
                <li>• Prévoyez des pauses entre vos rendez-vous pour les déplacements</li>
                <li>• Indiquez clairement le lieu de rencontre (stand, salle de réunion, etc.)</li>
                <li>• Mettez à jour vos disponibilités en temps réel si nécessaire</li>
                <li>• Proposez différents types de rencontre (présentiel, virtuel, hybride)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
