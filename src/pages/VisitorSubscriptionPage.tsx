import React from 'react';
import VisitorSubscription from '../pages/VisitorSubscription';
import useAuthStore from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';

export default function VisitorSubscriptionPage() {
  const { user } = useAuthStore(); // user.id doit Ãªtre l'ID du visiteur connectÃ©
  const { t } = useTranslation();
  // Afficher la page des abonnements mÃªme si l'utilisateur n'est pas connectÃ©.
  // Les boutons invitent Ã  crÃ©er un compte si nÃ©cessaire.
  return (
    <div style={{maxWidth:800,margin:'auto',padding:32}}>
      <VisitorSubscription />
    </div>
  );
}


