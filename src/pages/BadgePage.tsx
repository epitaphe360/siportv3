import React, { useEffect, useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';
import { Download, Printer, RefreshCw, AlertTriangle, CheckCircle, XCircle, Scan, Calendar, User, Briefcase, Building } from 'lucide-react';
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
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

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
      toast.success('Badge généré avec succès !');
    } catch (err: any) {
      console.error('Error generating badge:', err);
      setError(err.message || 'Erreur lors de la génération du badge');
      toast.error('Erreur lors de la génération du badge');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownloadBadge() {
    if (!badgeRef.current || !badge) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(badgeRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true, // Important for images
      });

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
          toast.success('Badge téléchargé !');
        }
      });
    } catch (err) {
      console.error('Error downloading badge:', err);
      toast.error('Erreur lors du téléchargement. Veuillez faire une capture d\'écran du badge.');
    }
  }

  function handlePrintBadge() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <Card className="p-8">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Connexion requise</h2>
          <p className="text-gray-600">Vous devez être connecté pour voir votre badge.</p>
        </Card>
      </div>
    );
  }

  const badgeColor = badge ? getBadgeColor(badge.accessLevel) : '#28a745';
  const qrData = badge ? generateQRData(badge) : '';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
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
              box-shadow: none !important;
              border: 1px solid #ccc !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="no-print mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">🎫 Mon Badge d'Accès</h1>
        <p className="text-gray-600">
          {badge
            ? 'Téléchargez ou imprimez votre badge pour accéder au salon.'
            : 'Générez votre badge personnalisé avec QR code pour accéder au salon.'}
        </p>
      </div>

      {error && (
        <div className="no-print bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {!badge && (
        <div className="no-print text-center mb-8">
          <Button
            onClick={handleGenerateBadge}
            disabled={generating}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {generating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Scan className="w-5 h-5 mr-2" />
                ✨ Générer mon badge
              </>
            )}
          </Button>
        </div>
      )}

      {badge && (
        <>
          {/* Actions */}
          <div className="no-print flex flex-wrap justify-center gap-4 mb-8">
            <Button
              onClick={handleDownloadBadge}
              variant="outline"
              className="border-green-600 text-green-700 hover:bg-green-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger PNG
            </Button>
            <Button
              onClick={handlePrintBadge}
              variant="outline"
              className="border-gray-600 text-gray-700 hover:bg-gray-50"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            <Button
              onClick={handleGenerateBadge}
              disabled={generating}
              variant="ghost"
              className="text-yellow-600 hover:bg-yellow-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Régénération...' : 'Régénérer'}
            </Button>
          </div>

          {/* Badge Display */}
          <div className="flex justify-center mb-8">
            <div
              ref={badgeRef}
              className="badge-container bg-white w-[400px] rounded-2xl shadow-2xl overflow-hidden relative"
              style={{
                border: `4px solid ${badgeColor}`,
              }}
            >
              {/* Header */}
              <div className="text-center p-6 border-b-2" style={{ borderColor: badgeColor }}>
                <img src="/salon-logo01.png" alt="SIPORTS Logo" className="h-16 mx-auto mb-3" />
                <div className="text-2xl font-bold" style={{ color: badgeColor }}>
                  SIPORTS 2026
                </div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                  Salon International des Ports et de leurs Écosystème
                </div>
              </div>

              {/* User Info */}
              <div className="text-center p-6 bg-gradient-to-b from-white to-gray-50">
                {badge.avatarUrl ? (
                  <img
                    src={badge.avatarUrl}
                    alt="Avatar"
                    className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 shadow-md"
                    style={{ borderColor: badgeColor }}
                  />
                ) : (
                  <div 
                    className="w-28 h-28 rounded-full mx-auto mb-4 border-4 flex items-center justify-center bg-gray-100 text-gray-400"
                    style={{ borderColor: badgeColor }}
                  >
                    <User className="w-12 h-12" />
                  </div>
                )}
                
                <div className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                  {badge.fullName}
                </div>
                
                {badge.position && (
                  <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                    <Briefcase className="w-3 h-3" />
                    <span className="text-sm font-medium">{badge.position}</span>
                  </div>
                )}
                
                {badge.companyName && (
                  <div className="flex items-center justify-center gap-1 text-gray-800 font-semibold">
                    <Building className="w-3 h-3" />
                    <span className="text-sm">{badge.companyName}</span>
                  </div>
                )}
              </div>

              {/* Badge Level */}
              <div className="px-6 pb-4 text-center">
                <span
                  className="inline-block px-6 py-2 rounded-full text-white font-bold text-lg shadow-sm uppercase tracking-wide"
                  style={{ background: badgeColor }}
                >
                  {getAccessLevelLabel(badge.accessLevel)}
                </span>
              </div>

              {/* Stand Number (if applicable) */}
              {badge.standNumber && (
                <div className="text-center mb-4 text-gray-700 bg-gray-100 py-2 mx-6 rounded-lg">
                  <span className="font-bold">Stand N°:</span> {badge.standNumber}
                </div>
              )}

              {/* QR Code */}
              <div className="text-center p-6 bg-white">
                <div className="inline-block p-4 bg-white rounded-xl border border-gray-200 shadow-inner">
                  <QRCodeCanvas value={qrData} size={160} level="H" includeMargin={false} />
                </div>
                <div className="text-xs text-gray-400 mt-2 font-mono">
                  ID: {badge.badgeCode}
                </div>
              </div>

              {/* Footer / Validity */}
              <div className="text-center p-3 bg-gray-900 text-white text-xs">
                <div className="flex items-center justify-center gap-1 opacity-80 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span>Valide du</span>
                </div>
                <div className="font-bold text-sm tracking-widest">
                  1 - 3 AVRIL 2026
                </div>
              </div>
            </div>
          </div>

          {/* Instructions & Stats Grid */}
          <div className="no-print grid md:grid-cols-2 gap-6">
            {/* Instructions */}
            <Card className="p-6 bg-blue-50 border-blue-100">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Scan className="w-5 h-5" />
                Instructions d'utilisation
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                <li><span className="font-semibold">Téléchargez</span> votre badge ou imprimez-le.</li>
                <li><span className="font-semibold">Conservez</span> le badge sur votre téléphone.</li>
                <li><span className="font-semibold">Présentez</span> le QR code à l'entrée.</li>
                <li><span className="font-semibold">Portez</span> votre badge visiblement.</li>
              </ol>

              {(badge.accessLevel === 'vip' || badge.accessLevel === 'premium') && (
                <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-yellow-800 text-sm">
                  <strong className="block mb-1 flex items-center gap-1">
                    <span className="text-lg">👑</span> Avantages VIP
                  </strong>
                  <ul className="list-disc list-inside pl-1 space-y-1 text-xs">
                    <li>Accès illimité à toutes les zones</li>
                    <li>Rendez-vous B2B illimités</li>
                    <li>Accès aux événements exclusifs</li>
                  </ul>
                </div>
              )}
            </Card>

            {/* Stats */}
            <Card className="p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">📊 Statistiques</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Scans effectués</div>
                  <div className="text-2xl font-bold text-gray-900">{badge.scanCount}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Statut</div>
                  <div className={`text-sm font-bold flex items-center gap-1 ${badge.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {badge.status === 'active' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {badge.status === 'active' ? 'Actif' : badge.status}
                  </div>
                </div>
                {badge.lastScannedAt && (
                  <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Dernier scan</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(badge.lastScannedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}


