import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { ArrowLeft, Calendar, Crown, BadgePercent } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const PartnerEventsPage: React.FC = () => {
  const events = [
    { id: 'e1', name: 'Conférence Innovation Portuaire', date: '2025-09-15', type: 'Conférence', status: 'À venir', reach: 450 },
    { id: 'e2', name: 'Workshop Digitalisation', date: '2025-09-12', type: 'Atelier', status: 'En cours', reach: 120 },
    { id: 'e3', name: 'Networking VIP', date: '2025-09-08', type: 'Networking', status: 'Terminé', reach: 65 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to={ROUTES.DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>

          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Événements Sponsorisés</h1>
              <p className="text-gray-600">Gérez vos événements partenaires et suivez leur impact</p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="text-purple-800 font-medium">Programme Événements Partenaires</span>
              <Badge className="bg-purple-100 text-purple-800" size="sm">
                Prioritaire
              </Badge>
            </div>
          </div>
        </div>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Vos événements</h3>
            <div className="space-y-4">
              {events.map(evt => (
                <div key={evt.id} className="flex items-center justify-between border p-4 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">{evt.name}</div>
                    <div className="text-sm text-gray-600">{evt.type} • {evt.date}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={evt.status === 'À venir' ? 'info' : evt.status === 'En cours' ? 'warning' : 'success'} size="sm">
                      {evt.status}
                    </Badge>
                    <span className="text-sm text-gray-700">Portée estimée: {evt.reach}</span>
                    <Button variant="outline" size="sm">
                      <BadgePercent className="h-4 w-4 mr-2" />
                      Voir l'impact
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
