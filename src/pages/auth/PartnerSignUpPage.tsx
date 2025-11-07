
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { countries } from '@/utils/countries';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { Building, Mail, Lock, User, Phone, Globe, Briefcase, MapPin } from 'lucide-react';

// Validation renforcée du mot de passe
const passwordSchema = z.string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Le mot de passe doit contenir au moins un caractère spécial");

// Validation du téléphone international
const phoneSchema = z.string()
  .min(5, "Le numéro de téléphone est requis")
  .regex(/^\+?[1-9]\d{1,14}$/, "Format international invalide (ex: +237612345678)");

const partnerSignUpSchema = z.object({
  companyName: z.string().min(2, "Le nom de l'organisation est requis"),
  sector: z.string().min(2, "Le secteur d'activité est requis"),
  country: z.string().min(2, "Le pays est requis"),
  website: z.string().url("L'URL du site web est invalide").optional().or(z.literal('')),
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom de famille est requis"),
  position: z.string().min(2, "Le poste est requis"),
  email: z.string().email("L'adresse e-mail est invalide"),
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
  companyDescription: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  partnershipType: z.string().min(2, "Le type de partenariat est requis"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions générales",
  }),
  acceptPrivacy: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter la politique de confidentialité",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type PartnerSignUpFormValues = z.infer<typeof partnerSignUpSchema>;

export default function PartnerSignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PartnerSignUpFormValues>({
    resolver: zodResolver(partnerSignUpSchema),
    defaultValues: {
      acceptTerms: false,
      acceptPrivacy: false,
    }
  });

  // Watch les valeurs pour la progression
  const watchedFields = watch();

  // Calculer la progression
  const getProgressSteps = () => {
    const orgComplete = !!(watchedFields.companyName && watchedFields.sector && watchedFields.country);
    const contactComplete = !!(watchedFields.firstName && watchedFields.lastName && watchedFields.email && watchedFields.phone);
    const authComplete = !!(watchedFields.password && watchedFields.confirmPassword && watchedFields.password === watchedFields.confirmPassword);
    const detailsComplete = !!(watchedFields.companyDescription && watchedFields.partnershipType);
    const termsComplete = !!(watchedFields.acceptTerms && watchedFields.acceptPrivacy);

    return [
      { id: 'org', label: 'Organisation', completed: orgComplete },
      { id: 'contact', label: 'Contact', completed: contactComplete },
      { id: 'auth', label: 'Sécurité', completed: authComplete },
      { id: 'details', label: 'Détails', completed: detailsComplete },
      { id: 'terms', label: 'CGU', completed: termsComplete },
    ];
  };

  useEffect(() => {
    register('partnershipType');
    register('country');
    register('acceptTerms');
    register('acceptPrivacy');
  }, [register]);

  const onSubmit: SubmitHandler<PartnerSignUpFormValues> = async (data) => {
    setIsLoading(true);
    const { email, password, confirmPassword, acceptTerms, acceptPrivacy, ...profileData } = data;

    const finalProfileData = {
      ...profileData,
      role: 'partner' as const,
      status: 'pending' as const,
    };

    try {
      const { error } = await signUp({ email, password }, finalProfileData);

      if (error) {
        throw error;
      }

      toast.success('Inscription réussie ! Votre compte est en attente de validation.');
      navigate(ROUTES.SIGNUP_SUCCESS);
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error((error as Error).message || "Une erreur s'est produite lors de l'inscription.");
    } finally {
      setIsLoading(false);
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
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Devenir Partenaire SIPORTS 2026</h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez notre écosystème et contribuez au succès de l'événement.
          </p>
        </div>

        {/* Indicateur de progression */}
        <Card className="p-6">
          <ProgressSteps steps={getProgressSteps()} />
        </Card>

        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations sur l'organisation */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informations sur l'Organisation</h3>
                <div>
                  <Label htmlFor="companyName">Nom de l'organisation *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="companyName" {...register('companyName')} placeholder="Nom de votre organisation" className="pl-10" />
                  </div>
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="sector">Secteur d'activité *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="sector" {...register('sector')} placeholder="Ex: Logistique, Technologie, Institutionnel" className="pl-10" />
                  </div>
                  {errors.sector && <p className="text-red-500 text-xs mt-1">{errors.sector.message}</p>}
                </div>
                <div>
                  <Label htmlFor="country">Pays *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                    <Select onValueChange={(value: string) => setValue('country', value)} defaultValue="">
                      <SelectTrigger id="country" className="pl-10">
                        <SelectValue placeholder="Sélectionnez votre pays" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.name}>
                            {country.name} ({country.dial})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                </div>
                <div>
                  <Label htmlFor="website">Site web</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="website" {...register('website')} placeholder="https://votre-site.com" className="pl-10" />
                  </div>
                  {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
                </div>
                 <div>
                  <Label htmlFor="partnershipType">Type de partenariat souhaité *</Label>
                  <Select onValueChange={(value: string) => setValue('partnershipType', value)} defaultValue="">
                    <SelectTrigger id="partnershipType">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="institutionnel">Institutionnel</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="technologique">Technologique</SelectItem>
                      <SelectItem value="financier">Financier</SelectItem>
                      <SelectItem value="logistique">Logistique</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.partnershipType && <p className="text-red-500 text-xs mt-1">{errors.partnershipType.message}</p>}
                </div>
              </div>

              {/* Informations de contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informations de Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input id="firstName" {...register('firstName')} placeholder="Votre prénom" className="pl-10" />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input id="lastName" {...register('lastName')} placeholder="Votre nom" />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="position">Poste / Fonction *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="position" {...register('position')} placeholder="Votre poste" className="pl-10" />
                  </div>
                  {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Adresse e-mail professionnelle *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      {...register('email')} 
                      placeholder="contact@votre-organisation.com" 
                      className="pl-10"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  <p className="text-xs text-gray-500 mt-1">Utilisez votre email professionnel</p>
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      id="phone" 
                      {...register('phone')} 
                      placeholder="+237 6 12 34 56 78" 
                      className="pl-10"
                      autoComplete="tel"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  <p className="text-xs text-gray-500 mt-1">Format international (ex: +237612345678)</p>
                </div>
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
                  <PasswordStrengthIndicator password={watchedFields.password || ''} />
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

            {/* Description */}
            <div>
              <Label htmlFor="companyDescription">Description de votre organisation et de vos motivations *</Label>
              <Textarea 
                id="companyDescription" 
                {...register('companyDescription')} 
                rows={4} 
                placeholder="Décrivez votre organisation, vos activités et pourquoi vous souhaitez devenir partenaire de SIPORTS 2026." 
              />
              {errors.companyDescription && <p className="text-red-500 text-xs mt-1">{errors.companyDescription.message}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {watchedFields.companyDescription?.length || 0} / 20 caractères minimum
              </p>
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
                      {' '}* 
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

            <div>
              <Button type="submit" className="w-full" disabled={isLoading} variant="default">
                {isLoading ? 'Envoi en cours...' : "Demander à devenir partenaire"}
              </Button>
              <p className="text-center text-xs text-gray-500 mt-2">
                * Champs obligatoires
              </p>
            </div>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-700 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

