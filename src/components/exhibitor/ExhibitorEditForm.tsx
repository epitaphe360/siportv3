import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save,
  ArrowLeft,
  Building,
  Globe,
  Tag,
  ClipboardCheck,
  MapPin,
  Phone,
  Mail,
  Users,
  Calendar,
  DollarSign,
  Award as AwardIcon
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useExhibitorStore } from '../../store/exhibitorStore';
import { toast } from 'react-hot-toast';
import ImageUploader from '../ui/upload/ImageUploader';
import { SupabaseService } from '../../services/supabaseService';
import { StorageService } from '../../services/storageService';
import { Exhibitor, ExhibitorCategory } from '../../types';

export default function ExhibitorEditForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { exhibitors, selectedExhibitor, selectExhibitor, updateExhibitorInStore, fetchExhibitors } = useExhibitorStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    category: 'port-industry' as ExhibitorCategory,
    sector: '',
    logo: '',
    website: '',
    contactInfo: {
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      zipCode: '',
      contactPerson: ''
    },
    establishedYear: '',
    employeeCount: '',
    revenue: '',
    certifications: [] as string[],
    markets: [] as string[]
  });

  // Charger les données de l'exposant
  useEffect(() => {
    if (exhibitors.length === 0) {
      fetchExhibitors();
    }
  }, [exhibitors.length, fetchExhibitors]);

  useEffect(() => {
    if (id) {
      selectExhibitor(id);
    }
  }, [id, selectExhibitor, exhibitors]);

  // Remplir le formulaire avec les données de l'exposant sélectionné
  useEffect(() => {
    if (selectedExhibitor) {
      setFormData({
        companyName: selectedExhibitor.companyName || '',
        description: selectedExhibitor.description || '',
        category: selectedExhibitor.category || 'port-industry',
        sector: selectedExhibitor.sector || '',
        logo: selectedExhibitor.logo || '',
        website: selectedExhibitor.website || '',
        contactInfo: {
          email: selectedExhibitor.contactInfo?.email || '',
          phone: selectedExhibitor.contactInfo?.phone || '',
          address: selectedExhibitor.contactInfo?.address || '',
          city: selectedExhibitor.contactInfo?.city || '',
          country: selectedExhibitor.contactInfo?.country || '',
          zipCode: selectedExhibitor.contactInfo?.zipCode || '',
          contactPerson: selectedExhibitor.contactInfo?.contactPerson || ''
        },
        establishedYear: selectedExhibitor.establishedYear?.toString() || '',
        employeeCount: selectedExhibitor.employeeCount?.toString() || '',
        revenue: selectedExhibitor.revenue?.toString() || '',
        certifications: selectedExhibitor.certifications || [],
        markets: selectedExhibitor.markets || []
      });
    }
  }, [selectedExhibitor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      // Gestion des champs imbriqués (contactInfo)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, logo: url }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'certifications' | 'markets') => {
    const value = e.target.value;
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!id) {
        throw new Error('ID de l\'exposant non défini');
      }

      // Télécharger l'image du logo depuis l'ancienne URL si c'est une URL locale
      let logoUrl = formData.logo;
      if (logoUrl && logoUrl.startsWith('/')) {
        try {
          // Créer le bucket si nécessaire
          await StorageService.createBucketIfNotExists('exhibitors');
          
          // Convertir l'URL locale en URL Supabase
          logoUrl = await StorageService.uploadImageFromUrl(
            window.location.origin + logoUrl,
            'exhibitors',
            'logos'
          );
        } catch (error) {
          console.error('Erreur lors du téléchargement du logo:', error);
          // Continuer avec l'ancienne URL en cas d'erreur
        }
      }

      // Préparer les données pour la mise à jour
      const exhibitorData: Partial<Exhibitor> = {
        companyName: formData.companyName,
        description: formData.description,
        category: formData.category,
        sector: formData.sector,
        logo: logoUrl,
        website: formData.website,
        contactInfo: {
          email: formData.contactInfo.email,
          phone: formData.contactInfo.phone,
          address: formData.contactInfo.address,
          city: formData.contactInfo.city,
          country: formData.contactInfo.country,
          zipCode: formData.contactInfo.zipCode,
          contactPerson: formData.contactInfo.contactPerson,
        },
        establishedYear: formData.establishedYear ? parseInt(formData.establishedYear, 10) : undefined,
        employeeCount: formData.employeeCount,
        revenue: formData.revenue,
        certifications: formData.certifications,
        markets: formData.markets,
      };

      // Mise à jour dans Supabase
      await SupabaseService.updateExhibitor(id, exhibitorData);
      
      // Mise à jour du store local
      updateExhibitorInStore(id, exhibitorData);
      
      toast.success('Exposant mis à jour avec succès !');
      navigate(`/exhibitors/${id}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher un loader pendant le chargement des données
  if (exhibitors.length === 0 || !selectedExhibitor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chargement...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Entête */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate(`/exhibitors/${id}`)} className="mr-4">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Modifier {formData.companyName}
            </h1>
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="flex items-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Enregistrer
          </Button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne de gauche */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  Informations de l'entreprise
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catégorie *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="port-industry">Industrie Portuaire</option>
                        <option value="port-operations">Opérations Portuaires</option>
                        <option value="institutional">Institutionnel</option>
                        <option value="academic">Académique</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secteur d'activité *
                      </label>
                      <input
                        type="text"
                        name="sector"
                        value={formData.sector}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ex: Maritime, Transport, Énergie..."
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site web
                    </label>
                    <div className="flex items-center">
                      <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                        <Globe className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.exemple.com"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Coordonnées
                </h2>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email de contact
                      </label>
                      <div className="flex items-center">
                        <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                          <Mail className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="email"
                          name="contactInfo.email"
                          value={formData.contactInfo.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="contact@exemple.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <div className="flex items-center">
                        <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                          <Phone className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="tel"
                          name="contactInfo.phone"
                          value={formData.contactInfo.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      name="contactInfo.address"
                      value={formData.contactInfo.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Rue Exemple, 75000 Paris, France"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ville
                      </label>
                      <input
                        type="text"
                        name="contactInfo.city"
                        value={formData.contactInfo.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Paris"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pays
                      </label>
                      <input
                        type="text"
                        name="contactInfo.country"
                        value={formData.contactInfo.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="France"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personne de contact
                    </label>
                    <input
                      type="text"
                      name="contactInfo.contactPerson"
                      value={formData.contactInfo.contactPerson}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jean Dupont"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <ClipboardCheck className="h-5 w-5 mr-2 text-blue-600" />
                  Informations supplémentaires
                </h2>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Année de création
                      </label>
                      <div className="flex items-center">
                        <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                          <Calendar className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="number"
                          name="establishedYear"
                          value={formData.establishedYear}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ex: 2010"
                          min="1800"
                          max={new Date().getFullYear()}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre d'employés
                      </label>
                      <div className="flex items-center">
                        <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                          <Users className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="number"
                          name="employeeCount"
                          value={formData.employeeCount}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ex: 250"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chiffre d'affaires (M€)
                      </label>
                      <div className="flex items-center">
                        <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                          <DollarSign className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="number"
                          name="revenue"
                          value={formData.revenue}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ex: 42"
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certifications (séparées par des virgules)
                    </label>
                    <div className="flex items-center">
                      <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                        <AwardIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        value={formData.certifications.join(', ')}
                        onChange={(e) => handleArrayChange(e, 'certifications')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ISO 9001, ISO 14001, OHSAS 18001..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marchés (séparés par des virgules)
                    </label>
                    <div className="flex items-center">
                      <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                        <Tag className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        value={formData.markets.join(', ')}
                        onChange={(e) => handleArrayChange(e, 'markets')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Europe, Afrique, Asie..."
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Colonne de droite (Logo et aperçu) */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Logo de l'entreprise
                </h2>
                
                <ImageUploader
                  onImageUploaded={handleLogoUploaded}
                  initialImageUrl={formData.logo}
                  bucket="exhibitors"
                  folder="logos"
                  maxSizeMB={2}
                />
                
                <p className="text-sm text-gray-500 mt-4">
                  Format recommandé: PNG ou JPG, 512x512px, max 2MB
                </p>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Aperçu de la fiche
                </h2>
                
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex items-center space-x-4">
                    {formData.logo ? (
                      <img 
                        src={formData.logo} 
                        alt={formData.companyName} 
                        className="h-16 w-16 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/siports-logo.jpg';
                        }}
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Building className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {formData.companyName || 'Nom de l\'entreprise'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formData.sector || 'Secteur d\'activité'}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {formData.description || 'Description de l\'entreprise...'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {formData.category === 'port-industry' ? 'Industrie Portuaire' : 
                         formData.category === 'port-operations' ? 'Opérations Portuaires' : 
                         formData.category === 'institutional' ? 'Institutionnel' : 
                         formData.category === 'academic' ? 'Académique' : 
                         'Catégorie'}
                      </span>
                      {formData.markets.slice(0, 3).map((market, index) => (
                        <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {market}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
