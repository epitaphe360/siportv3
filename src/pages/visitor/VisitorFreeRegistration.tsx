/**
 * Formulaire d'inscription Visiteur GRATUIT
 * Workflow simplifié sans mot de passe ni dashboard
 */
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Briefcase, Loader, CheckCircle, Anchor } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../lib/routes';
import { COUNTRIES } from '../../data/countries';

const freeVisitorSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Téléphone requis'),
  country: z.string().min(2, 'Pays requis'),
  sector: z.string().min(2, 'Secteur requis'),
  position: z.string().optional(),
  company: z.string().optional(),
});

type FreeVisitorForm = z.infer<typeof freeVisitorSchema>;

const sectors = [
  'Autorité Portuaire',
  'Transport Maritime',
  'Logistique',
  'Consulting',
  'Technologie',
  'Étudiant',
  'Média/Presse',
  'Institutionnel',
  'Autre'
];

export default function VisitorFreeRegistration() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FreeVisitorForm>({
    resolver: zodResolver(freeVisitorSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: FreeVisitorForm) => {
    setIsSubmitting(true);

    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();

      // 1. Créer l'utilisateur Supabase Auth (sans mot de passe)
      const temporaryPassword = `temp-${Date.now()}-${Math.random().toString(36)}`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: temporaryPassword,
        options: {
          data: {
            name: fullName,
            type: 'visitor',
            visitor_level: 'free'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Échec création utilisateur');

      // 2. Créer l'entrée dans la table users
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: data.email,
          name: fullName,
          type: 'visitor',
          visitor_level: 'free', // ✅ EXPLICITE
          status: 'pending', // En attente de validation email
          profile: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            country: data.country,
            businessSector: data.sector,
            position: data.position || '',
            company: data.company || ''
          }
        }]);

      if (userError) throw userError;

      // 3. Générer badge QR automatiquement
      const { error: badgeError } = await supabase.functions.invoke('generate-visitor-badge', {
        body: {
          userId: authData.user.id,
          email: data.email,
          name: fullName,
          level: 'free',
          includePhoto: false
        }
      });

      if (badgeError) {
        console.warn('Erreur génération badge:', badgeError);
        // Ne pas bloquer l'inscription
      }

      // 4. Envoyer email avec badge et infos salon
      const { error: emailError } = await supabase.functions.invoke('send-visitor-welcome-email', {
        body: {
          email: data.email,
          name: fullName,
          level: 'free',
          userId: authData.user.id
        }
      });

      if (emailError) {
        console.warn('Erreur envoi email:', emailError);
      }

      // 5. Logout immédiat - visiteur gratuit n'a pas accès au dashboard
      await supabase.auth.signOut();

      // Succès !
      setShowSuccess(true);
      toast.success('Inscription réussie ! Vérifiez votre email.');

      setTimeout(() => {
        navigate(`${ROUTES.SIGNUP_CONFIRMATION}?email=${encodeURIComponent(data.email)}&type=visitor&level=free`);
      }, 6000);

    } catch (error: any) {
      console.error('Erreur inscription:', error);
      toast.error(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-white p-3 rounded-lg">
              <Anchor className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">SIPORTS</span>
              <span className="text-sm text-green-200 block leading-none">2026</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Inscription Visiteur Gratuit
          </h1>
          <p className="text-green-100">
            Recevez votre badge d'accès gratuit par email
          </p>
          <div className="mt-4 inline-flex items-center space-x-2 bg-green-800 px-4 py-2 rounded-full">
            <span className="text-green-200 text-sm">✅ Accès salon</span>
            <span className="text-green-200">•</span>
            <span className="text-green-200 text-sm">✅ Badge QR</span>
            <span className="text-green-200">•</span>
            <span className="text-green-200 text-sm">✅ Gratuit</span>
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
              {/* Nom et Prénom */}
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Votre nom"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                   Votre badge sera envoyé à cette adresse
                </p>
              </div>

              {/* Téléphone et Pays */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Pays *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                    <select
                      id="country" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                    <select
                      {...register('country')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
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

              {/* Secteur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'activité *
                </label>
                <select
                  {...register('sector')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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

              {/* Champs optionnels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fonction (optionnel)
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      {...register('position')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ex: Ingénieur"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise (optionnel)
                  </label>
                  <input
                    type="text"
                    {...register('company')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nom de votre entreprise"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">✅ Inclus dans votre pass gratuit</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Accès au salon SIPORTS 2026</li>
                  <li>• Badge QR sécurisé envoyé par email</li>
                  <li>• Accès aux conférences publiques</li>
                  <li>• Pas de mot de passe requis</li>
                </ul>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Création en cours...
                  </>
                ) : (
                  'Obtenir mon badge gratuit'
                )}
              </Button>

              {/* VIP Link */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Besoin d'un accès VIP complet ?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.VISITOR_VIP_REGISTRATION)}
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                >
                   Passer au Pass VIP Premium
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center"
              >
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Badge envoyé !
                </h2>
                <p className="text-gray-600 mb-6">
                  Vérifiez votre email <strong>{watch('email')}</strong> pour recevoir votre badge d'accès gratuit.
                </p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                  className="h-1 bg-green-600 rounded-full"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}



