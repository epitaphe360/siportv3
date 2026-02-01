import React, { useEffect, memo } from 'react';
import useAuthStore from '../../store/authStore';
import { useDashboardStore } from '../../store/dashboardStore';

// OPTIMIZATION: Memoized ExhibitorDashboardWidget to prevent re-renders
const ExhibitorDashboardWidget: React.FC = memo(() => {
  const { user } = useAuthStore();
  const { dashboard, isLoading, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    // Fetch dashboard if checking user and no dashboard data exists
    if (user && !dashboard) {
      fetchDashboard();
    }
  }, [user, dashboard, fetchDashboard]);

  if (!user) return <div>Connectez-vous pour voir vos statistiques.</div>;
  
  // Show loading state mostly on initial load
  if (isLoading && !dashboard) return <div>Chargement...</div>;
  
  // Safe default stats
  const stats = dashboard?.stats || {
      miniSiteViews: 0,
      appointments: 0,
      products: 0,
      profileViews: 0
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 border rounded">
        <h3 className="text-sm font-medium">Vues du mini-site</h3>
        <div className="text-2xl font-bold">{stats.miniSiteViews || 0}</div>
      </div>
      <div className="p-4 border rounded">
        <h3 className="text-sm font-medium">Rendez-vous</h3>
        <div className="text-2xl font-bold">{stats.appointments || 0}</div>
      </div>
      <div className="p-4 border rounded">
        <h3 className="text-sm font-medium">Produits</h3>
        <div className="text-2xl font-bold">{stats.products || 0}</div>
      </div>
      <div className="p-4 border rounded">
        <h3 className="text-sm font-medium">Vues de profil</h3>
        <div className="text-2xl font-bold">{stats.profileViews || 0}</div>
      </div>
    </div>
  );
});

export default ExhibitorDashboardWidget;
