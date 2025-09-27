import React, { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import { SupabaseService } from '../../services/supabaseService';

const ExhibitorDashboardWidget: React.FC = () => {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    SupabaseService.getAnalytics(user.id)
      .then(setAnalytics)
      .catch((e) => console.error('getAnalytics failed', e))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div>Connectez-vous pour voir vos statistiques.</div>;
  if (loading) return <div>Chargement...</div>;
  if (!analytics) return <div>Aucune donnée disponible.</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 border rounded">
        <h3 className="text-sm font-medium">Vues du mini-site</h3>
        <div className="text-2xl font-bold">{analytics.miniSiteViews}</div>
      </div>
      <div className="p-4 border rounded">
        <h3 className="text-sm font-medium">Rendez-vous</h3>
        <div className="text-2xl font-bold">{analytics.appointments}</div>
      </div>
      <div className="p-4 border rounded">
        <h3 className="text-sm font-medium">Produits</h3>
        <div className="text-2xl font-bold">{analytics.products}</div>
      </div>
      <div className="p-4 border rounded">
        <h3 className="text-sm font-medium">Vues de profil</h3>
        <div className="text-2xl font-bold">{analytics.profileViews}</div>
      </div>
    </div>
  );
};

export default ExhibitorDashboardWidget;
