import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { useRecaptcha } from '../../hooks/useRecaptcha';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Textarea } from '../../components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { ROUTES } from '../../lib/routes';
import { motion } from 'framer-motion';
import { Building, Mail, Lock, Phone, Briefcase, Globe, AlertCircle, Languages, Save } from 'lucide-react';
import { countries } from '../../utils/countries';
import { PasswordStrengthIndicator } from '../../components/ui/PasswordStrengthIndicator';
import { ProgressSteps } from '../../components/ui/ProgressSteps';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { PreviewModal } from '../../components/ui/PreviewModal';
import { useFormAutoSave } from '../../hooks/useFormAutoSave';
import { useEmailValidation } from '../../hooks/useEmailValidation';
import { translations, Language } from '../../utils/translations';
import { toast } from 'react-hot-toast';
import { SubscriptionSelector } from '../../components/exhibitor/SubscriptionSelector';
import { ExhibitorLevel } from '../../config/exhibitorQuotas';
import { supabase } from '../../lib/supabase';


const MAX_DESCRIPTION_LENGTH = 500;

// Schéma de validation Zod
const exhibitorSignUpSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  companyName: z.string().min(2, "Le nom de l'entreprise est requis"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().regex(/^[\d\s\-+()]+$/, "Numéro de téléphone invalide"),
  country: z.string().min(2, "Veuillez sélectionner un pays"),
  position: z.string().min(2, "Le poste est requis"),
  sectors: z.array(z.string()).min(1, "Sélectionnez au moins un secteur"),
  companyDescription: z.string().min(20, "La description doit contenir au moins 20 caractères").max(MAX_DESCRIPTION_LENGTH),
  website: z.string().url("URL invalide").optional().or(z.literal('')),
  standArea: z.number().min(1, "Veuillez sélectionner un abonnement exposant"),
  subscriptionLevel: z.string().min(1, "Veuillez sélectionner un abonnement"),
  subscriptionPrice: z.number().min(1, "Prix d'abonnement requis"),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[!@#$%^&*]/, "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions générales d'utilisation",
  }),
  acceptPrivacy: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter la politique de confidentialité",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ExhibitorSignUpFormValues = z.infer<typeof exhibitorSignUpSchema>;

