
import useAuthStore from '../../store/authStore';
import AdminDashboard from './AdminDashboard';
import ExhibitorDashboard from './ExhibitorDashboard';
import PartnerDashboard from './PartnerDashboard';
import VisitorDashboard from '../visitor/VisitorDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Vérification de l'authentification
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Accès non autorisé
          </h3>
          <p className="text-gray-600">
            Veuillez vous connecter pour accéder à votre tableau de bord
          </p>
        </div>
      </div>
    );
  }

  // Debug: Afficher le type d'utilisateur pour vérification (dev uniquement)
  if (import.meta.env.DEV) {
    console.log('User type:', user.type, 'Email:', user.email);
  }

  // Redirection vers le tableau de bord spécifique selon le type d'utilisateur
  switch (user.type) {
    case 'admin':
      return <AdminDashboard />;
    case 'exhibitor':
      return <ExhibitorDashboard />;
    case 'partner':
      return <PartnerDashboard />;
    case 'visitor':
      return <VisitorDashboard />;
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Type d'utilisateur non reconnu: {user.type}
            </h3>
            <p className="text-gray-600">
              Email: {user.email} - Contactez le support pour résoudre ce problème
            </p>
          </div>
        </div>
      );
  }
};