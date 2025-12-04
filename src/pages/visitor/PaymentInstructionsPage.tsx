import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';

interface BankInfo {
  bank_name: string;
  account_holder: string;
  iban: string;
  bic_swift: string;
  instructions: string;
}

interface PaymentRequest {
  id: string;
  requested_level: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export default function PaymentInstructionsPage() {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('request_id');
  const { user } = useAuthStore();

  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [proofUrl, setProofUrl] = useState('');
  const [reference, setReference] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, [requestId]);

  async function loadData() {
    try {
      // Charger les infos bancaires
      const { data: bank } = await supabase
        .from('bank_transfer_info')
        .select('*')
        .eq('is_active', true)
        .single();

      if (bank) setBankInfo(bank);

      // Charger la demande de paiement
      if (requestId) {
        const { data: request } = await supabase
          .from('payment_requests')
          .select('*')
          .eq('id', requestId)
          .eq('user_id', user?.id)
          .single();

        if (request) setPaymentRequest(request);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement:', error);
      setLoading(false);
    }
  }

  async function handleSubmitProof() {
    if (!requestId || !reference) {
      alert('Veuillez renseigner la référence du virement');
      return;
    }

    setUploading(true);

    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({
          transfer_reference: reference,
          transfer_proof_url: proofUrl || null,
          transfer_date: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      alert('✅ Justificatif enregistré ! Votre paiement sera validé sous 24-48h.');
      loadData();
    } catch (error: any) {
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Chargement...</div>;
  }

  const referenceCode = `SIPORTS-PREMIUM-${user?.id?.slice(0, 8).toUpperCase()}`;

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 32 }}>
      <h1>💳 Instructions de Paiement</h1>
      <p style={{ fontSize: 18, color: '#666' }}>
        Pass Premium VIP - 700€
      </p>

      {paymentRequest?.status === 'pending' && (
        <div style={{ background: '#fff3cd', padding: 16, borderRadius: 8, marginBottom: 24 }}>
          ⏳ <strong>Demande en attente de validation</strong>
        </div>
      )}

      {paymentRequest?.status === 'approved' && (
        <div style={{ background: '#d4edda', padding: 16, borderRadius: 8, marginBottom: 24 }}>
          ✅ <strong>Paiement approuvé ! Vous avez maintenant accès au Pass Premium VIP.</strong>
        </div>
      )}

      {paymentRequest?.status === 'rejected' && (
        <div style={{ background: '#f8d7da', padding: 16, borderRadius: 8, marginBottom: 24 }}>
          ❌ <strong>Paiement refusé</strong>
          {paymentRequest && (
            <p style={{ marginTop: 8, fontSize: 14 }}>
              Raison: {(paymentRequest as any).validation_notes || 'Non spécifiée'}
            </p>
          )}
        </div>
      )}

      <div style={{ background: '#f8f9fa', padding: 24, borderRadius: 8, marginBottom: 24 }}>
        <h2>📋 Informations Bancaires</h2>

        {bankInfo ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <strong>Banque :</strong> {bankInfo.bank_name}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Titulaire du compte :</strong> {bankInfo.account_holder}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>IBAN :</strong> <code style={{ background: '#fff', padding: '4px 8px', borderRadius: 4 }}>{bankInfo.iban}</code>
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>BIC/SWIFT :</strong> <code style={{ background: '#fff', padding: '4px 8px', borderRadius: 4 }}>{bankInfo.bic_swift}</code>
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Montant :</strong> <span style={{ fontSize: 20, fontWeight: 'bold', color: '#28a745' }}>700,00 EUR</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Référence obligatoire :</strong> <code style={{ background: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 16, fontWeight: 'bold' }}>{referenceCode}</code>
            </div>
          </>
        ) : (
          <p>Informations bancaires non disponibles. Veuillez contacter le support.</p>
        )}
      </div>

      <div style={{ background: '#e7f3ff', padding: 24, borderRadius: 8, marginBottom: 24 }}>
        <h3>📝 Instructions</h3>
        <ol>
          <li>Effectuez un virement de <strong>700,00 EUR</strong> sur le compte ci-dessus</li>
          <li><strong>IMPORTANT :</strong> Indiquez la référence <code>{referenceCode}</code> dans le libellé du virement</li>
          <li>Conservez votre preuve de virement (capture d'écran ou PDF de confirmation)</li>
          <li>Renseignez ci-dessous la référence de votre virement et téléchargez le justificatif (optionnel)</li>
          <li>Notre équipe validera votre paiement sous <strong>24-48 heures ouvrées</strong></li>
          <li>Vous recevrez une notification dès la validation</li>
        </ol>
      </div>

      {paymentRequest?.status === 'pending' && !paymentRequest.transfer_reference && (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, border: '1px solid #ddd' }}>
          <h3>📤 Soumettre votre justificatif</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Référence du virement <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={referenceCode}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 4,
                border: '1px solid #ccc',
                fontSize: 16
              }}
            />
            <small style={{ color: '#666' }}>
              Indiquez la référence de votre virement (numéro de transaction ou référence bancaire)
            </small>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              URL du justificatif (optionnel)
            </label>
            <input
              type="text"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://... (lien vers votre justificatif)"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 4,
                border: '1px solid #ccc',
                fontSize: 16
              }}
            />
            <small style={{ color: '#666' }}>
              Vous pouvez héberger votre justificatif sur Google Drive, Dropbox, etc. et coller le lien ici
            </small>
          </div>

          <button
            onClick={handleSubmitProof}
            disabled={uploading || !reference}
            style={{
              background: '#007bff',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 4,
              border: 'none',
              fontSize: 16,
              fontWeight: 'bold',
              cursor: uploading || !reference ? 'not-allowed' : 'pointer',
              opacity: uploading || !reference ? 0.6 : 1
            }}
          >
            {uploading ? 'Envoi...' : 'Soumettre le justificatif'}
          </button>
        </div>
      )}

      {paymentRequest?.transfer_reference && (
        <div style={{ background: '#d1ecf1', padding: 16, borderRadius: 8 }}>
          ✅ Justificatif soumis le {new Date(paymentRequest.transfer_date || '').toLocaleDateString('fr-FR')}
          <div style={{ marginTop: 8 }}>
            <strong>Référence :</strong> {paymentRequest.transfer_reference}
          </div>
          <div style={{ marginTop: 8, fontSize: 14, color: '#666' }}>
            Votre demande est en cours de traitement. Vous serez notifié dès validation.
          </div>
        </div>
      )}

      <div style={{ marginTop: 32, padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
          <strong>💡 Besoin d'aide ?</strong> Contactez-nous à <a href="mailto:contact@siportevent.com">contact@siportevent.com</a>
        </p>
      </div>
    </div>
  );
}
