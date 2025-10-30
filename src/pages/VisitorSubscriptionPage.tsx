import React from 'react';
import VisitorSubscription from '../pages/VisitorSubscription';
import useAuthStore from '../store/authStore';

export default function VisitorSubscriptionPage() {
  const { user } = useAuthStore(); // user.id doit être l'ID du visiteur connecté

  if (!user) {
    return <div>Veuillez vous connecter pour souscrire à un pass visiteur.</div>;
  }

  // On peut passer l'ID visiteur à VisitorSubscription si besoin
  return (
    <div style={{maxWidth:800,margin:'auto',padding:32}}>
      <VisitorSubscription userId={user.id} />
    </div>
  );
}
