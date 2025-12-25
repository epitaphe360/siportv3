import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppointmentStore } from '../../store/appointmentStore';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';

export default function TestFlowPage() {
  const { t } = useTranslation();
  const { bookAppointment, fetchAppointments, appointments, confirmAppointmentsForVisitor, clearMockAppointments } = useAppointmentStore();
  const { user, setUser } = useAuthStore();
  const [log, setLog] = useState<Array<{ attempt: number; timeSlotId: string; success: boolean; message: string }>>([]);

  const run = async () => {
    // S'assurer qu'un utilisateur de test est connectÃ©
    if (!user) {
  // Assigner un niveau 'premium' pour permettre plusieurs rÃ©servations pendant le test
  setUser({ id: 'visitor-1', email: 'visiteur@siports.com', name: 'Marie Dubois', type: 'visitor', status: 'active', visitor_level: 'premium', profile: {}, createdAt: new Date(), updatedAt: new Date() } as any);
    }

    // Journal des tentatives
    const entries: Array<{ attempt: number; timeSlotId: string; success: boolean; message: string }> = [];
    try {
      await fetchAppointments();

      const attempts = [
        { id: '1', label: 'Test booking 1' },
        { id: '3', label: 'Test booking 2' },
        { id: '1', label: 'Test booking 3' }
      ];

  for (let i = 0; i < attempts.length; i++) {
        const at = attempts[i];
        try {
          await bookAppointment(at.id, at.label);
          entries.push({ attempt: i + 1, timeSlotId: at.id, success: true, message: 'RÃ©servation crÃ©Ã©e' });
        } catch (err: unknown) {
          entries.push({ attempt: i + 1, timeSlotId: at.id, success: false, message: err?.message || String(err) });
        }
      }
  // Ne pas recharger les rendez-vous mock ici : fetchAppointments() Ã©craserait les rÃ©servations
  // crÃ©Ã©es par `bookAppointment` (mock static). On se contente de mettre Ã  jour le journal.
  setLog(entries);
        // Optionnel : confirmer automatiquement les rendez-vous crÃ©Ã©s par le test (visitor-1)
        try {
          const report = await confirmAppointmentsForVisitor('visitor-1');
          if (report.failed && report.failed.length > 0) {
            entries.push({ attempt: 0, timeSlotId: '', success: false, message: `Confirm failures: ${report.failed.map(f => `${f.id}:${f.error}`).join(', ')}` });
          } else {
            entries.push({ attempt: 0, timeSlotId: '', success: true, message: `Confirm succeeded: ${report.success.length} items` });
          }
        } catch (err: unknown) {
          entries.push({ attempt: 0, timeSlotId: '', success: false, message: 'Erreur confirm: ' + (err?.message || String(err)) });
        }
      toast.success('Flow de test exÃ©cutÃ©. Consulte le journal sur la page.');
    } catch (err: unknown) {
      entries.push({ attempt: 0, timeSlotId: '', success: false, message: 'Erreur initiale: ' + (err?.message || String(err)) });
      setLog(entries);
      toast.error('Erreur lors du flow de test: ' + (err?.message || String(err)));
    }
  };

  return (
    <div style={{padding:24}}>
      <h1>Test flow automatisÃ©</h1>
      <p>Ce test simule la souscription et la prise de RDV pour vÃ©rifier les quotas.</p>
      <button onClick={run} style={{padding:'8px 16px',borderRadius:8,background:'#111827',color:'#fff'}}>Lancer le test</button>
      <div style={{marginTop:24}}>
        <h3>Journal des tentatives:</h3>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <button onClick={() => confirmAppointmentsForVisitor('visitor-1').catch(()=>{})} style={{padding:'6px 12px',borderRadius:6}}>Confirmer tous (visitor-1)</button>
          <button onClick={() => clearMockAppointments().catch(()=>{})} style={{padding:'6px 12px',borderRadius:6,background:'#f87171',color:'#fff'}}>Nettoyer rendez-vous mock</button>
        </div>
        <div style={{background:'#fff',padding:12,borderRadius:8,border:'1px solid #eaeaea'}}>
          {log.length === 0 && <div style={{color:'#666'}}>Aucune tentative enregistrÃ©e. Cliquez sur Â« Lancer le test Â».</div>}
          {log.map((e, idx) => (
            <div key={idx} style={{padding:'8px 6px',borderBottom: idx < log.length - 1 ? '1px dashed #eee' : 'none', display:'flex',justifyContent:'space-between'}}>
              <div>
                <strong>#{e.attempt}</strong> â€” crÃ©neau <em>{e.timeSlotId || '-'}</em>
                <div style={{fontSize:13,color:'#444'}}>{e.message}</div>
              </div>
              <div style={{color: e.success ? 'green' : 'crimson', fontWeight:700, alignSelf:'center'}}>
                {e.success ? 'OK' : 'ERREUR'}
              </div>
            </div>
          ))}
        </div>

        <h3 style={{marginTop:18}}>Rendez-vous (mock):</h3>
        <pre style={{background:'#0f172a',color:'#e6eef8',padding:12,borderRadius:8}}>{JSON.stringify(appointments, null, 2)}</pre>
      </div>
    </div>
  );
}



