import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { 
  ArrowLeft,
  Crown,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  CheckCircle,
  Loader,
  Building2,
  DollarSign
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
// Badge not used in this form
import { SupabaseService } from '../../services/supabaseService';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { UserProfile } from '../../types';

interface NewPartnerForm {
  // Informations organisation
  organizationName: string;
  partnerType: 'institutional' | 'platinum' | 'gold' | 'silver' | 'bronze';
  sector: string;
  country: string;
  website: string;
  description: string;
  
  // Contact principal
  contactName: string;
  email: string;
  phone: string;
  position: string;
  
  // Informations partenariat
  sponsorshipLevel: string;
  contractValue: string;
  contributions: string[];
  establishedYear: number;
  employees: string;
}

export default function PartnerCreationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<NewPartnerForm>({
    organizationName: '',
    partnerType: 'silver',
    sector: '',
    country: '',
    website: '',
    description: '',
    contactName: '',
    email: '',
    phone: '',
    position: '',
    sponsorshipLevel: '',
    contractValue: '',
    contributions: [],
    establishedYear: new Date().getFullYear(),
    employees: ''
  });

  const steps = [
    { id: 1, title: 'Organisation', description: 'Informations générales' },
    { id: 2, title: 'Contact', description: 'Personne responsable' },
    { id: 3, title: 'Partenariat', description: 'Type et contributions' },
    { id: 4, title: 'Validation', description: 'Vérification finale' }
  ];

  const partnerTypes = [
    {
      type: 'institutional',
      name: 'Institutionnel',
      description: 'Organisateur ou institution gouvernementale',
      price: 'Sur mesure',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      type: 'platinum',
      name: 'Partenaire Platine',
      description: 'Partenaire stratégique majeur',
      price: '150,000€+',
      color: 'bg-gray-100 text-gray-800'
    },
    {
      type: 'gold',
      name: 'Partenaire Or',
      description: 'Partenaire premium avec visibilité élevée',
      price: '75,000€+',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      type: 'silver',
      name: 'Partenaire Argent',
      description: 'Partenaire officiel avec avantages',
      price: '35,000€+',
      color: 'bg-gray-100 text-gray-600'
    },
    {
      type: 'bronze',
      name: 'Partenaire Bronze',
      description: 'Partenaire associé',
      price: '15,000€+',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const sectors = [
    'Autorité Portuaire',
    'Transport Maritime',
    'Équipements Portuaires',
    'Logistique',
    'Consulting Maritime',
    'Technologies Maritimes',
    'Formation & Éducation',
    'Gouvernement',
    'Association Professionnelle',
    'Média Spécialisé'
  ];

  const availableContributions = [
    'Financement principal',
    'Expertise technique',
    'Réseau international',
    'Conférences techniques',
    'Networking premium',
    'Innovation showcase',
    'Formation professionnelle',
    'Recherche appliquée',
    'Médiatisation',
    'Support logistique'
  ];

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Créer l'utilisateur pour le partenaire
      const userData = {
        email: formData.email,
        name: formData.contactName,
        type: 'partner' as const,
        profile: {
          firstName: formData.contactName.split(' ')[0] || '',
          lastName: formData.contactName.split(' ').slice(1).join(' ') || '',
          company: formData.organizationName,
          position: formData.position,
          phone: formData.phone,
          country: formData.country,
          website: formData.website,
          bio: formData.description,
          interests: [],
          objectives: [],
          sectors: [],
          products: [],
          videos: [],
          images: [],
          participationObjectives: [],
          thematicInterests: [],
          collaborationTypes: [],
          expertise: []
        } as UserProfile
      };

  await SupabaseService.createUser(userData);
  toast.success(`Partenaire créé : ${formData.organizationName} (${formData.contactName})`);
      
      // Reset form et redirection
      setFormData({
        organizationName: '',
        partnerType: 'silver',
        sector: '',
        country: '',
        website: '',
        description: '',
        contactName: '',
        email: '',
        phone: '',
        position: '',
        sponsorshipLevel: '',
        contractValue: '',
        contributions: [],
        establishedYear: new Date().getFullYear(),
        employees: ''
      });
      
      setCurrentStep(1);
      setIsSubmitting(false);
      
      // Rediriger vers la liste des partenaires
  navigate(ROUTES.PARTNERS);
      
    } catch (error) {
      console.error('Erreur création partenaire:', error);
      setIsSubmitting(false);
  // Afficher erreur via toast et console
  toast.error(`Erreur création partenaire : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  console.error('Erreur création partenaire:', error);
    }
  };

  const toggleContribution = (contribution: string) => {
    setFormData(prev => ({
      ...prev,
      contributions: prev.contributions.includes(contribution)
        ? prev.contributions.filter(c => c !== contribution)
        : [...prev.contributions, contribution]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au Tableau de Bord Admin
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Créer un Nouveau Partenaire
            </h1>
            <p className="text-gray-600">
              Enregistrer un nouveau partenaire officiel SIPORTS 2026
            </p>
          </motion.div>
        </div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : 'bg-white text-gray-400 border-gray-300'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-purple-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Content */}
        <Card className="p-8">
          {/* Step 1: Informations Organisation */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Informations sur l'organisation
                </h2>
                <p className="text-gray-600">
                  Renseignez les informations générales du partenaire
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'organisation *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Nom de l'organisation partenaire"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secteur d'activité *
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Sélectionnez un secteur</option>
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Pays de l'organisation"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://organisation.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année de création
                  </label>
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre d'employés
                  </label>
                  <select
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Sélectionnez une taille</option>
                    <option value="1-10">1-10 employés</option>
                    <option value="11-50">11-50 employés</option>
                    <option value="51-200">51-200 employés</option>
                    <option value="201-1000">201-1000 employés</option>
                    <option value="1000+">1000+ employés</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description de l'organisation *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Décrivez l'activité principale de l'organisation, son expertise et sa mission..."
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Contact Principal */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Contact principal
                </h2>
                <p className="text-gray-600">
                  Personne responsable du partenariat
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Prénom et nom du contact"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poste/Fonction *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Directeur Partenariats, CEO, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email professionnel *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="contact@organisation.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Informations Partenariat */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Type de partenariat
                </h2>
                <p className="text-gray-600">
                  Choisissez le niveau de partenariat adapté
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partnerTypes.map((type) => (
                  <div
                    key={type.type}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.partnerType === type.type
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setFormData({ 
                        ...formData, 
                        partnerType: type.type as 'institutional' | 'platinum' | 'gold' | 'silver' | 'bronze',
                        sponsorshipLevel: type.name,
                        contractValue: type.price
                      });
                    }}
                  >
                    <div className="text-center">
                      <Crown className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <h3 className="font-bold text-gray-900">{type.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                      <p className="text-sm font-semibold text-purple-600">{type.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur du contrat
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.contractValue}
                      onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Montant du partenariat"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contributions au salon *
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Sélectionnez les contributions que ce partenaire apportera
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableContributions.map((contribution) => (
                    <label key={contribution} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.contributions.includes(contribution)}
                        onChange={() => toggleContribution(contribution)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{contribution}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Validation */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Validation du partenariat
                </h2>
                <p className="text-gray-600">
                  Vérifiez les informations avant création
                </p>
              </div>

              {/* Récapitulatif */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Organisation</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nom :</strong> {formData.organizationName}</div>
                    <div><strong>Secteur :</strong> {formData.sector}</div>
                    <div><strong>Pays :</strong> {formData.country}</div>
                    <div><strong>Site web :</strong> {formData.website}</div>
                    <div><strong>Fondée en :</strong> {formData.establishedYear}</div>
                    <div><strong>Employés :</strong> {formData.employees}</div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nom :</strong> {formData.contactName}</div>
                    <div><strong>Poste :</strong> {formData.position}</div>
                    <div><strong>Email :</strong> {formData.email}</div>
                    <div><strong>Téléphone :</strong> {formData.phone}</div>
                  </div>
                </Card>

                <Card className="p-4 md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Partenariat</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div><strong>Type :</strong> {partnerTypes.find(p => p.type === formData.partnerType)?.name}</div>
                      <div><strong>Valeur :</strong> {formData.contractValue}</div>
                    </div>
                    <div>
                      <div><strong>Contributions :</strong></div>
                      <ul className="mt-1 space-y-1">
                        {formData.contributions.map((contrib, idx) => (
                          <li key={idx} className="text-gray-600">• {contrib}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Activation du partenariat</h4>
                <p className="text-sm text-purple-700">
                  Le partenaire recevra un email avec ses identifiants de connexion et l'accès 
                  à son espace partenaire sera activé immédiatement.
                </p>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                >
                  Précédent
                </Button>
              )}
            </div>

            <div>
              {currentStep < 4 ? (
                <Button
                  variant="default"
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 && (!formData.organizationName || !formData.sector || !formData.country || !formData.description)) ||
                    (currentStep === 2 && (!formData.contactName || !formData.email || !formData.phone || !formData.position)) ||
                    (currentStep === 3 && formData.contributions.length === 0)
                  }
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Créer le Partenaire
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};