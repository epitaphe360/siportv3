import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-3xl font-bold mb-2">401 - Accès non autorisé</h1>
      <p className="text-gray-600 mb-6">Veuillez vous connecter pour accéder à cette page.</p>
      <Link to={ROUTES.LOGIN} className="text-blue-600 hover:underline">Aller à la page de connexion</Link>
    </div>
  );
}
