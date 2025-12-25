import React from 'react';
import VisitorDashboard from '../components/VisitorDashboard';
import useAuthStore from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';

export default function VisitorDashboardPage() {
  const { user } = useAuthStore(); // user.id doit Ãªtre l'ID du visiteur connectÃ©
  const { t } = useTranslation();

  if (!user) {
    return <div>Veuillez vous connecter pour accÃ©der Ã  votre tableau de bord visiteur.</div>;
  }

  return (
    <div style={{maxWidth:800,margin:'auto',padding:32}}>
      <VisitorDashboard userId={user.id} />
    </div>
  );
}


