import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Building2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  FileText,
  Users,
  Award,
  TrendingUp,
  Calendar,
  Globe
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const PartnerProfileEditPage: React.FC = () => {
  const [formData, setFormData] = useState({
    // Informations de base (obligatoires)
    companyName: '',
    description: '',
    
    // Contact (optionnel)
    website: '',
    address: '',
    phone: '',
    email: '',
    country: '',
    
    // Détails entreprise (optionnel)
    type: 'corporate', // corporate, museum, sponsor, association
    sponsorLevel: '', // principal, gold, silver, bronze
    employees: '',
    founded: '',
    ceo: '',
    contactPerson: '',
    
    // Catégories (optionnel)
    sectors: [] as string[],
    services: [] as string[],
    certifications: [] as string[],
    
    // Sections riches (optionnel)
    expertise: '',
    projects: [] as Array<{ title: string; description: string; image?: string; year?: string }>,
    gallery: [] as string[],
    news: [] as Array<{ title: string; description: string; date?: string; image?: string }>,
    
    // Impact & Métriques (optionnel)
    metrics: {
      projectsCompleted: '',
      yearsExperience: '',
      teamSize: '',
      countriesServed: ''
    },
    
    // Timeline (optionnel)
    timeline: [] as Array<{ year: string; event: string; description?: string }>,
    
    // Équipe (optionnel)
    team: [] as Array<{ name: string; role: string; photo?: string; bio?: string }>,
    
    logo: null
  });

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    contact: true,
    details: false,
    categories: false,
    expertise: false,
    projects: false,
    gallery: false,
    news: false,
    metrics: false,
    timeline: false,
    team: false
  });

  const [isSaving, setIsSaving] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as object),
        [field]: value
      }
    }));
  };

  const handleArrayAdd = (field: 'projects' | 'news' | 'timeline' | 'team') => {
    const newItem = 
      field === 'projects' ? { title: '', description: '', image: '', year: '' } :
      field === 'news' ? { title: '', description: '', date: '', image: '' } :
      field === 'timeline' ? { year: '', event: '', description: '' } :
      { name: '', role: '', photo: '', bio: '' };
    
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], newItem]
    }));
  };

  const handleArrayRemove = (field: 'projects' | 'news' | 'timeline' | 'team', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleArrayItemChange = (field: 'projects' | 'news' | 'timeline' | 'team', index: number, itemField: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? { ...item, [itemField]: value } : item
      )
    }));
  };

  const calculateCompleteness = () => {
    const fields = [
      formData.companyName,
      formData.description,
      formData.website,
      formData.country,
      formData.email,
      formData.sectors.length > 0,
      formData.expertise,
      formData.projects.length > 0,
      formData.gallery.length > 0
    ];
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const handleSave = async () => {
    if (!formData.companyName.trim()) {
      toast.error('Le nom de l\'entreprise est obligatoire');
      return;
    }
    
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
      toast.success('Logo téléchargé');
    }
  };

  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Simuler l'upload et ajouter les URLs
      const newImages = Array.from(files).map(f => URL.createObjectURL(f));
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...newImages]
      }));
      toast.success(`${files.length} image(s) ajoutée(s)`);
    }
  };

  const SectionHeader = ({ title, section, icon: Icon, optional = true }: { 
    title: string; 
    section: keyof typeof expandedSections; 
    icon: React.ElementType;
    optional?: boolean;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-t-lg transition-colors"
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {optional && <span className="text-sm text-gray-500">(Optionnel)</span>}
      </div>
      {expandedSections[section] ? 
        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
        <ChevronDown className="h-5 w-5 text-gray-400" />
      }
    </button>
  );

  const completeness = calculateCompleteness();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profil Partenaire</h1>
              <p className="text-gray-600 mt-2">
                Complétez votre profil progressivement - tous les champs sont optionnels sauf le nom
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Complétude du profil</div>
              <div className="flex items-center space-x-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <span className="text-lg font-semibold text-blue-600">{completeness}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Informations de base */}
          <Card>
            <SectionHeader title="Informations de base" section="basic" icon={Building2} optional={false} />
            {expandedSections.basic && (
              <div className="p-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'entreprise <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Royal Maritime Group"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'organisation
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="corporate">Entreprise</option>
                      <option value="sponsor">Sponsor</option>
                      <option value="museum">Musée</option>
                      <option value="association">Association</option>
                      <option value="government">Organisation gouvernementale</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      placeholder="Groupe maritime d'excellence, sponsor principal de SIPORTS 2026..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Logo */}
                <div className="mt-6 pt-6 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Logo de l'entreprise</label>
                  <div className="flex items-center space-x-6">
                    <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo" className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="mt-1 text-sm text-gray-500">PNG, JPG jusqu'à 2MB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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



