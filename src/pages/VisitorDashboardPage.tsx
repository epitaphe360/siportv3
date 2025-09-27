import React from 'react';
import VisitorDashboard from '../components/VisitorDashboard';
import { useAuth } from '../lib/useAuth'; // Remplacer par votre hook d'authentification réel

export default function VisitorDashboardPage() {
  const { user } = useAuth(); // user.id doit être l'ID du visiteur connecté

  if (!user) {
    return <div>Veuillez vous connecter pour accéder à votre tableau de bord visiteur.</div>;
  }

  return (
    <div style={{maxWidth:800,margin:'auto',padding:32}}>
      <VisitorDashboard userId={user.id} />
    </div>
  );
}
