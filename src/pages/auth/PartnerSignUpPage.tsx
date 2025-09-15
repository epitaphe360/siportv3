import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { Building, Mail, Lock, User, Phone, Globe, Briefcase, MapPin } from 'lucide-react';

const partnerSignUpSchema = z.object({
  companyName: z.string().min(2, "Le nom de l'organisation est requis"),
  sector: z.string().min(2, "Le secteur d'activité est requis"),
  country: z.string().min(2, "Le pays est requis"),
  website: z.string().url("L'URL du site web est invalide").optional().or(z.literal('')),
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom de famille est requis"),
  position: z.string().min(2, "Le poste est requis"),
  email: z.string().email("L'adresse e-mail est invalide"),
  phone: z.string().min(5, "Le numéro de téléphone est requis"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  companyDescription: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  partnershipType: z.string().min(2, "Le type de partenariat est requis"),
});

type PartnerSignUpFormValues = z.infer<typeof partnerSignUpSchema>;

export default function PartnerSignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<PartnerSignUpFormValues>({
    resolver: zodResolver(partnerSignUpSchema),
  });

  React.useEffect(() => {
    register('partnershipType');
  }, [register]);

  const onSubmit: SubmitHandler<PartnerSignUpFormValues> = async (data) => {
    setIsLoading(true);
    const { email, password, ...profileData } = data;

    const finalProfileData = {
      ...profileData,
      role: 'partner',
      status: 'pending',
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
        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations sur l'organisation */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informations sur l'Organisation</h3>
                <div>
                  <Label htmlFor="companyName">Nom de l'organisation</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="companyName" {...register('companyName')} placeholder="Nom de votre organisation" className="pl-10" />
                  </div>
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="sector">Secteur d'activité</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="sector" {...register('sector')} placeholder="Ex: Logistique, Technologie, Institutionnel" className="pl-10" />
                  </div>
                  {errors.sector && <p className="text-red-500 text-xs mt-1">{errors.sector.message}</p>}
                </div>
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="country" {...register('country')} placeholder="Pays de résidence" className="pl-10" />
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
                  <Label htmlFor="partnershipType">Type de partenariat souhaité</Label>
                  <Select onValueChange={(value: string) => setValue('partnershipType', value)} defaultValue="">
                    <SelectTrigger id="partnershipType">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="institutionnel">Institutionnel</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="technologique">Technologique</SelectItem>
                      <SelectItem value="financier">Financier</SelectItem>
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
                    <Label htmlFor="firstName">Prénom</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input id="firstName" {...register('firstName')} placeholder="Votre prénom" className="pl-10" />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" {...register('lastName')} placeholder="Votre nom" />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="position">Poste / Fonction</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="position" {...register('position')} placeholder="Votre poste" className="pl-10" />
                  </div>
                  {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Adresse e-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="email" type="email" {...register('email')} placeholder="contact@votre-organisation.com" className="pl-10" />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="phone" {...register('phone')} placeholder="Votre numéro de téléphone" className="pl-10" />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="password" type="password" {...register('password')} placeholder="Créez un mot de passe sécurisé" className="pl-10" />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="companyDescription">Description de votre organisation et de vos motivations</Label>
              <Textarea id="companyDescription" {...register('companyDescription')} rows={4} placeholder="Décrivez votre organisation, vos activités et pourquoi vous souhaitez devenir partenaire de SIPORTS 2026." />
              {errors.companyDescription && <p className="text-red-500 text-xs mt-1">{errors.companyDescription.message}</p>}
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={isLoading} variant="default">
                {isLoading ? 'Envoi en cours...' : "Demander à devenir partenaire"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
