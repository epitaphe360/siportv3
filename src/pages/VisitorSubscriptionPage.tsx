import React from 'react';
import VisitorSubscription from '../pages/VisitorSubscription';
import useAuthStore from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';

export default function VisitorSubscriptionPage() {
  const { user } = useAuthStore(); // user.id doit être l'ID du visiteur connecté
  const { t } = useTranslation();
  // Afficher la page des abonnements même si l'utilisateur n'est pas connecté.
  // Les boutons invitent à créer un compte si nécessaire.
  return (
    <div style={{maxWidth:800,margin:'auto',padding:32}}>
      <VisitorSubscription />
    </div>
  );
}
