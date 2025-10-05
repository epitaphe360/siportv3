import React from 'react';
import InteractiveVenueMap from '../components/venue/InteractiveVenueMap';

const VenuePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Plan de l'Événement</h1>
          <p className="text-lg text-gray-600">
            Explorez le plan interactif pour localiser les stands des exposants et accéder à leurs fiches.
          </p>
        </div>

        <InteractiveVenueMap />

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Comment utiliser la carte ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Parcourez la carte</h3>
                <p className="text-sm text-gray-600">
                  Faites défiler la carte pour voir tous les stands disponibles organisés par zones.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Survolez un stand</h3>
                <p className="text-sm text-gray-600">
                  Passez votre souris sur un stand pour voir un aperçu des informations de l'exposant.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Cliquez pour en savoir plus</h3>
                <p className="text-sm text-gray-600">
                  Cliquez sur un stand pour accéder à la fiche complète de l'exposant avec tous les détails.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenuePage;
