import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Lock,
  Building2,
  Globe,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Anchor,
  AlertCircle,
  Loader,
  CheckCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { ROUTES } from '../../lib/routes';
import { supabase } from '../../lib/supabase';

const registrationSchema = z.object({
  accountType: z.enum(['exhibitor', 'partner', 'visitor']),
  companyName: z.string().optional(),
  sector: z.string().min(2, 'Secteur d\'activité requis'),
  country: z.string().min(2, 'Pays requis'),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  position: z.string().optional(),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone requis'),
  linkedin: z.string().url('URL LinkedIn invalide').optional().or(z.literal('')),
  description: z.string().min(50, 'Description trop courte (minimum 50 caractères)'),
  objectives: z.array(z.string()).min(1, 'Sélectionnez au moins un objectif'),
  password: z.string()
    .min(12, 'Minimum 12 caractères')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Doit contenir au moins un caractère spécial (!@#$%^&*...)'),
  confirmPassword: z.string()
}).refine((data) => {
  // Validation du mot de passe
  if (data.password !== data.confirmPassword) {
    return false;
  }
  
  // Validation conditionnelle pour exposants et partenaires
  if (data.accountType === 'exhibitor' || data.accountType === 'partner') {
    if (!data.companyName || data.companyName.length < 2) {
      return false;
    }
    if (!data.position || data.position.length < 2) {
      return false;
    }
  }
  
  return true;
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
}).refine((data) => {
  if ((data.accountType === 'exhibitor' || data.accountType === 'partner') && (!data.companyName || data.companyName.length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Nom de l'entreprise requis pour les exposants et partenaires",
  path: ["companyName"],
}).refine((data) => {
  if ((data.accountType === 'exhibitor' || data.accountType === 'partner') && (!data.position || data.position.length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Poste requis pour les exposants et partenaires",
  path: ["position"],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange'
  });

  const watchedAccountType = watch('accountType');

  const steps = [
    { id: 1, title: 'Type de compte', description: 'Choisissez votre profil' },
    { id: 2, title: 'Entreprise', description: 'Informations générales' },
    { id: 3, title: 'Contact', description: 'Vos coordonnées' },
    { id: 4, title: 'Profil', description: 'Description et objectifs' },
    { id: 5, title: 'Sécurité', description: 'Mot de passe' }
  ];

  const accountTypes = [
    {
      value: 'exhibitor',
      title: 'Exposant',
      description: 'Entreprise ou organisation exposante',
      icon: Building2,
      color: 'bg-blue-100 text-blue-600 border-blue-200'
    },
    {
      value: 'partner',
      title: 'Partenaire',
      description: 'Sponsor ou partenaire officiel',
      icon: Globe,
      color: 'bg-green-100 text-green-600 border-green-200'
    },
    {
      value: 'visitor',
      title: 'Visiteur',
      description: 'Professionnel ou particulier visitant le salon',
      icon: User,
      color: 'bg-purple-100 text-purple-600 border-purple-200'
    }
  ];

  const sectors = [
    'Autorité Portuaire',
    'Opérateur de Terminal',
    'Transport Maritime',
    'Logistique',
    'Équipements Portuaires',
    'Services Maritimes',
    'Consulting',
    'Technologie',
    'Formation',
    'Institutionnel',
    'Autre'
  ];

  const objectives = [
    ...(watchedAccountType === 'visitor' ? [
      'Découvrir les innovations portuaires',
      'Assister aux conférences',
      'Rencontrer des professionnels',
      'Apprendre sur le secteur maritime',
      'Explorer les opportunités de carrière',
      'Développer mes connaissances',
      'Identifier des solutions pour mon entreprise',
      'Participer aux événements networking'
    ] : [
      'Trouver de nouveaux partenaires',
      'Développer mon réseau',
      'Présenter mes innovations',
      'Identifier des fournisseurs',
      'Explorer de nouveaux marchés',
      'Participer aux conférences',
      'Rencontrer des investisseurs',
      'Échanger sur les bonnes pratiques'
    ])
  ];

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof RegistrationForm)[] => {
    switch (step) {
      case 1: return ['accountType'];
      case 2: return ['companyName', 'sector', 'country', 'website'];
      case 3: return ['firstName', 'lastName', 'position', 'email', 'phone', 'linkedin'];
      case 4: return ['description', 'objectives'];
      case 5: return ['password', 'confirmPassword'];
      default: return [];
    }
  };

  const onSubmit = async (data: RegistrationForm) => {
    try {
      await registerUser(data);
  navigate(ROUTES.LOGIN, { 
        state: { message: 'Inscription réussie ! Votre compte est en attente de validation.' }
      });
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-white p-3 rounded-lg">
              <Anchor className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">SIPORTS</span>
              <span className="text-sm text-blue-200 block leading-none">2026</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Créer un compte
          </h1>
          <p className="text-blue-100">
            Rejoignez la plus grande communauté portuaire mondiale
          </p>
        </motion.div>

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
                    ? 'bg-white text-blue-600 border-white' 
                    : 'bg-transparent text-white border-white/30'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-white' : 'text-white/60'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-white/60">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-white' : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Account Type */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Quel est votre profil ?
                    </h2>
                    <p className="text-gray-600">
                      Sélectionnez le type de compte qui correspond à votre organisation
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {accountTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <label key={type.value} className="cursor-pointer">
                          <input
                            type="radio"
                            value={type.value}
                            {...register('accountType')}
                            className="sr-only"
                          />
                          <div className={`p-6 border-2 rounded-lg transition-all ${
                            watchedAccountType === type.value
                              ? type.color
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <Icon className="h-8 w-8 mb-4" />
                            <h3 className="font-semibold text-lg mb-2">{type.title}</h3>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {errors.accountType && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{errors.accountType.message}</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Company Information */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Informations sur votre organisation
                    </h2>
                    <p className="text-gray-600">
                      Présentez votre entreprise ou organisation
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
                          {...register('companyName')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nom de votre entreprise"
                        />
                      </div>
                      {errors.companyName && (
                        <p className="text-red-600 text-sm mt-1">{errors.companyName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secteur d'activité *
                      </label>
                      <select
                        {...register('sector')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionnez un secteur</option>
                        {sectors.map((sector) => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                      {errors.sector && (
                        <p className="text-red-600 text-sm mt-1">{errors.sector.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pays *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          {...register('country')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Pays de votre organisation"
                        />
                      </div>
                      {errors.country && (
                        <p className="text-red-600 text-sm mt-1">{errors.country.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site web
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="url"
                          {...register('website')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://votre-site.com"
                        />
                      </div>
                      {errors.website && (
                        <p className="text-red-600 text-sm mt-1">{errors.website.message}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Contact Information */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Vos coordonnées
                    </h2>
                    <p className="text-gray-600">
                      Informations de contact du représentant principal
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          {...register('firstName')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Votre prénom"
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          {...register('lastName')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Votre nom"
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Poste/Fonction *
                      </label>
                      <input
                        type="text"
                        {...register('position')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Votre fonction dans l'organisation"
                      />
                      {errors.position && (
                        <p className="text-red-600 text-sm mt-1">{errors.position.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email professionnel *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          {...register('email')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="votre@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          {...register('phone')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        {...register('linkedin')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://linkedin.com/in/votre-profil"
                      />
                      {errors.linkedin && (
                        <p className="text-red-600 text-sm mt-1">{errors.linkedin.message}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Profile & Objectives */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Votre profil professionnel
                    </h2>
                    <p className="text-gray-600">
                      Décrivez votre organisation et vos objectifs
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description de votre organisation *
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Décrivez votre organisation, vos activités principales, vos spécialités..."
                    />
                    {errors.description && (
                      <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vos objectifs pour SIPORTS 2026 *
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      Sélectionnez tous les objectifs qui correspondent à vos attentes
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {objectives.map((objective) => (
                        <label key={objective} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            value={objective}
                            {...register('objectives')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{objective}</span>
                        </label>
                      ))}
                    </div>
                    {errors.objectives && (
                      <p className="text-red-600 text-sm mt-1">{errors.objectives.message}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Security */}
              {currentStep === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Sécurité de votre compte
                    </h2>
                    <p className="text-gray-600">
                      Créez un mot de passe sécurisé pour protéger votre compte
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...register('password')}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le mot de passe *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...register('confirmPassword')}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Validation de votre compte</h4>
                    <p className="text-sm text-blue-700">
                      Après votre inscription, votre compte sera examiné par notre équipe. 
                      Vous recevrez un email de confirmation une fois votre compte validé.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-gray-200">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                    >
                      Précédent
                    </Button>
                  )}
                </div>

                <div>
                  {currentStep < 5 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader className="animate-spin h-4 w-4 mr-2" />
                          Création du compte...
                        </>
                      ) : (
                        'Créer mon compte'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte ?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Se connecter
                </Link>
              </p>
            </div>

            {/* Social Registration */}
            {import.meta.env.VITE_FIREBASE_API_KEY && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Ou s'inscrire avec</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center"
                    onClick={async () => {
                      try {
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: 'google',
                          options: {
                            redirectTo: `${window.location.origin}/dashboard`,
                            queryParams: {
                              access_type: 'offline',
                              prompt: 'consent',
                            }
                          }
                        });
                        if (error) throw error;
                      } catch (err: any) {
                        alert(`Erreur: ${err.message}`);
                      }
                    }}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center"
                    onClick={async () => {
                      try {
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: 'linkedin_oidc',
                          options: {
                            redirectTo: `${window.location.origin}/dashboard`
                          }
                        });
                        if (error) throw error;
                      } catch (err: any) {
                        alert(`Erreur: ${err.message}`);
                      }
                    }}
                  >
                    <svg className="h-5 w-5 mr-2" fill="#0A66C2" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};