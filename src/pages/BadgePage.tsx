import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import useAuthStore from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';
import {
  getUserBadge,
  generateBadgeFromUser,
  getBadgeColor,
  getAccessLevelLabel,
  generateQRData,
} from '../services/badgeService';
import { UserBadge } from '../types';

export default function BadgePage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [badge, setBadge] = useState<UserBadge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      loadBadge();
    }
  }, [user?.id]);

  async function loadBadge() {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const userBadge = await getUserBadge(user.id);
      setBadge(userBadge);
    } catch (err: any) {
      console.error('Error loading badge:', err);
      setError(err.message || 'Erreur lors du chargement du badge');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateBadge() {
    if (!user?.id) return;

    try {
      setGenerating(true);
      setError(null);
      const newBadge = await generateBadgeFromUser(user.id);
      setBadge(newBadge);
    } catch (err: any) {
      console.error('Error generating badge:', err);
      setError(err.message || 'Erreur lors de la gÃ©nÃ©ration du badge');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownloadBadge() {
    if (!badgeRef.current || !badge) return;

    try {
      // Utiliser html2canvas pour capturer le badge
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(badgeRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      // Convertir en blob et tÃ©lÃ©charger
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `badge-${badge.badgeCode}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
    } catch (err) {
      console.error('Error downloading badge:', err);
      alert('Erreur lors du tÃ©lÃ©chargement. Veuillez faire une capture d\'Ã©cran du badge.');
    }
  }

  function handlePrintBadge() {
    window.print();
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: 'auto', padding: 32, textAlign: 'center' }}>
        <p>Chargement de votre badge...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 900, margin: 'auto', padding: 32, textAlign: 'center' }}>
        <p>Vous devez Ãªtre connectÃ© pour voir votre badge.</p>
      </div>
    );
  }

  const badgeColor = badge ? getBadgeColor(badge.accessLevel) : '#28a745';
  const qrData = badge ? generateQRData(badge) : '';

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 32 }}>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .badge-container, .badge-container * {
              visibility: visible;
            }
            .badge-container {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="no-print" style={{ marginBottom: 32 }}>
        <h1>🎫 Mon Badge d'Accès</h1>
        <p style={{ color: '#666' }}>
          {badge
            ? 'Téléchargez ou imprimez votre badge pour accéder au salon.'
            : 'Générez votre badge personnalisé avec QR code pour accéder au salon.'}
        </p>
      </div>

      {error && (
        <div className="no-print" style={{ background: '#f8d7da', padding: 16, borderRadius: 8, marginBottom: 24, color: '#721c24' }}>
          ⚠️ {error}
        </div>
      )}

      {!badge && (
        <div className="no-print" style={{ textAlign: 'center', marginBottom: 32 }}>
          <button
            onClick={handleGenerateBadge}
            disabled={generating}
            style={{
              background: '#007bff',
              color: '#fff',
              padding: '16px 32px',
              borderRadius: 8,
              border: 'none',
              fontSize: 18,
              fontWeight: 'bold',
              cursor: generating ? 'not-allowed' : 'pointer',
              opacity: generating ? 0.6 : 1,
            }}
          >
            {generating ? 'Génération...' : '✨ Générer mon badge'}
          </button>
        </div>
      )}

      {badge && (
        <>
          {/* Actions */}
          <div className="no-print" style={{ display: 'flex', gap: 16, marginBottom: 32, justifyContent: 'center' }}>
            <button
              onClick={handleDownloadBadge}
              style={{
                background: '#28a745',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: 8,
                border: 'none',
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              📥 Télécharger PNG
            </button>
            <button
              onClick={handlePrintBadge}
              style={{
                background: '#6c757d',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: 8,
                border: 'none',
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              🖨️ Imprimer
            </button>
            <button
              onClick={handleGenerateBadge}
              disabled={generating}
              style={{
                background: '#ffc107',
                color: '#000',
                padding: '12px 24px',
                borderRadius: 8,
                border: 'none',
                fontSize: 16,
                fontWeight: 'bold',
                cursor: generating ? 'not-allowed' : 'pointer',
                opacity: generating ? 0.6 : 1,
              }}
            >
              {generating ? 'Régénération...' : '📄 Régénérer'}
            </button>
          </div>

          {/* Badge */}
          <div className="badge-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div
              ref={badgeRef}
              style={{
                width: 400,
                background: '#fff',
                border: `4px solid ${badgeColor}`,
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              {/* En-tÃªte */}
              <div style={{ textAlign: 'center', marginBottom: 20, borderBottom: `2px solid ${badgeColor}`, paddingBottom: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: badgeColor }}>
                  SIPORT 2025
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  Salon International des Ports d'Afrique
                </div>
              </div>

              {/* Photo et Nom */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                {badge.avatarUrl && (
                  <img
                    src={badge.avatarUrl}
                    alt="Avatar"
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `3px solid ${badgeColor}`,
                      marginBottom: 12,
                    }}
                  />
                )}
                <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                  {badge.fullName}
                </div>
                {badge.position && (
                  <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                    {badge.position}
                  </div>
                )}
                {badge.companyName && (
                  <div style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
                    {badge.companyName}
                  </div>
                )}
              </div>

              {/* Badge Type */}
              <div
                style={{
                  textAlign: 'center',
                  background: badgeColor,
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 20,
                }}
              >
                {getAccessLevelLabel(badge.accessLevel)}
              </div>

              {/* Informations supplÃ©mentaires */}
              {badge.standNumber && (
                <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 14 }}>
                  <strong>Stand NÂ°:</strong> {badge.standNumber}
                </div>
              )}

              {/* QR Code */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ display: 'inline-block', padding: 16, background: '#fff', borderRadius: 8 }}>
                  <QRCodeSVG value={qrData} size={180} level="H" includeMargin={true} />
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                  Code: {badge.badgeCode}
                </div>
              </div>

              {/* ValiditÃ© */}
              <div style={{ textAlign: 'center', fontSize: 11, color: '#666' }}>
                <div>Valide jusqu'au:</div>
                <div style={{ fontWeight: 'bold' }}>
                  {new Date(badge.validUntil).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="no-print" style={{ background: '#e7f3ff', padding: 24, borderRadius: 8 }}>
            <h3 style={{ marginTop: 0 }}>ðŸ“± Instructions d'utilisation</h3>
            <ol style={{ marginBottom: 0 }}>
              <li>
                <strong>TÃ©lÃ©chargez</strong> votre badge en cliquant sur "TÃ©lÃ©charger PNG" ou imprimez-le
              </li>
              <li>
                <strong>Conservez</strong> le badge sur votre tÃ©lÃ©phone ou imprimez-le sur papier
              </li>
              <li>
                <strong>PrÃ©sentez</strong> le QR code Ã  l'entrÃ©e du salon pour scanner votre accÃ¨s
              </li>
              <li>
                <strong>Portez</strong> votre badge de maniÃ¨re visible pendant toute la durÃ©e du salon
              </li>
            </ol>

            {badge.accessLevel === 'vip' && (
              <div style={{ marginTop: 16, background: '#fff3cd', padding: 12, borderRadius: 8, border: '1px solid #ffc107' }}>
                <strong>ðŸ‘‘ Avantages Pass Premium VIP:</strong>
                <ul style={{ marginBottom: 0, marginTop: 8 }}>
                  <li>AccÃ¨s illimitÃ© Ã  toutes les zones</li>
                  <li>Rendez-vous B2B illimitÃ©s</li>
                  <li>AccÃ¨s aux Ã©vÃ©nements exclusifs</li>
                  <li>DÃ©jeuners networking</li>
                  <li>SoirÃ©e gala</li>
                </ul>
              </div>
            )}

            {badge.userType === 'exhibitor' && (
              <div style={{ marginTop: 16, background: '#d1ecf1', padding: 12, borderRadius: 8, border: '1px solid #0c5460' }}>
                <strong>ðŸ¢ Badge Exposant:</strong> Ce badge vous donne accÃ¨s Ã  votre stand et aux zones exposants.
                {badge.standNumber && ` Votre stand: ${badge.standNumber}`}
              </div>
            )}

            {badge.userType === 'partner' && (
              <div style={{ marginTop: 16, background: '#e2e3e5', padding: 12, borderRadius: 8, border: '1px solid #6c757d' }}>
                <strong>ðŸ¤ Badge Partenaire:</strong> Ce badge vous donne accÃ¨s Ã  toutes les zones partenaires et Ã©vÃ©nements.
              </div>
            )}
          </div>

          {/* Statistiques */}
          <div className="no-print" style={{ marginTop: 24, padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
            <h4 style={{ marginTop: 0, marginBottom: 12 }}>ðŸ“Š Statistiques du badge</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#666' }}>Scans effectuÃ©s</div>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>{badge.scanCount}</div>
              </div>
              {badge.lastScannedAt && (
                <div>
                  <div style={{ fontSize: 12, color: '#666' }}>Dernier scan</div>
                  <div style={{ fontSize: 14, fontWeight: 'bold' }}>
                    {new Date(badge.lastScannedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize: 12, color: '#666' }}>Statut</div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: badge.status === 'active' ? '#28a745' : '#dc3545',
                  }}
                >
                  {badge.status === 'active' ? 'âœ… Actif' : 'âŒ ' + badge.status}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


