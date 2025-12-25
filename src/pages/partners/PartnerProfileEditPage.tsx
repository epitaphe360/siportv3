import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Building2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const PartnerProfileEditPage: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: 'TechNav Solutions',
    description: 'Solutions de navigation et de tracking maritime avancées pour l\'industrie portuaire moderne.',
    website: 'https://technav-solutions.com',
    address: '15 Rue de la Navigation, 13002 Marseille',
    phone: '+33 4 91 23 45 67',
    email: 'contact@technav-solutions.com',
    employees: 85,
    founded: 2015,
    ceo: 'Marie Martin',
    contactPerson: 'Pierre Dubois',
    sectors: ['Technologie', 'Navigation', 'Data Analytics'],
    services: ['Systèmes de tracking GPS', 'Analyse de données maritimes', 'Solutions IoT portuaires'],
    certifications: ['ISO 9001', 'ISO 27001', 'Maritime Security'],
    logo: null
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulation de sauvegarde
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSaving(false);
    toast.success('Profil mis à jour avec succès !');
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Ici vous pouvez gérer l'upload du fichier
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Modifier le Profil Partenaire</h1>
          <p className="text-gray-600 mt-2">
            Mettez à jour les informations de votre entreprise partenaire
          </p>
        </div>

        <div className="space-y-6">
          {/* Informations générales */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations Générales</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de contact *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre d'employés
                  </label>
                  <input
                    type="number"
                    value={formData.employees}
                    onChange={(e) => handleInputChange('employees', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année de création
                  </label>
                  <input
                    type="number"
                    value={formData.founded}
                    onChange={(e) => handleInputChange('founded', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Directeur Général
                  </label>
                  <input
                    type="text"
                    value={formData.ceo}
                    onChange={(e) => handleInputChange('ceo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description de l'entreprise *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Logo et image */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Logo et Image</h2>

              <div className="flex items-center space-x-6">
                <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Logo de l'entreprise</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    PNG, JPG jusqu'à 2MB
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Secteurs et services */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Secteurs et Services</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secteurs d'activité
                  </label>
                  <div className="space-y-2">
                    {['Technologie', 'Navigation', 'Data Analytics', 'Sécurité', 'Environnement', 'Logistique'].map(sector => (
                      <label key={sector} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.sectors.includes(sector)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange('sectors', [...formData.sectors, sector]);
                            } else {
                              handleInputChange('sectors', formData.sectors.filter(s => s !== sector));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{sector}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services proposés
                  </label>
                  <textarea
                    value={formData.services.join('\n')}
                    onChange={(e) => handleInputChange('services', e.target.value.split('\n'))}
                    rows={6}
                    placeholder="Un service par ligne"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Certifications */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Certifications</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications obtenues
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['ISO 9001', 'ISO 27001', 'ISO 14001', 'Maritime Security', 'OHSAS 18001', 'ISO 50001'].map(cert => (
                    <label key={cert} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.certifications.includes(cert)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('certifications', [...formData.certifications, cert]);
                          } else {
                            handleInputChange('certifications', formData.certifications.filter(c => c !== cert));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link to={ROUTES.DASHBOARD}>
              <Button variant="outline">
                Annuler
              </Button>
            </Link>
            <Button onClick={handleSave} disabled={isSaving} variant="default">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};



