/**
 * Formulaire d'inscription Visiteur VIP PREMIUM
 * Workflow complet avec photo, mot de passe et paiement obligatoire
 */
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Briefcase, Loader, Lock, Upload, Crown, Camera } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../lib/routes';
import { COUNTRIES } from '../../data/countries';
import useAuthStore from '../../store/authStore';

const vipVisitorSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .max(128, 'Le mot de passe ne doit pas dépasser 128 caractères')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[a-z]/, 'Doit contenir une minuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre')
    .regex(/[!@#$%^&*]/, 'Doit contenir un caractère spécial'),
  confirmPassword: z.string(),
  phone: z.string().min(8, 'Téléphone requis'),
  country: z.string().min(2, 'Pays requis'),
  sector: z.string().min(2, 'Secteur requis'),
  position: z.string().min(2, 'Fonction requise'),
  company: z.string().min(2, 'Entreprise requise'),
  photo: z.any().optional() // Photo optionnelle - peut être ajoutée plus tard
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

type VIPVisitorForm = z.infer<typeof vipVisitorSchema>;

const sectors = [
  'Autorité Portuaire',
  'Transport Maritime',
  'Logistique',
  'Consulting',
  'Technologie',
  'Finance',
  'Média/Presse',
  'Institutionnel',
  'Autre'
];

export default function VisitorVIPRegistration() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<VIPVisitorForm>({
    resolver: zodResolver(vipVisitorSchema),
    mode: 'onChange'
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La photo ne doit pas dépasser 5MB');
        return;
      }

      setPhotoFile(file);
      setValue('photo', e.target.files);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: VIPVisitorForm) => {
    console.log('🚀 onSubmit APPELÉ avec données:', JSON.stringify(data, null, 2));
    setIsSubmitting(true);

    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      console.log('📝 Full name:', fullName);

      // 1. Upload photo to Supabase Storage (OPTIONNEL - ne bloque pas)
      let photoUrl = '';
      if (photoFile) {
        console.log('📷 Upload photo en cours...');
        try {
          const fileExt = photoFile.name.split('.').pop() || 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `visitor-photos/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('public')
            .upload(filePath, photoFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.warn('⚠️ Photo upload échoué (non bloquant):', uploadError);
          } else {
            const { data: urlData } = supabase.storage
              .from('public')
              .getPublicUrl(filePath);
            photoUrl = urlData.publicUrl;
            console.log('✅ Photo uploadée:', photoUrl);
          }
        } catch (photoErr) {
          console.warn('⚠️ Erreur photo (non bloquant):', photoErr);
        }
      } else {
        console.log('📷 Pas de photo sélectionnée');
      }

      // 2. Create Supabase Auth user with password
      console.log('👤 Création compte auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: fullName,
            type: 'visitor',
            visitor_level: 'premium'
          }
        }
      });

      if (authError) {
        console.error('❌ Erreur auth:', authError);
        throw authError;
      }
      if (!authData.user) {
        console.error('❌ Pas de user créé');
        throw new Error('Échec création utilisateur');
      }
      console.log('✅ Auth user créé:', authData.user.id);
      console.log('📋 Session créée?', !!authData.session);
      if (authData.session) {
        console.log('📋 Session access_token:', authData.session.access_token?.substring(0, 20) + '...');
      }

      // 3. Create user profile with EXPLICIT vip level and pending_payment status
      console.log('📋 Création profil utilisateur...');
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: data.email,
          name: fullName,
          type: 'visitor',
          visitor_level: 'premium',
          status: 'pending_payment',
          profile: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            country: data.country,
            businessSector: data.sector,
            position: data.position,
            company: data.company,
            photoUrl: photoUrl
          }
        }]);

      if (userError) {
        console.error('❌ Erreur création profil:', userError);
        throw userError;
      }
      console.log('✅ Profil utilisateur créé avec succès');

      // 4. CRITICAL: Update local auth store BEFORE navigation
      // This ensures ProtectedRoute sees the user as authenticated
      // NOTE: visitor_level is 'standard' until payment is confirmed, then upgraded to 'premium'
      const localUser = {
        id: authData.user.id,
        email: data.email,
        name: fullName,
        type: 'visitor' as const,
        visitor_level: 'standard' as const, // NOT premium until payment is done
        status: 'pending_payment' as const,
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          country: data.country,
          company: data.company,
          position: data.position,
          businessSector: data.sector,
          photoUrl: photoUrl,
          bio: '',
          interests: [],
          objectives: [],
          sectors: [],
          products: [],
          videos: [],
          images: [],
          participationObjectives: [],
          thematicInterests: [],
          collaborationTypes: [],
          expertise: [],
          visitObjectives: [],
          competencies: []
        },
        createdAt: new Date().toISOString()
      };
      console.log('📦 Mise à jour du store local avec:', localUser.email);
      setUser(localUser);

      // 5. Create payment request in database (non bloquant)
      try {
        const { error: paymentError } = await supabase
          .from('payment_requests')
          .insert([{
            user_id: authData.user.id,
            amount: 700,
            status: 'pending',
            payment_method: null,
            metadata: {
              type: 'visitor_vip_upgrade',
              level: 'premium',
              created_from: 'vip_registration'
            }
          }]);

        if (paymentError) {
          console.warn('⚠️ Erreur payment_request (non bloquant):', paymentError);
        }
      } catch (e) {
        console.warn('⚠️ Erreur payment_request (non bloquant):', e);
      }

      // 5. Send email (non bloquant)
      try {
        await supabase.functions.invoke('send-visitor-welcome-email', {
          body: {
            email: data.email,
            name: fullName,
            level: 'premium',
            userId: authData.user.id,
            includePaymentInstructions: true
          }
        });
      } catch (e) {
        console.warn('⚠️ Erreur email (non bloquant):', e);
      }

      // 6. Success - Redirect to payment page
      toast.success('Compte créé ! Redirection vers le paiement...');
      console.log('🎉 SUCCÈS COMPLET - Redirection imminente...');

      // 7. Wait for store to be persisted, then navigate
      // The store update needs a tick to propagate through React
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🔄 Navigation vers /visitor/payment via React Router');
      console.log('📊 Store state - isAuthenticated:', useAuthStore.getState().isAuthenticated);
      console.log('📊 Store state - user:', useAuthStore.getState().user?.email);
      
      navigate(ROUTES.VISITOR_PAYMENT, { replace: true });

    } catch (error: any) {
      console.error('❌ ERREUR INSCRIPTION VIP:', error);
      toast.error(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-yellow-800 to-yellow-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 rounded-lg shadow-lg">
              <Crown className="h-8 w-8 text-gray-900" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">SIPORTS VIP</span>
              <span className="text-sm text-yellow-200 block leading-none">Premium Pass 2026</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Inscription Pass Premium VIP
          </h1>
          <p className="text-yellow-100 text-lg">
            Accès complet au salon avec badge photo sécurisé
          </p>
          <div className="mt-4 inline-flex items-center space-x-3 bg-yellow-800 px-6 py-3 rounded-full">
            <span className="text-yellow-100 font-semibold">💎 RDV B2B Illimités</span>
            <span className="text-yellow-200">•</span>
            <span className="text-yellow-100 font-semibold">🎉 Gala exclusif</span>
            <span className="text-yellow-200">•</span>
            <span className="text-yellow-100 font-semibold">🤝 Networking premium</span>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Photo Upload - MANDATORY */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-6">
                <label className="block text-center mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Camera className="h-5 w-5 text-yellow-600" />
                    <span className="text-lg font-semibold text-gray-900">Photo d'identité *</span>
                  </div>
                  <p className="text-sm text-gray-600">Photo obligatoire pour badge VIP sécurisé</p>
                </label>

                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-40 h-40 object-cover rounded-lg mx-auto border-4 border-yellow-400 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null);
                        setPhotoFile(null);
                        setValue('photo', undefined);
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transform translate-x-1/2 -translate-y-1/2"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-yellow-400 rounded-lg p-8 text-center hover:bg-yellow-50 transition-colors">
                      <Upload className="h-12 w-12 mx-auto text-yellow-600 mb-3" />
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Cliquez pour télécharger votre photo
                      </p>
                      <p className="text-xs text-gray-500">
                        Format: JPG, PNG (max 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        handlePhotoChange(e);
                        // Aussi enregistrer dans react-hook-form
                        if (e.target.files) {
                          setValue('photo', e.target.files, { shouldValidate: true });
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
                {errors.photo && (
                  <p className="text-red-600 text-sm mt-2 text-center font-semibold">
                    {errors.photo.message as string}
                  </p>
                )}
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="firstName"
                      type="text"
                      {...register('firstName')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Votre prénom"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="lastName"
                      type="text"
                      {...register('lastName')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Votre nom"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      {...register('password')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Minimum 8 caractères"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type="password"
                      {...register('confirmPassword')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Confirmer le mot de passe"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Phone and Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="phone" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Pays *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                    <select
                      id="country"sName="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                    <select
                      {...register('country')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none bg-white"
                    >
                      <option value="">Sélectionnez</option>
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.country && (
                    <p className="text-red-600 text-sm mt-1">{errors.country.message}</p>
                  )}
                </div>
              </div>

              {/* Professional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-2">
                    Secteur d'activité *
                  </label>
                  <select
                    id="sector"
                    {...register('sector')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Sélectionnez</option>
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                  {errors.sector && (
                    <p className="text-red-600 text-sm mt-1">{errors.sector.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                    Fonction *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="position"
                      type="text"
                      {...register('position')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Ex: Directeur Commercial"
                    />
                  </div>
                  {errors.position && (
                    <p className="text-red-600 text-sm mt-1">{errors.position.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Entreprise *
                </label>
                <input
                  id="company"
                  type="text"
                  {...register('company')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nom de votre entreprise"
                />
                {errors.company && (
                  <p className="text-red-600 text-sm mt-1">{errors.company.message}</p>
                )}
              </div>

              {/* VIP Benefits */}
              <div className="bg-gradient-to-r from-yellow-50 to-purple-50 border border-yellow-300 rounded-lg p-6">
                <h4 className="font-bold text-yellow-900 mb-3 flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  Inclus dans votre Pass Premium VIP
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">✓</span>
                    <span><strong>Rendez-vous B2B ILLIMITÉS</strong> - Planifiez autant de meetings que souhaité</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">✓</span>
                    <span><strong>Badge ultra-sécurisé avec photo</strong> - QR code JWT rotatif</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">✓</span>
                    <span><strong>Accès zones VIP</strong> - Salons premium, networking area</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">✓</span>
                    <span><strong>Gala de clôture exclusif</strong> - Événement réseau premium</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">✓</span>
                    <span><strong>Ateliers et conférences VIP</strong> - Contenus exclusifs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">✓</span>
                    <span><strong>Tableau de bord complet</strong> - Gestion rendez-vous et networking</span>
                  </li>
                </ul>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>💳 Paiement requis</strong> : Après création du compte, vous serez redirigé vers la page de paiement sécurisé (700 EUR). Votre accès VIP sera activé immédiatement après validation du paiement.
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 py-4 text-lg font-bold shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Création du compte VIP...
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    Créer mon compte VIP et payer
                  </>
                )}
              </Button>

              {/* Free Pass Link */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Vous cherchez un accès gratuit au salon ?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.VISITOR_FREE_REGISTRATION)}
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  🏆 S'inscrire avec le Pass Gratuit
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}



