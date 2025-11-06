import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Camera,
  Target,
  Award,
  Bell,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useVisitorStore } from '../../store/visitorStore';
import { motion } from 'framer-motion';

export default function VisitorProfileSettings() {
  const { visitorProfile, updateProfile, updateNotificationPreferences, isLoading } = useVisitorStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'interests' | 'notifications' | 'privacy'>('profile');

  const [formData, setFormData] = useState({
    firstName: visitorProfile?.firstName || '',
    lastName: visitorProfile?.lastName || '',
    visitorType: visitorProfile?.visitorType || 'individual',
    company: visitorProfile?.company || '',
    position: visitorProfile?.position || '',
    professionalStatus: visitorProfile?.professionalStatus || '',
    businessSector: visitorProfile?.businessSector || '',
    phone: visitorProfile?.phone || '',
    country: visitorProfile?.country || '',
    sectorsOfInterest: visitorProfile?.sectorsOfInterest || [],
    visitObjectives: visitorProfile?.visitObjectives || [],
    competencies: visitorProfile?.competencies || [],
    thematicInterests: visitorProfile?.thematicInterests || []
  });

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: visitorProfile?.firstName || '',
      lastName: visitorProfile?.lastName || '',
      visitorType: visitorProfile?.visitorType || 'individual',
      company: visitorProfile?.company || '',
      position: visitorProfile?.position || '',
      professionalStatus: visitorProfile?.professionalStatus || '',
      businessSector: visitorProfile?.businessSector || '',
      phone: visitorProfile?.phone || '',
      country: visitorProfile?.country || '',
      sectorsOfInterest: visitorProfile?.sectorsOfInterest || [],
      visitObjectives: visitorProfile?.visitObjectives || [],
      competencies: visitorProfile?.competencies || [],
      thematicInterests: visitorProfile?.thematicInterests || []
    });
    setIsEditing(false);
  };

  const availableSectors = [
    'Port Operations',
    'Digital Transformation',
    'Sustainability',
    'Maritime Technology',
    'Logistics',
    'Infrastructure',
    'Equipment Manufacturing',
    'Consulting',
    'Research & Development',
    'Government & Regulation'
  ];

  const availableObjectives = [
    'Recherche de fournisseurs',
    'Veille technologique',
    'Opportunités de partenariat',
    'Formation continue',
    'Opportunités d\'emploi',
    'Investissements',
    'Benchmarking',
    'Networking professionnel'
  ];

  const availableCompetencies = [
    'Gestion de projet portuaire',
    'Analyse de performance',
    'Consulting stratégique',
    'Transformation digitale',
    'Gestion des opérations',
    'Développement durable',
    'Innovation technologique',
    'Relations internationales'
  ];

  const availableThematics = [
    'Technologies maritimes',
    'Énergies renouvelables',
    'Logistique portuaire',
    'Innovation digitale',
    'Défense navale',
    'Automatisation',
    'Intelligence artificielle',
    'Blockchain maritime'
  ];

  if (!visitorProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Profil non trouvé
          </h3>
          <p className="text-gray-600">
            Impossible de charger les informations du profil
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Bouton de retour */}
          <div className="mb-4">
            <Link to={ROUTES.VISITOR_DASHBOARD}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au Tableau de Bord Visiteur
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Paramètres du Profil Visiteur
            </h1>
            <p className="text-gray-600">
              Personnalisez votre profil et vos préférences pour optimiser votre expérience SIPORTS
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-4">
                <nav className="space-y-2">
                  {[
                    { id: 'profile', label: 'Profil Personnel', icon: User },
                    { id: 'interests', label: 'Intérêts & Objectifs', icon: Target },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'privacy', label: 'Confidentialité', icon: Shield }
                  ].map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as 'profile' | 'interests' | 'notifications' | 'privacy')}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <section.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profil Personnel */}
            {activeSection === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Informations Personnelles
                      </h3>
                      {!isEditing ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Annuler
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isLoading}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Type de Visiteur */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Type de visiteur
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <label className="flex items-center space-x-2">
                          <input type="radio"
                            name="visitorType"
                            value="individual"
                            checked={formData.visitorType === 'individual'}
                            onChange={(e) =
                      aria-label="Visitor Type"> setFormData({ ...formData, visitorType: e.target.value as 'individual' | 'freelancer' | 'company' })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            aria-label="Particulier"
                          />
                          <span className="text-sm text-gray-700">Particulier</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio"
                            name="visitorType"
                            value="freelancer"
                            checked={formData.visitorType === 'freelancer'}
                            onChange={(e) =
                      aria-label="Visitor Type"> setFormData({ ...formData, visitorType: e.target.value as 'individual' | 'freelancer' | 'company' })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            aria-label="Travailleur autonome"
                          />
                          <span className="text-sm text-gray-700">Travailleur autonome</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio"
                            name="visitorType"
                            value="company"
                            checked={formData.visitorType === 'company'}
                            onChange={(e) =
                      aria-label="Visitor Type"> setFormData({ ...formData, visitorType: e.target.value as 'individual' | 'freelancer' | 'company' })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            aria-label="Entreprise"
                          />
                          <span className="text-sm text-gray-700">Entreprise</span>
                        </label>
                      </div>
                    </div>

                    {/* Photo de Profil */}
                    <div className="flex items-center space-x-6 mb-8">
                      <div className="relative">
                        <div className="h-20 w-20 bg-gray-300 rounded-full flex items-center justify-center">
                          {visitorProfile.avatar ? (
                            <img
                              src={visitorProfile.avatar}
                              alt="Profile"
                              className="h-20 w-20 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-10 w-10 text-gray-600" />
                          )}
                        </div>
                        <button aria-label="Upload photo" className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                          <Camera className="h-3 w-3" />
                        </button>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900">Photo de profil</h4>
                        <p className="text-sm text-gray-600">
                          Ajoutez une photo pour personnaliser votre profil
                        </p>
                      </div>
                    </div>

                    {/* Informations de Base */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom
                        </label>
                        {isEditing ? (
                          <input type="text"
                            value={formData.firstName}
                            onChange={(e) =
                      aria-label="First Name"> setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{visitorProfile.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom
                        </label>
                        {isEditing ? (
                          <input type="text"
                            value={formData.lastName}
                            onChange={(e) =
                      aria-label="Last Name"> setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{visitorProfile.lastName}</p>
                        )}
                      </div>

                      {/* Champs conditionnels selon le type de visiteur */}
                      {formData.visitorType === 'company' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Entreprise
                            </label>
                            {isEditing ? (
                              <input type="text"
                                value={formData.company}
                                onChange={(e) =
                      aria-label="Company"> setFormData({ ...formData, company: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Building2 className="h-4 w-4 text-gray-400" />
                                <p className="text-gray-900">{visitorProfile.company}</p>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Poste
                            </label>
                            {isEditing ? (
                              <input type="text"
                                value={formData.position}
                                onChange={(e) =
                      aria-label="Position"> setFormData({ ...formData, position: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <p className="text-gray-900">{visitorProfile.position}</p>
                            )}
                          </div>
                        </>
                      )}

                      {formData.visitorType === 'freelancer' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Statut professionnel
                            </label>
                            {isEditing ? (
                              <input type="text"
                                value={formData.professionalStatus}
                                onChange={(e) =
                      aria-label="Professional Status"> setFormData({ ...formData, professionalStatus: e.target.value })}
                                placeholder="Ex: Consultant indépendant"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <p className="text-gray-900">{visitorProfile.professionalStatus || 'Non spécifié'}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Secteur d'activité
                            </label>
                            {isEditing ? (
                              <input type="text"
                                value={formData.businessSector}
                                onChange={(e) =
                      aria-label="Business Sector"> setFormData({ ...formData, businessSector: e.target.value })}
                                placeholder="Ex: Consulting maritime"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <p className="text-gray-900">{visitorProfile.businessSector || 'Non spécifié'}</p>
                            )}
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <p className="text-gray-900">{visitorProfile.email}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone
                        </label>
                        {isEditing ? (
                          <input type="tel"
                            value={formData.phone}
                            onChange={(e) =
                      aria-label="Phone"> setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <p className="text-gray-900">{visitorProfile.phone}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pays
                        </label>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <p className="text-gray-900">{visitorProfile.country}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type de Pass
                        </label>
                        <Badge
                          className={`${
                            visitorProfile.passType === 'vip' ? 'bg-yellow-100 text-yellow-800' :
                            visitorProfile.passType === 'premium' ? 'bg-purple-100 text-purple-800' :
                            visitorProfile.passType === 'basic' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {visitorProfile.passType === 'vip' ? 'Pass VIP' :
                           visitorProfile.passType === 'premium' ? 'Pass Premium' :
                           visitorProfile.passType === 'basic' ? 'Pass Basic' :
                           'Pass Gratuit'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Intérêts & Objectifs */}
            {activeSection === 'interests' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Secteurs d'Intérêt */}
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      <Target className="h-5 w-5 inline mr-2" />
                      Secteurs d'Intérêt
                    </h3>

                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSectors.map((sector) => (
                          <label key={sector} className="flex items-center space-x-2">
                            <input type="checkbox"
                              checked={formData.sectorsOfInterest.includes(sector)}
                              onChange={(e) =
                      aria-label="Checkbox"> {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    sectorsOfInterest: [...formData.sectorsOfInterest, sector]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    sectorsOfInterest: formData.sectorsOfInterest.filter(s => s !== sector)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              aria-label={sector}
                            />
                            <span className="text-sm text-gray-700">{sector}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {visitorProfile.sectorsOfInterest.map((sector) => (
                          <Badge key={sector} variant="info" size="sm">
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Objectifs de Visite */}
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      <Award className="h-5 w-5 inline mr-2" />
                      Objectifs de Visite
                    </h3>

                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-2">
                        {availableObjectives.map((objective) => (
                          <label key={objective} className="flex items-center space-x-2">
                            <input type="checkbox"
                              checked={formData.visitObjectives.includes(objective)}
                              onChange={(e) =
                      aria-label="Checkbox"> {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    visitObjectives: [...formData.visitObjectives, objective]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    visitObjectives: formData.visitObjectives.filter(o => o !== objective)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              aria-label={objective}
                            />
                            <span className="text-sm text-gray-700">{objective}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {visitorProfile.visitObjectives.map((objective) => (
                          <div key={objective} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">{objective}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Compétences */}
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Compétences & Expertises
                    </h3>

                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-2">
                        {availableCompetencies.map((competency) => (
                          <label key={competency} className="flex items-center space-x-2">
                            <input type="checkbox"
                              checked={formData.competencies.includes(competency)}
                              onChange={(e) =
                      aria-label="Checkbox"> {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    competencies: [...formData.competencies, competency]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    competencies: formData.competencies.filter(c => c !== competency)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              aria-label={competency}
                            />
                            <span className="text-sm text-gray-700">{competency}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {visitorProfile.competencies.map((competency) => (
                          <Badge key={competency} variant="success" size="sm">
                            {competency}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Thématiques d'Intérêt */}
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Thématiques d'Intérêt
                    </h3>

                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableThematics.map((thematic) => (
                          <label key={thematic} className="flex items-center space-x-2">
                            <input type="checkbox"
                              checked={formData.thematicInterests.includes(thematic)}
                              onChange={(e) =
                      aria-label="Checkbox"> {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    thematicInterests: [...formData.thematicInterests, thematic]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    thematicInterests: formData.thematicInterests.filter(t => t !== thematic)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              aria-label={thematic}
                            />
                            <span className="text-sm text-gray-700">{thematic}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {visitorProfile.thematicInterests.map((thematic) => (
                          <Badge key={thematic} variant="warning" size="sm">
                            {thematic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      <Bell className="h-5 w-5 inline mr-2" />
                      Préférences de Notification
                    </h3>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Notifications Email</h4>
                          <p className="text-sm text-gray-600">Recevez les notifications par email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox"
                            checked={visitorProfile.notificationPreferences.email}
                            onChange={(e) =
                      aria-label="Checkbox"> updateNotificationPreferences({ email: e.target.checked })}
                            className="sr-only peer"
                            aria-label="Notifications Email"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Notifications Push</h4>
                          <p className="text-sm text-gray-600">Notifications sur votre appareil</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox"
                            checked={visitorProfile.notificationPreferences.push}
                            onChange={(e) =
                      aria-label="Checkbox"> updateNotificationPreferences({ push: e.target.checked })}
                            className="sr-only peer"
                            aria-label="Notifications Push"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Notifications In-App</h4>
                          <p className="text-sm text-gray-600">Notifications dans l'application</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox"
                            checked={visitorProfile.notificationPreferences.inApp}
                            onChange={(e) =
                      aria-label="Checkbox"> updateNotificationPreferences({ inApp: e.target.checked })}
                            className="sr-only peer"
                            aria-label="Notifications In-App"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Confidentialité */}
            {activeSection === 'privacy' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      <Shield className="h-5 w-5 inline mr-2" />
                      Paramètres de Confidentialité
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Visibilité du Profil
                        </h4>
                        <div className="space-y-3">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value="public"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              aria-label="Public - Visible par tous les participants"
                            />
                            <span className="text-sm text-gray-700">Public - Visible par tous les participants</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value="connections"
                              defaultChecked
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              aria-label="Connexions uniquement - Visible par mes connexions"
                            />
                            <span className="text-sm text-gray-700">Connexions uniquement - Visible par mes connexions</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value="private"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              aria-label="Privé - Non visible dans les recherches"
                            />
                            <span className="text-sm text-gray-700">Privé - Non visible dans les recherches</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Partage des Données
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Permettre aux exposants de me contacter</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="sr-only peer" aria-label="Permettre aux exposants de me contacter" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Inclure dans les recommandations IA</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="sr-only peer" aria-label="Inclure dans les recommandations IA" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Conformité RGPD
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Vos données sont protégées selon le Règlement Général sur la Protection des Données (RGPD).
                        </p>
                        <div className="flex space-x-3">
                          <Button variant="outline" size="sm">
                            Télécharger mes données
                          </Button>
                          <Button variant="outline" size="sm">
                            Supprimer mon compte
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};