export default function ExhibitorSignUpPage() {
  const navigate = useNavigate();
  const { signUp, loginWithGoogle, loginWithLinkedIn } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [language, setLanguage] = useState<Language>('fr');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);
  const { executeRecaptcha, isReady: isRecaptchaReady } = useRecaptcha();

  const t = translations[language];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ExhibitorSignUpFormValues>({
    resolver: zodResolver(exhibitorSignUpSchema),
    mode: 'onChange',
  });

  const watchedFields = watch();
  
  // Auto-save functionality
  const { loadFromLocalStorage, clearLocalStorage } = useFormAutoSave<ExhibitorSignUpFormValues>({ 
    key: 'exhibitor-signup-draft',
    data: watchedFields,
    delay: 2000
  });
  
  // Email validation
  const { suggestion: emailSuggestion } = useEmailValidation(watchedFields.email || '');

  // Options pour les secteurs d'activité
  const sectorsOptions = [
    { value: 'technologie', label: 'Technologie' },
    { value: 'logistique', label: 'Logistique' },
    { value: 'media', label: 'Média' },
    { value: 'finance', label: 'Finance' },
    { value: 'sante', label: 'Santé' },
    { value: 'education', label: 'Éducation' },
    { value: 'tourisme', label: 'Tourisme' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'industrie', label: 'Industrie' },
    { value: 'commerce', label: 'Commerce' },
    { value: 'services', label: 'Services' },
    { value: 'institutionnel', label: 'Institutionnel' },
  ];

  // Charger le brouillon au montage
  useEffect(() => {
    const draft = loadFromLocalStorage();
    if (draft && Object.keys(draft).length > 0) {
      const loadDraft = window.confirm('Un brouillon a été trouvé. Voulez-vous le restaurer ?');
      if (loadDraft) {
        Object.entries(draft).forEach(([key, value]) => {
          setValue(key as keyof ExhibitorSignUpFormValues, value);
        });
      } else {
        clearLocalStorage();
      }
    }
  }, [loadFromLocalStorage, clearLocalStorage, setValue]);

  // Fonction pour calculer les étapes de progression
  const getProgressSteps = () => {
    const steps = [
      {
        id: '1',
        label: 'Abonnement Exposant',
        completed: !!(watchedFields.subscriptionLevel && watchedFields.standArea && watchedFields.subscriptionPrice),
      },
      {
        id: '2',
        label: 'Informations Entreprise',
        completed: !!(watchedFields.companyName && watchedFields.sectors?.length > 0 && watchedFields.country),
      },
      {
        id: '3',
        label: 'Informations Personnelles',
        completed: !!(watchedFields.firstName && watchedFields.lastName && watchedFields.position),
      },
      {
        id: '4',
        label: 'Contact',
        completed: !!(watchedFields.email && watchedFields.phone),
      },
      {
        id: '5',
        label: 'Sécurité',
        completed: !!(watchedFields.password && watchedFields.confirmPassword && watchedFields.password === watchedFields.confirmPassword),
      },
      {
        id: '6',
        label: 'Conditions',
        completed: !!(watchedFields.acceptTerms && watchedFields.acceptPrivacy),
      },
    ];

    const completedCount = steps.filter(step => step.completed).length;
    const percentage = Math.round((completedCount / steps.length) * 100);

    return { steps, percentage };
  };

  const handlePreviewSubmit = () => {
    setShowPreview(true);
  };

  const onSubmit: SubmitHandler<ExhibitorSignUpFormValues> = async (data) => {
    setIsLoading(true);
    const { email, password, confirmPassword, acceptTerms, acceptPrivacy, sectors, standArea, subscriptionLevel, subscriptionPrice, ...profileData } = data;

    const finalProfileData = {
      ...profileData,
      sector: sectors.join(', '), // Convertir le tableau en string
      role: 'exhibitor' as const,
      status: 'pending' as const,
      standArea, // Ajouter la surface du stand
      subscriptionLevel, // Ajouter le niveau d'abonnement
    };

    try {
      // 🔐 Exécuter reCAPTCHA avant inscription
      let recaptchaToken: string | undefined;
      if (isRecaptchaReady) {
        try {
          recaptchaToken = await executeRecaptcha('exhibitor_registration');
        } catch (recaptchaError) {
          console.warn('⚠️ reCAPTCHA failed, proceeding without:', recaptchaError);
        }
      }

      // @ts-expect-error - recaptchaToken sera ajouté à authStore.signUp()
      const { error, data: userData } = await signUp({ email, password }, finalProfileData, recaptchaToken);

      if (error) {
        throw error;
      }

      // 💰 Créer la demande de paiement
      if (userData?.user?.id) {
        // Générer référence de paiement unique
        const paymentReference = `EXH-2026-${userData.user.id.substring(0, 8).toUpperCase()}`;

        const { error: paymentError } = await supabase
          .from('payment_requests')
          .insert({
            user_id: userData.user.id,
            amount: subscriptionPrice,
            currency: 'USD',
            status: 'pending',
            payment_method: 'bank_transfer',
            reference: paymentReference,
            description: `Abonnement Exposant SIPORTS 2026 - ${subscriptionLevel} (${standArea}m²)`,
            metadata: {
              subscriptionLevel,
              standArea,
              eventName: 'SIPORTS 2026',
              eventDates: '5-7 Février 2026'
            }
          });

        if (paymentError) {
          console.error('Erreur création demande paiement:', paymentError);
          // Ne pas bloquer l'inscription si la création de paiement échoue
        }

        // 📧 Envoyer email avec instructions de paiement
        try {
          const { error: emailError } = await supabase.functions.invoke('send-exhibitor-payment-instructions', {
            body: {
              email,
              name: `${profileData.firstName} ${profileData.lastName}`,
              companyName: profileData.companyName,
              subscriptionLevel,
              standArea,
              amount: subscriptionPrice,
              paymentReference,
              userId: userData.user.id
            }
          });

          if (emailError) {
            console.warn('⚠️ Email de paiement non envoyé:', emailError);
            // Ne pas bloquer si l'email échoue
          }
        } catch (emailError) {
          console.warn('⚠️ Edge function email non disponible:', emailError);
        }
      }

      // Supprimer le brouillon après succès
      clearLocalStorage();

      toast.success(
        'Inscription réussie ! Un email avec les instructions de paiement vous a été envoyé.',
        { duration: 5000 }
      );
      navigate(ROUTES.PENDING_ACCOUNT);
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error((error as Error).message || "Une erreur s'est produite lors de l'inscription.");
    } finally {
      setIsLoading(false);
      setShowPreview(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-4xl w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Sélecteur de langue */}
        <div className="flex justify-end gap-2">
          {(['fr', 'en', 'ar'] as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                language === lang
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <Languages className="h-4 w-4" />
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Inscription Exposant SIPORTS 2026
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez notre écosystème et présentez vos produits et services.
          </p>
        </div>

        {/* Indicateur de progression */}
        <Card className="p-6">
          <ProgressSteps steps={getProgressSteps().steps} />
        </Card>

        <Card className="p-8">
          <form onSubmit={handleSubmit(handlePreviewSubmit)} className="space-y-8">
            {/* Section 0: Sélection d'abonnement */}
            <div className="space-y-6">
              <SubscriptionSelector
                selectedLevel={watchedFields.subscriptionLevel as ExhibitorLevel}
                onSelect={(level, area, price) => {
                  setValue('subscriptionLevel', level);
                  setValue('standArea', area);
                  setValue('subscriptionPrice', price);
                }}
              />
              {errors.subscriptionLevel && (
                <p className="text-red-500 text-sm text-center font-medium">
                  {errors.subscriptionLevel.message}
                </p>
              )}
            </div>

            {/* Section 1: Informations sur l'entreprise */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">
                Informations sur votre entreprise
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      id="companyName" 
                      {...register('companyName')} 
                      placeholder="Votre entreprise" 
                      className="pl-10"
                      autoComplete="organization"
                    />
                  </div>
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                </div>

                <div>
                  <Label htmlFor="sectors">Secteur(s) d'activité *</Label>
                  <MultiSelect
                    label="Secteurs d'activité"
                    options={sectorsOptions}
                    selectedValues={watchedFields.sectors || []}
                    onChange={(values) => setValue('sectors', values)}
                    placeholder="Sélectionnez vos secteurs d'activité"
                    maxSelections={3}
                  />
                  {errors.sectors && <p className="text-red-500 text-xs mt-1">{errors.sectors.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="country">Pays *</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                    <Select onValueChange={(value: string) => setValue('country', value)} defaultValue="">
                      <SelectTrigger id="country" className="pl-10">
                        <SelectValue placeholder="Sélectionnez votre pays" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name} (+{country.dial})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                </div>

                <div>
                  <Label htmlFor="website">Site web (optionnel)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      id="website" 
                      type="url"
                      {...register('website')} 
                      placeholder="https://www.example.com" 
                      className="pl-10"
                      autoComplete="url"
                    />
                  </div>
                  {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="companyDescription">Description de votre organisation *</Label>
                <Textarea 
                  id="companyDescription" 
                  {...register('companyDescription')} 
                  rows={4}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  placeholder="Décrivez votre organisation, vos activités et vos objectifs pour SIPORTS 2026." 
                />
                {errors.companyDescription && <p className="text-red-500 text-xs mt-1">{errors.companyDescription.message}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {watchedFields.companyDescription?.length || 0} / {MAX_DESCRIPTION_LENGTH} caractères
                </p>
              </div>
            </div>

            {/* Section 2: Informations personnelles */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 pb-3">
                Vos informations personnelles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input 
                    id="firstName" 
                    {...register('firstName')} 
                    placeholder="Votre prénom"
                    autoComplete="given-name"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input 
                    id="lastName" 
                    {...register('lastName')} 
                    placeholder="Votre nom"
                    autoComplete="family-name"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="position">Poste / Fonction *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    id="position" 
                    {...register('position')} 
                    placeholder="Votre poste" 
                    className="pl-10"
                  />
                </div>
                {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>}
              </div>
            </div>

            {/* Section 3: Coordonnées de contact */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 pb-3">
                Coordonnées de contact
              </h3>

              <div>
                <Label htmlFor="email">Adresse e-mail professionnelle *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    {...register('email')} 
                    placeholder="contact@votre-entreprise.com" 
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                {emailSuggestion && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <p className="text-xs text-yellow-700">
                      Voulez-vous dire{' '}
                      <button
                        type="button"
                        onClick={() => {
                          if (emailSuggestion) {
                            setValue('email', emailSuggestion.suggestion);
                          }
                        }}
                        className="font-semibold underline hover:text-yellow-900"
                      >
                        {emailSuggestion.suggestion}
                      </button>
                      ?
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Utilisez votre email professionnel</p>
              </div>

              <div>
                <Label htmlFor="phone">Téléphone professionnel *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    id="phone" 
                    type="tel" 
                    {...register('phone')} 
                    placeholder="+33 1 23 45 67 89" 
                    className="pl-10"
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Section 4: Sécurité */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 pb-3">
                Informations de sécurité
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      id="password" 
                      type="password" 
                      {...register('password')} 
                      placeholder="Créez un mot de passe sécurisé" 
                      className="pl-10"
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  {watchedFields.password && <PasswordStrengthIndicator password={watchedFields.password} />}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      {...register('confirmPassword')} 
                      placeholder="Confirmez votre mot de passe" 
                      className="pl-10"
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>

            {/* CGU et RGPD */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900">Conditions Générales</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    {...register('acceptTerms')}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
                      J'accepte les{' '}
                      <Link to={ROUTES.TERMS} target="_blank" className="text-primary-600 hover:text-primary-700 underline">
                        Conditions Générales d'Utilisation
                      </Link>
                      {' '}de SIPORTS 2026 *
                    </label>
                    {errors.acceptTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptTerms.message}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptPrivacy"
                    {...register('acceptPrivacy')}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="acceptPrivacy" className="text-sm text-gray-700 cursor-pointer">
                      J'accepte la{' '}
                      <Link to={ROUTES.PRIVACY} target="_blank" className="text-primary-600 hover:text-primary-700 underline">
                        Politique de Confidentialité
                      </Link>
                      {' '}et consent au traitement de mes données personnelles conformément au RGPD *
                    </label>
                    {errors.acceptPrivacy && <p className="text-red-500 text-xs mt-1">{errors.acceptPrivacy.message}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-900">
                  <strong>Protection de vos données :</strong> Vos informations personnelles sont sécurisées et ne seront jamais partagées avec des tiers sans votre consentement. Vous pouvez exercer vos droits d'accès, de rectification et de suppression à tout moment.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? 'Envoi en cours...' : "Prévisualiser et soumettre"}
              </Button>
              
              {watchedFields && Object.keys(watchedFields).length > 0 && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Save className="h-3 w-3" />
                  <span>Brouillon enregistré automatiquement</span>
                </div>
              )}

              <p className="text-center text-xs text-gray-500">
                * Champs obligatoires
              </p>
            </div>
          </form>

          {/* Modal de prévisualisation */}
          <PreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            onConfirm={handleSubmit(onSubmit)}
            data={watchedFields}
          />
        </Card>

        {/* Séparateur "OU" */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 text-gray-500">Ou s'inscrire avec</span>
          </div>
        </div>

        {/* Boutons OAuth */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-3 py-3 border-2 hover:bg-gray-50 transition-colors"
              disabled={isGoogleLoading || isLinkedInLoading}
              onClick={async () => {
                try {
                  setIsGoogleLoading(true);
                  await loginWithGoogle();
                  toast.success('Connexion avec Google réussie !');
                  navigate('/dashboard');
                } catch (error) {
                  console.error('Google login error:', error);
                  toast.error('Erreur lors de la connexion avec Google');
                } finally {
                  setIsGoogleLoading(false);
                }
              }}
            >
              {isGoogleLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
                  <span className="font-medium text-gray-700">Connexion...</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-medium text-gray-700">Google</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-3 py-3 border-2 hover:bg-gray-50 transition-colors"
              disabled={isGoogleLoading || isLinkedInLoading}
              onClick={async () => {
                try {
                  setIsLinkedInLoading(true);
                  await loginWithLinkedIn();
                  toast.success('Connexion avec LinkedIn réussie !');
                  navigate('/dashboard');
                } catch (error) {
                  console.error('LinkedIn login error:', error);
                  toast.error('Erreur lors de la connexion avec LinkedIn');
                } finally {
                  setIsLinkedInLoading(false);
                }
              }}
            >
              {isLinkedInLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
                  <span className="font-medium text-gray-700">Connexion...</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="font-medium text-gray-700">LinkedIn</span>
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-4">
            En vous inscrivant, vous acceptez nos{' '}
            <Link to={ROUTES.TERMS} className="text-primary-600 hover:underline">
              Conditions d'utilisation
            </Link>
          </p>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-primary-600 hover:text-primary-700 underline">
              Connectez-vous
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
