import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  User,
  Target,
  Building2,
  Globe,
  Briefcase,
  Users,
  Award,
  ArrowLeft,
  Save,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Handshake,
  Search,
  MessageSquare,
  Calendar,
  Star,
  Zap
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import useAuthStore from '../store/authStore';
import { ROUTES } from '../lib/routes';

// Types de secteurs disponibles pour le matching
const AVAILABLE_SECTORS = [
  'Port Operations',
  'Maritime Technology',
  'Digital Transformation',
  'Logistics & Supply Chain',
  'Sustainability & Environment',
  'Infrastructure & Construction',
  'Equipment Manufacturing',
  'Consulting Services',
  'Research & Development',
  'Government & Regulation',
  'Energy & Renewables',
  'Shipping & Freight',
  'Offshore Industries',
  'Cybersecurity Maritime',
  'Training & Education'
];

// Centres d'intérêt disponibles
const AVAILABLE_INTERESTS = [
  'Smart Ports',
  'Decarbonization',
  'Automation',
  'IoT & Sensors',
  'Artificial Intelligence',
  'Blockchain',
  'Green Technologies',
  'Port Security',
  'Terminal Operations',
  'Cargo Handling',
  'Fleet Management',
  'Port Community Systems',
  'Trade Facilitation',
  'Maritime Safety',
  'Innovation',
  'Startups',
  'Investment Opportunities'
];

// Objectifs de participation
const AVAILABLE_OBJECTIVES = [
  'Trouver de nouveaux partenaires',
  'Développer mon réseau',
  'Présenter mes innovations',
  'Identifier des fournisseurs',
  'Explorer de nouveaux marchés',
  'Rencontrer des investisseurs',
  'Découvrir les innovations portuaires',
  'Benchmarking & veille',
  'Opportunités d\'emploi',
  'Formation continue'
];

// Types de collaboration recherchés
const AVAILABLE_COLLABORATION_TYPES = [
  'Partenariat commercial',
  'Joint-venture',
  'Distribution',
  'Projet R&D',
  'Investissement',
  'Transfert de technologie',
  'Conseil & Expertise',
  'Sous-traitance',
  'Coopération institutionnelle',
  'Formation & Accompagnement'
];

// Pays disponibles
const AVAILABLE_COUNTRIES = [
  'France',
  'Maroc',
  'Algérie',
  'Tunisie',
  'Espagne',
  'Portugal',
  'Italie',
  'Pays-Bas',
  'Belgique',
  'Allemagne',
  'Royaume-Uni',
  'États-Unis',
  'Chine',
  'Émirats Arabes Unis',
  'Arabie Saoudite',
  'Singapour',
  'Japon',
  'Corée du Sud',
  'Sénégal',
  'Côte d\'Ivoire',
  'Autre'
];

// Tailles d'entreprise
const COMPANY_SIZES = [
  '1-10 employés',
  '11-50 employés',
  '51-200 employés',
  '201-500 employés',
  '501-1000 employés',
  '1000+ employés'
];

