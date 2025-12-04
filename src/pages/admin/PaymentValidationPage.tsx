import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';

interface PaymentRequest {
  id: string;
  user_id: string;
  requested_level: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transfer_reference: string | null;
  transfer_date: string | null;
  transfer_proof_url: string | null;
  validated_by: string | null;
  validated_at: string | null;
  validation_notes: string | null;
  created_at: string;
  users: {
    name: string;
    email: string;
  };
}

export default function PaymentValidationPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [filter]);

  async function loadRequests() {
    setLoading(true);
    try {
      let query = supabase
        .from('payment_requests')
        .select(`
          *,
          users:user_id (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data as PaymentRequest[]);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(requestId: string) {
    const notes = prompt('Notes de validation (optionnel):');
    if (notes === null) return; // User cancelled

    setProcessing(requestId);
    try {
      const { error } = await supabase.rpc('approve_payment_request', {
        request_id: requestId,
        admin_id: user?.id,
        notes: notes || null
      });

      if (error) throw error;

      alert('✅ Paiement approuvé avec succès !');
      loadRequests();
    } catch (error: any) {
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(requestId: string) {
    const notes = prompt('Raison du rejet (obligatoire):');
    if (!notes) return;

    setProcessing(requestId);
    try {
      const { error } = await supabase.rpc('reject_payment_request', {
        request_id: requestId,
        admin_id: user?.id,
        notes: notes
      });

      if (error) throw error;

      alert('✅ Paiement rejeté.');
      loadRequests();
    } catch (error: any) {
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>💳 Validation des Paiements</h1>
        <div style={{ background: '#ffc107', color: '#000', padding: '8px 16px', borderRadius: 20, fontWeight: 'bold' }}>
          {pendingCount} en attente
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              border: filter === status ? '2px solid #007bff' : '1px solid #ccc',
              background: filter === status ? '#007bff' : '#fff',
              color: filter === status ? '#fff' : '#000',
              cursor: 'pointer',
              fontWeight: filter === status ? 'bold' : 'normal'
            }}
          >
            {status === 'all' && 'Tous'}
            {status === 'pending' && '⏳ En attente'}
            {status === 'approved' && '✅ Approuvés'}
            {status === 'rejected' && '❌ Rejetés'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>Chargement...</div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#666' }}>
          Aucune demande à afficher
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {requests.map(request => (
            <div
              key={request.id}
              style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 24
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, marginBottom: 8 }}>
                    {request.users.name || 'Utilisateur'}
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                    {request.users.email}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#28a745' }}>
                    {request.amount} {request.currency}
                  </div>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    {new Date(request.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <strong>Niveau demandé:</strong> {request.requested_level === 'premium' ? 'Premium VIP' : request.requested_level}
                </div>
                <div>
                  <strong>Méthode:</strong> Virement bancaire
                </div>
                <div>
                  <strong>Statut:</strong>{' '}
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 'bold',
                    background:
                      request.status === 'pending' ? '#ffc107' :
                      request.status === 'approved' ? '#28a745' :
                      request.status === 'rejected' ? '#dc3545' : '#6c757d',
                    color: '#fff'
                  }}>
                    {request.status === 'pending' && '⏳ En attente'}
                    {request.status === 'approved' && '✅ Approuvé'}
                    {request.status === 'rejected' && '❌ Rejeté'}
                    {request.status === 'cancelled' && '🚫 Annulé'}
                  </span>
                </div>
                {request.transfer_reference && (
                  <div>
                    <strong>Référence virement:</strong> {request.transfer_reference}
                  </div>
                )}
              </div>

              {request.transfer_proof_url && (
                <div style={{ marginBottom: 16, padding: 12, background: '#f8f9fa', borderRadius: 4 }}>
                  <strong>Justificatif:</strong>{' '}
                  <a href={request.transfer_proof_url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                    Voir le document
                  </a>
                </div>
              )}

              {request.validation_notes && (
                <div style={{ marginBottom: 16, padding: 12, background: '#fff3cd', borderRadius: 4 }}>
                  <strong>Notes:</strong> {request.validation_notes}
                </div>
              )}

              {request.validated_at && (
                <div style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
                  Validé le {new Date(request.validated_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}

              {request.status === 'pending' && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processing === request.id}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 16,
                      fontWeight: 'bold',
                      cursor: processing === request.id ? 'not-allowed' : 'pointer',
                      opacity: processing === request.id ? 0.6 : 1
                    }}
                  >
                    ✅ Approuver
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={processing === request.id}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 16,
                      fontWeight: 'bold',
                      cursor: processing === request.id ? 'not-allowed' : 'pointer',
                      opacity: processing === request.id ? 0.6 : 1
                    }}
                  >
                    ❌ Rejeter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
