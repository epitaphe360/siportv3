import React, { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { getVisitorQuota, getVisitorLevelInfo } from '../config/quotas';

// Les niveaux sont maintenant importés depuis ../config/quotas

const cardStyle = {
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  borderRadius: 18,
  background: '#fff',
  padding: '24px',
  margin: '24px auto',
  maxWidth: 720,
  border: '1px solid #eaeaea'
} as const;

export default function VisitorDashboard({ userId }: { userId: string }): JSX.Element {
  const { user } = useAuthStore();
  const { appointments, fetchAppointments } = useAppointmentStore();

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  if (!user) return <div style={{ textAlign: 'center', marginTop: 48 }}>Visiteur non trouvé. Veuillez vous connecter.</div>;

  const level = user.visitor_level || user.profile?.visitor_level || 'free';
  const levelInfo = getVisitorLevelInfo(level);

  const confirmedCount = (appointments || []).filter((a: any) => a.visitorId === user.id && a.status === 'confirmed').length;
  const quota = getVisitorQuota(level);
  const remaining = Math.max(0, quota - confirmedCount);

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
