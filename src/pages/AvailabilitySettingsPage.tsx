import { Card } from '@/components/ui/Card';
import { useTranslation } from '../hooks/useTranslation';
import { Badge } from '@/components/ui/Badge';
import useAuthStore from '@/store/authStore';
import AvailabilityManager from '@/components/availability/AvailabilityManager';
import { toast } from 'sonner';

export default function AvailabilitySettingsPage() {
  const { t } = useTranslation();
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

  const handleAvailabilityUpdate = (timeSlots: TimeSlot[]) => {
    // In a real app, this would save to the backend
    toast.success(`${timeSlots.length} créneau${timeSlots.length !== 1 ? 'x' : ''} mis à jour`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/5 to-pink-400/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent mb-3">
                Gestion Calendaire Avancée
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                Votre système complet de gestion des rendez-vous : définissez vos disponibilités publiques et suivez tous vos rendez-vous personnels
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
                {user.type === 'partner' ? '🤝 Partenaire' : '🏢 Exposant'}
              </Badge>
              <Badge className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-lg">
                {user.profile.company}
              </Badge>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="p-8 mb-10 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
              <span className="text-3xl">ℹ️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-transparent bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text mb-4">
                Pourquoi définir vos disponibilités ?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-sm text-blue-800 font-medium">Permettre aux visiteurs de réserver des rendez-vous personnalisés</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-indigo-600 font-bold">✓</span>
                  <span className="text-sm text-indigo-800 font-medium">Améliorer votre visibilité dans les recommandations IA</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span className="text-sm text-purple-800 font-medium">Optimiser votre temps sur le salon SIPORTS 2026</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-pink-600 font-bold">✓</span>
                  <span className="text-sm text-pink-800 font-medium">Créer des opportunités de networking ciblées</span>
                </div>
              </div>
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
        <Card className="p-8 mt-10 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-2 border-green-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-2xl shadow-lg">
              <span className="text-3xl">💡</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-transparent bg-gradient-to-r from-emerald-900 to-green-900 bg-clip-text mb-4">
                Conseils pour optimiser vos disponibilités
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start space-x-2">
                  <span className="text-emerald-600 text-lg">⏰</span>
                  <span className="text-sm text-emerald-800 font-medium">Définissez des créneaux pendant les heures d'ouverture du salon (9h-18h)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 text-lg">☕</span>
                  <span className="text-sm text-green-800 font-medium">Prévoyez des pauses entre vos rendez-vous pour les déplacements</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-teal-600 text-lg">📍</span>
                  <span className="text-sm text-teal-800 font-medium">Indiquez clairement le lieu de rencontre (stand, salle de réunion, etc.)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-cyan-600 text-lg">🔄</span>
                  <span className="text-sm text-cyan-800 font-medium">Mettez à jour vos disponibilités en temps réel si nécessaire</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 text-lg">🌐</span>
                  <span className="text-sm text-blue-800 font-medium">Proposez différents types de rencontre (présentiel, virtuel, hybride)</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}



