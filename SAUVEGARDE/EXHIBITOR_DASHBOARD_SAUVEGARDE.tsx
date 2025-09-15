import React, { useState } from 'react';
import { Card } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';
import { Button } from '../src/components/ui/Button';
import { Link } from 'react-router-dom';
import useAuthStore from '../src/store/authStore'; // OK
import { useDashboardStore } from '../src/store/dashboardStore';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

export const ExhibitorDashboard: React.FC = () => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [modal, setModal] = useState<{title: string, content: React.ReactNode} | null>(null);
  const { dashboard } = useDashboardStore();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord Exposant</h1>
          <p className="text-gray-600">Bienvenue {user?.profile.firstName}, gérez votre présence SIPORTS 2026</p>
          <div className="mt-2 flex items-center space-x-2">
            <Badge variant="info" size="sm">{user?.profile.company}</Badge>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <p className="text-sm font-medium text-gray-600">Vues Mini-Site</p>
              <p className="text-3xl font-bold text-gray-900">{dashboard?.stats?.miniSiteViews?.toLocaleString() || '2,156'}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <p className="text-sm font-medium text-gray-600">Demandes de RDV</p>
              <p className="text-3xl font-bold text-gray-900">{dashboard?.stats?.appointments}</p>
            </div>
          </Card>
        </div>

        {/* Actions Rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestion de votre Présence</h3>
              <Link to="/minisite/editor">
                <Button className="w-full">Modifier mon Mini-Site</Button>
              </Link>
              <Link to="/profile">
                <Button className="w-full" variant="outline">Mon Profil Exposant</Button>
              </Link>
              <Button className="w-full" variant="outline" onClick={() => setShowQRModal(true)}>QR Code Stand</Button>
              <Button className="w-full" variant="outline" onClick={() => setModal({
                title: 'Analytics & Rapports',
                content: (
                  <div>
                    <div><b>Vues mini-site :</b> 2,156</div>
                    <div><b>Téléchargements :</b> 89</div>
                    <div><b>Leads générés :</b> 47</div>
                  </div>
                )
              })}>Analytics & Rapports</Button>
            </div>
          </Card>
        </div>

        {/* Modal QR Code */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center relative">
              <h2 className="text-xl font-bold mb-4">QR Code Stand Exposant</h2>
              <QRCode
                value={`SIPORTS2026-EXHIBITOR-${user?.id}`}
                size={200}
                level="H"
                includeMargin={true}
              />
              <div className="mt-4 text-sm text-gray-700">
                <div><b>Entreprise :</b> {user?.profile.company}</div>
                <div><b>Contact :</b> {user?.profile.firstName} {user?.profile.lastName}</div>
                <div><b>Email :</b> {user?.email}</div>
                <div><b>Stand :</b> A-12</div>
                <div><b>Valide jusqu'au :</b> 7 Février 2026 18:00</div>
              </div>
              <Button className="mt-6" onClick={() => setShowQRModal(false)}>Fermer</Button>
            </div>
          </div>
        )}

        {/* Modal générique */}
        {modal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center relative">
              <h2 className="text-xl font-bold mb-4">{modal.title}</h2>
              <div className="mb-6">{modal.content}</div>
              <Button onClick={() => setModal(null)}>Fermer</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
