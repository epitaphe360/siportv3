import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Plus,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  CheckCircle,
  Loader,
  DollarSign,
  Package,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SupabaseService } from '../../services/supabaseService';
import useAuthStore from '../../store/authStore';
import { useExhibitorStore } from '../../store/exhibitorStore';
import { motion } from 'framer-motion';

interface NewExhibitorForm {
  // Informations entreprise
  companyName: string;
  sector: string;
  country: string;
  website: string;
  description: string;
  
  // Contact principal
  contactName: string;
  email: string;
  phone: string;
  position: string;
  
  // Informations commerciales
  packageType: 'basic' | 'premium' | 'vip';
  standSize: string;
  contractValue: string;
  paymentStatus: 'pending' | 'partial' | 'completed';
  
  // Produits
  products: Array<{
    name: string;
    category: string;
    description: string;
  }>;
}

export default function ExhibitorCreationSimulator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const { fetchExhibitors } = useExhibitorStore();
  const [formData, setFormData] = useState<NewExhibitorForm>({
    companyName: '',
    sector: '',
    country: '',
    website: '',
    description: '',
    contactName: '',
    email: '',
    phone: '',
    position: '',
    packageType: 'basic',
    standSize: '18m²',
    contractValue: '',
    paymentStatus: 'pending',
    products: []
  });

  const steps = [
    { id: 1, title: 'Entreprise', description: 'Informations générales' },
    { id: 2, title: 'Contact', description: 'Personne responsable' },
    { id: 3, title: 'Commercial', description: 'Package et tarification' },
    { id: 4, title: 'Produits', description: 'Catalogue exposant' },
    { id: 5, title: 'Validation', description: 'Vérification finale' }
  ];

  const sectors = [
    'Technologies Maritimes',
    'Équipements Portuaires',
    'Logistique & Transport',
    'Services Portuaires',
    'Consulting Maritime',
    'Formation & Éducation',
    'Développement Durable',
    'Innovation & R&D'
  ];

  const packages = [
    {
      type: 'basic',
      name: 'Package Basic',
      price: '18,000€',
      standSize: '18m²',
      features: ['Stand standard', 'Listing exposants', 'Accès networking', '2 badges exposant']
    },
    {
      type: 'premium',
      name: 'Package Premium',
      price: '45,000€',
      standSize: '36m²',
      features: ['Stand premium', 'Mini-site personnalisé', 'Conférences', '5 badges exposant', 'Networking VIP']
    },
    {
      type: 'vip',
      name: 'Package VIP',
      price: '85,000€',
      standSize: '54m²',
      features: ['Stand VIP', 'Branding premium', 'Keynote speaker', '10 badges exposant', 'Soirée exclusive']
    }
  ];

  const handleNextStep = () => {
    if (currentStep < 5) {
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

      // 1. Créer d'abord l'utilisateur pour l'exposant
      const userData = {
        email: formData.email,
        name: formData.contactName,
        type: 'exhibitor' as const,
        profile: {
          firstName: formData.contactName.split(' ')[0] || '',
          lastName: formData.contactName.split(' ').slice(1).join(' ') || '',
          company: formData.companyName,
          position: formData.position,
          phone: formData.phone,
          country: formData.country,
          website: formData.website,
          bio: formData.description,
          interests: [],
          objectives: [],
          sectors: [formData.sector],
          products: [],
          videos: [],
          images: [],
          participationObjectives: [],
          thematicInterests: [],
          collaborationTypes: [],
          expertise: [],
          visitObjectives: []
        }
      };

      const newUser = await SupabaseService.createUser(userData);

      // 2. Créer l'exposant
      const exhibitorData = {
        userId: newUser.id,
        companyName: formData.companyName,
        category: 'port-industry' as const, // Valeur par défaut
        sector: formData.sector,
        description: formData.description,
        logo: undefined,
        website: formData.website,
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
          address: '',
          city: '',
          country: formData.country
        }
      };

      const newExhibitor = await SupabaseService.createExhibitor(exhibitorData);

      // 3. Créer les produits associés
      for (const product of formData.products) {
        if (product.name && product.category && product.description) {
          await SupabaseService.createProduct({
            exhibitorId: newExhibitor.id,
            name: product.name,
            description: product.description,
            category: product.category,
            images: [],
            featured: false
          });
        }
      }

      // 4. Rafraîchir la liste des exposants
      await fetchExhibitors();
      
  toast.success(`🎉 Exposant créé: ${newExhibitor.companyName} (ID: ${newExhibitor.id}) — utilisateur: ${newUser.email}`);
      
      // Reset form
      setFormData({
        companyName: '',
        sector: '',
        country: '',
        website: '',
        description: '',
        contactName: '',
        email: '',
        phone: '',
        position: '',
        packageType: 'basic',
        standSize: '18m²',
        contractValue: '',
        paymentStatus: 'pending',
        products: []
      });
      
      setCurrentStep(1);
      setIsSubmitting(false);
      
    } catch (error) {
  setIsSubmitting(false);
  toast.error(error instanceof Error ? `Erreur création exposant: ${error.message}` : "Erreur inconnue lors de la création de l'exposant");
    }
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { name: '', category: '', description: '' }]
    });
  };

  const removeProduct = (index: number) => {
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index)
    });
  };

  const updateProduct = (index: number, field: string, value: string) => {
    const updatedProducts = formData.products.map((product, i) => 
      i === index ? { ...product, [field]: value } : product
    );
    setFormData({ ...formData, products: updatedProducts });
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
              Simulateur de Création d'Exposant
            </h1>
            <p className="text-gray-600">
              Créez un nouveau dossier exposant pour SIPORTS 2026
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
                    ? 'bg-blue-600 text-white border-blue-600' 
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
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Content */}
        <Card className="p-8">
          {/* Step 1: Informations Entreprise */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Informations sur l'entreprise
                </h2>
                <p className="text-gray-600">
                  Renseignez les informations générales de l'exposant
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text"
                      value={formData.companyName}
                      onChange={(e) =
                      aria-label="Company Name"> setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom de l'entreprise exposante"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secteur d'activité *
                  </label>
                  <select value={formData.sector}
                    onChange={(e) =
                aria-label="Sector"> setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <input type="text"
                      value={formData.country}
                      onChange={(e) =
                      aria-label="Country"> setFormData({ ...formData, country: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Pays de l'entreprise"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="url"
                      value={formData.website}
                      onChange={(e) =
                      aria-label="Website"> setFormData({ ...formData, website: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://entreprise.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description de l'entreprise *
                </label>
                <textarea value={formData.description}
                  onChange={(e) =
                  aria-label="Text area"> setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez l'activité principale de l'entreprise, ses spécialités et son expertise..."
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
                  Personne responsable du dossier exposant
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text"
                      value={formData.contactName}
                      onChange={(e) =
                      aria-label="Contact Name"> setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Prénom et nom du contact"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poste/Fonction *
                  </label>
                  <input type="text"
                    value={formData.position}
                    onChange={(e) =
                      aria-label="Position"> setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Directeur Commercial, CEO, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email professionnel *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="email"
                      value={formData.email}
                      onChange={(e) =
                      aria-label="Email"> setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@entreprise.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="tel"
                      value={formData.phone}
                      onChange={(e) =
                      aria-label="Phone"> setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Informations Commerciales */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Package et tarification
                </h2>
                <p className="text-gray-600">
                  Choisissez le package exposant adapté
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.type}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.packageType === pkg.type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    role="button"
        tabIndex={0}
        onClick={() => {
                      setFormData({
                        ...formData,
                        packageType: pkg.type as 'basic' | 'premium' | 'vip',
                        standSize: pkg.standSize,
                        contractValue: pkg.price
                      }
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            {
                      setFormData({
                        ...formData,
                        packageType: pkg.type as 'basic' | 'premium' | 'vip',
                        standSize: pkg.standSize,
                        contractValue: pkg.price
                      ;
          }
        }});
                    }}
                  >
                    <div className="text-center mb-4">
                      <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-bold text-lg text-gray-900">{pkg.name}</h3>
                      <p className="text-2xl font-bold text-blue-600 mt-2">{pkg.price}</p>
                      <p className="text-sm text-gray-600">{pkg.standSize}</p>
                    </div>
                    
                    <ul className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut du paiement
                  </label>
                  <select value={formData.paymentStatus}
                    onChange={(e) =
                aria-label="Payment Status"> setFormData({ ...formData, paymentStatus: e.target.value as 'pending' | 'partial' | 'completed' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">En attente</option>
                    <option value="partial">Acompte versé</option>
                    <option value="completed">Paiement complet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur du contrat
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text"
                      value={formData.contractValue}
                      onChange={(e) =
                      aria-label="Contract Value"> setFormData({ ...formData, contractValue: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Montant du contrat"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Produits */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Catalogue produits
                </h2>
                <p className="text-gray-600">
                  Ajoutez les produits et services de l'exposant
                </p>
              </div>

              <div className="space-y-4">
                {formData.products.map((product, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Produit {index + 1}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeProduct(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom du produit
                        </label>
                        <input type="text"
                          value={product.name}
                          onChange={(e) =
                      aria-label="Text"> updateProduct(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nom du produit/service"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Catégorie
                        </label>
                        <select value={product.category}
                          onChange={(e) =
                aria-label="Category"> updateProduct(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sélectionnez une catégorie</option>
                          <option value="Software">Logiciel</option>
                          <option value="Hardware">Équipement</option>
                          <option value="Service">Service</option>
                          <option value="Consulting">Conseil</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea value={product.description}
                        onChange={(e) =
                  aria-label="Text area"> updateProduct(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Description du produit/service"
                      />
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addProduct}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Validation */}
          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Validation du dossier
                </h2>
                <p className="text-gray-600">
                  Vérifiez les informations avant soumission
                </p>
              </div>

              {/* Récapitulatif */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Entreprise</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nom :</strong> {formData.companyName}</div>
                    <div><strong>Secteur :</strong> {formData.sector}</div>
                    <div><strong>Pays :</strong> {formData.country}</div>
                    <div><strong>Site web :</strong> {formData.website}</div>
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

                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Commercial</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Package :</strong> {packages.find(p => p.type === formData.packageType)?.name}</div>
                    <div><strong>Taille stand :</strong> {formData.standSize}</div>
                    <div><strong>Valeur :</strong> {formData.contractValue}</div>
                    <div><strong>Paiement :</strong> {formData.paymentStatus}</div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Produits</h4>
                  <div className="space-y-1 text-sm">
                    {formData.products.map((product, idx) => (
                      <div key={idx}>• {product.name} ({product.category})</div>
                    ))}
                    {formData.products.length === 0 && (
                      <div className="text-gray-500">Aucun produit ajouté</div>
                    )}
                  </div>
                </Card>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Processus de validation</h4>
                <p className="text-sm text-blue-700">
                  Après soumission, le dossier sera examiné par l'équipe commerciale puis validé par l'administration. 
                  L'exposant recevra un email de confirmation une fois son compte activé.
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
              {currentStep < 5 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 && (!formData.companyName || !formData.sector || !formData.country || !formData.description)) ||
                    (currentStep === 2 && (!formData.contactName || !formData.email || !formData.phone || !formData.position))
                  }
                >
                  Suivant
                </Button>
              ) : (
                <Button
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
                      Créer le Dossier Exposant
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