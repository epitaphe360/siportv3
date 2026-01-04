import React from 'react';
import { MatchmakingDashboard } from '../components/networking/MatchmakingDashboard';

/**
 * Page de réseautage simplifiée utilisant MatchmakingDashboard
 * Architecture propre sans duplication de logique
 * 
 * Cette page remplace l'ancienne version de 1640 lignes avec :
 * - Architecture modulaire
 * - Utilisation correcte du networkingStore
 * - Pas de duplication de logique
 * - Composants réutilisables
 */
export default function NetworkingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MatchmakingDashboard />
    </div>
  );
}