export default function ProfileMatchingPage() {
  const navigate = useNavigate();
  const { user, updateProfile, isLoading } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const [formData, setFormData] = useState({
    sectors: user?.profile?.sectors || [],
    interests: user?.profile?.interests || [],
    objectives: user?.profile?.objectives || [],
    collaborationTypes: user?.profile?.collaborationTypes || [],
    country: user?.profile?.country || '',
    company: user?.profile?.company || '',
    companySize: user?.profile?.companySize || '',
    bio: user?.profile?.bio || ''
  });

  // ✅ Resynchroniser le formulaire quand le user change (après sauvegarde ou rechargement)
  useEffect(() => {
    if (user?.profile) {
      setFormData({
        sectors: user.profile.sectors || [],
        interests: user.profile.interests || [],
        objectives: user.profile.objectives || [],
        collaborationTypes: user.profile.collaborationTypes || [],
        country: user.profile.country || '',
        company: user.profile.company || '',
        companySize: user.profile.companySize || '',
        bio: user.profile.bio || ''
      });
    }
  }, [user?.profile]);

  // Calculer le pourcentage de complétion du profil
  useEffect(() => {
    let score = 0;
    const weights = {
      sectors: 20,
      interests: 20,
      objectives: 20,
      collaborationTypes: 15,
      country: 10,
      company: 5,
      companySize: 5,
      bio: 5
    };

    if (formData.sectors.length > 0) score += weights.sectors;
    if (formData.interests.length > 0) score += weights.interests;
    if (formData.objectives.length > 0) score += weights.objectives;
    if (formData.collaborationTypes.length > 0) score += weights.collaborationTypes;
    if (formData.country) score += weights.country;
    if (formData.company) score += weights.company;
    if (formData.companySize) score += weights.companySize;
    if (formData.bio && formData.bio.length > 20) score += weights.bio;

    setCompletionPercentage(score);
  }, [formData]);

  const toggleArrayItem = (field: 'sectors' | 'interests' | 'objectives' | 'collaborationTypes', item: string) => {
    const currentArray = formData[field];
    if (currentArray.includes(item)) {
      setFormData({
        ...formData,
        [field]: currentArray.filter((i: string) => i !== item)
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...currentArray, item]
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // ✅ Sauvegarder les données
      await updateProfile({
        sectors: formData.sectors,
        interests: formData.interests,
        objectives: formData.objectives,
        collaborationTypes: formData.collaborationTypes,
        country: formData.country,
        company: formData.company,
        companySize: formData.companySize,
        bio: formData.bio
      });

      // ✅ IMPORTANT: Attendre un court délai pour que Zustand finisse la mise à jour
      // Puis vérifier que les données sont bien à jour dans le store
      await new Promise(resolve => setTimeout(resolve, 500));

      // ✅ Resynchroniser les données du formulaire avec le user mis à jour du store
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.profile) {
        console.log('✅ Données mises à jour en base:', {
          sectors: currentUser.profile.sectors?.length,
          bio: currentUser.profile.bio?.substring(0, 50)
        });
        
        setFormData({
          sectors: currentUser.profile.sectors || [],
          interests: currentUser.profile.interests || [],
          objectives: currentUser.profile.objectives || [],
          collaborationTypes: currentUser.profile.collaborationTypes || [],
          country: currentUser.profile.country || '',
          company: currentUser.profile.company || '',
          companySize: currentUser.profile.companySize || '',
          bio: currentUser.profile.bio || ''
        });
      }

      toast.success('Profil mis à jour avec succès ! Votre matching IA sera plus précis.');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connexion requise</h3>
          <p className="text-gray-600 mb-4">Veuillez vous connecter pour accéder à cette page</p>
          <Button onClick={() => navigate(ROUTES.LOGIN)}>Se connecter</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-purple-600" />
                Profil Matching IA
              </h1>
              <p className="mt-2 text-gray-600">
                Complétez votre profil pour obtenir des recommandations de networking personnalisées
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 mb-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Score de complétion</h2>
                  <p className="text-white/80 text-sm">Plus votre profil est complet, meilleur sera le matching</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{completionPercentage}%</div>
                <div className="text-white/80 text-sm">
                  {completionPercentage >= 80 ? 'Excellent !' : completionPercentage >= 50 ? 'Bon début' : 'À compléter'}
                </div>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-3 rounded-full ${
                  completionPercentage >= 80 ? 'bg-green-400' :
                  completionPercentage >= 50 ? 'bg-yellow-400' : 'bg-white'
                }`}
              />
            </div>
          </Card>
        </motion.div>

        {/* Benefits Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-start gap-3">
              <Zap className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900">Pourquoi compléter votre profil ?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <Handshake className="h-4 w-4" />
                    <span>Matchs plus pertinents</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <Search className="h-4 w-4" />
                    <span>Visibilité accrue</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <MessageSquare className="h-4 w-4" />
                    <span>Contacts qualifiés</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Sectors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Secteurs d'activité</h3>
                  <p className="text-sm text-gray-600">Sélectionnez vos secteurs d'expertise (max 5)</p>
                </div>
                {formData.sectors.length > 0 && (
                  <Badge variant="success" className="ml-auto">
                    {formData.sectors.length} sélectionné(s)
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SECTORS.map((sector) => (
                  <button
                    key={sector}
                    onClick={() => {
                      if (formData.sectors.length < 5 || formData.sectors.includes(sector)) {
                        toggleArrayItem('sectors', sector);
                      } else {
                        toast.error('Maximum 5 secteurs');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      formData.sectors.includes(sector)
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Interests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Centres d'intérêt</h3>
                  <p className="text-sm text-gray-600">Quels sujets vous passionnent ? (max 8)</p>
                </div>
                {formData.interests.length > 0 && (
                  <Badge variant="warning" className="ml-auto">
                    {formData.interests.length} sélectionné(s)
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => {
                      if (formData.interests.length < 8 || formData.interests.includes(interest)) {
                        toggleArrayItem('interests', interest);
                      } else {
                        toast.error('Maximum 8 centres d\'intérêt');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      formData.interests.includes(interest)
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Objectives */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Objectifs SIPORTS 2026</h3>
                  <p className="text-sm text-gray-600">Que recherchez-vous à cet événement ?</p>
                </div>
                {formData.objectives.length > 0 && (
                  <Badge variant="success" className="ml-auto">
                    {formData.objectives.length} sélectionné(s)
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {AVAILABLE_OBJECTIVES.map((objective) => (
                  <label
                    key={objective}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      formData.objectives.includes(objective)
                        ? 'bg-green-50 border-2 border-green-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.objectives.includes(objective)}
                      onChange={() => toggleArrayItem('objectives', objective)}
                      className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{objective}</span>
                  </label>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Collaboration Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Handshake className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Types de collaboration</h3>
                  <p className="text-sm text-gray-600">Quels types de partenariats vous intéressent ?</p>
                </div>
                {formData.collaborationTypes.length > 0 && (
                  <Badge variant="warning" className="ml-auto">
                    {formData.collaborationTypes.length} sélectionné(s)
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_COLLABORATION_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleArrayItem('collaborationTypes', type)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      formData.collaborationTypes.includes(type)
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Company & Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Globe className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Informations professionnelles</h3>
                  <p className="text-sm text-gray-600">Complétez vos informations pour un meilleur matching</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise / Organisation
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Nom de votre entreprise"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Company Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taille de l'entreprise
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.companySize}
                      onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="">Sélectionnez...</option>
                      {COMPANY_SIZES.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="">Sélectionnez un pays...</option>
                      {AVAILABLE_COUNTRIES.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio / Présentation
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Décrivez votre activité, vos compétences ou ce que vous recherchez..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Les mots-clés de votre bio sont utilisés pour améliorer le matching
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex justify-end gap-4 pt-4"
          >
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Sauvegarder mon profil
                </>
              )}
            </Button>
          </motion.div>

          {/* Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Conseils pour un meilleur matching</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Sélectionnez des secteurs et intérêts spécifiques plutôt que généraux</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Définissez clairement vos objectifs pour des correspondances plus pertinentes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Une bio détaillée améliore la qualité des recommandations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Mettez à jour votre profil régulièrement pour des résultats optimaux</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
