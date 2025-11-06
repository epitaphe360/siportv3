import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';

export default function ForbiddenPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-3xl font-bold mb-2">403 - Accès interdit</h1>
      <p className="text-gray-600 mb-6">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      <Link aria-label="Retour au tableau de bord" to={ROUTES.DASHBOARD} className="text-blue-600 hover:underline">Retour au tableau de bord</Link>
    </div>
  );
}
