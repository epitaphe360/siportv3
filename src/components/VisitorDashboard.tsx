import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import { useAppointmentStore } from '../store/appointmentStore';

const LEVELS: Record<string, any> = {
  free: { label: 'Free Pass', color: '#6c757d', icon: '🟢', access: ['Accès limité', 'Networking'] },
  basic: { label: 'Basic Pass', color: '#007bff', icon: '🔵', access: ['Accès 1 jour', '2 RDV garantis'] },
  premium: { label: 'Premium Pass', color: '#17a2b8', icon: '🟣', access: ['Accès 2 jours', '5 RDV garantis'] },
  vip: { label: 'VIP Pass', color: '#ffd700', icon: '👑', access: ['Accès All Inclusive', 'Service concierge'] }
};

const cardStyle = {
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  borderRadius: 18,
  background: '#fff',
  padding: '24px',
  margin: '24px auto',
  maxWidth: 720,
  border: '1px solid #eaeaea'
} as const;

export default function VisitorDashboard(): JSX.Element {
  const { user } = useAuthStore();
  const { appointments, fetchAppointments } = useAppointmentStore();
  const [loading, setLoading] = useState(true);
  const [visitor, setVisitor] = useState<any>(null);

  useEffect(() => {
    // basic visitor data population (kept minimal)
    if (!user) {
      setVisitor(null);
      setLoading(false);
      return;
    }
    // assume user contains name/email already
    setVisitor(user);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 48 }}>Chargement...</div>;
  if (!visitor) return <div style={{ textAlign: 'center', marginTop: 48 }}>Visiteur non trouvé. Veuillez vous connecter.</div>;

  const level = visitor.visitor_level || 'free';
  const levelInfo = LEVELS[level] || LEVELS.free;

  const confirmedCount = (appointments || []).filter((a: any) => a.visitorId === visitor.id && a.status === 'confirmed').length;
  const quotas: Record<string, number> = { free: 0, basic: 2, premium: 5, vip: 99 };
  const remaining = Math.max(0, (quotas[level] || 0) - confirmedCount);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '72vh', background: '#f8fafc' }}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 36 }}>{levelInfo.icon}</div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{levelInfo.label}</div>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Bienvenue, {visitor.name || visitor.email}</h2>

        <div style={{ display: 'flex', gap: 12, marginTop: 12, marginBottom: 12 }}>
          <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: 10, fontWeight: 700 }}>{confirmedCount} RDV confirmés</div>
          <div style={{ background: '#eef2ff', padding: '8px 12px', borderRadius: 10, color: '#4f46e5', fontWeight: 700 }}>{remaining} RDV restants</div>
        </div>

        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Avantages</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {levelInfo.access.map((it: string, idx: number) => (
              <li key={idx} style={{ marginBottom: 6 }}>✔️ {it}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
