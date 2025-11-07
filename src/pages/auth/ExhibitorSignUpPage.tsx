import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../lib/routes';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Mail, Lock, User, Phone, Briefcase, CheckCircle, XCircle, Globe, AlertCircle, FileText } from 'lucide-react';
import { COUNTRIES, JOB_POSITIONS } from '../../data/countries';

const MAX_DESCRIPTION_LENGTH = 500;

export default function ExhibitorSignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    country: '',
    position: '',
    customPosition: '',
    description: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuthStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Limit description to MAX_DESCRIPTION_LENGTH
    if (name === 'description' && value.length > MAX_DESCRIPTION_LENGTH) {
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    if (formData.password.length > 0 && formData.password.length < 12) {
      setPasswordError('Le mot de passe doit contenir au moins 12 caractères.');
    } else {
      setPasswordError(null);
    }
  };

  const handleConfirmPasswordBlur = () => {
    setConfirmPasswordTouched(true);
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas.');
    } else {
      setConfirmPasswordError(null);
    }
  };

  const handleConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (formData.password.length < 12) {
      setError('Le mot de passe doit contenir au moins 12 caractères.');
      return;
    }
    setShowConfirmation(true);
  };

  const handleSubmit = async () => {
    setShowConfirmation(false);
    setIsLoading(true);
    try {
      const finalPosition = formData.position === 'Autre' ? formData.customPosition : formData.position;

      const { error } = await signUp(
        {
          email: formData.email,
          password: formData.password
        },
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.companyName,
          phone: formData.phone,
          country: formData.country,
          position: finalPosition,
          description: formData.description,
          role: 'exhibitor',
          status: 'pending' // Statut initial en attente
        }
      );

      if (error) {
        setError(error.message);
        console.error("Erreur d'inscription:", error.message); // Log l'erreur pour le débogage
       } else {
        // Afficher la modale de succès
        setShowSuccess(true);

        // Rediriger après 3 secondes
        setTimeout(() => {
          navigate('/signup-success');
        }, 3000);
      }
    } catch (err) {
      console.error("Erreur inattendue lors de l'inscription:", err); // Log l'erreur inattendue
      setError('Une erreur inattendue est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Inscription Exposant</h1>
              <p className="text-gray-600 mt-2">
                Rejoignez la communauté SIPORTS 2026 et développez votre réseau.
              </p>
            </div>

            <form onSubmit={handleConfirmation} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prénom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     aria-label="First Name" />
                  </div>
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     aria-label="Last Name" />
                  </div>
                </div>
              </div>

              {/* Nom de l'entreprise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   aria-label="Company Name" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pays */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pays *</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      aria-label="Country"
                    >
                      <option value="">Sélectionnez un pays</option>
                      {COUNTRIES.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     aria-label="Phone" />
                  </div>
                </div>
              </div>

              {/* Poste/Fonction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Poste/Fonction *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    aria-label="Position"
                  >
                    <option value="">Sélectionnez votre fonction</option>
                    {JOB_POSITIONS.map(position => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Position - Appears when "Autre" is selected */}
              <AnimatePresence>
                {formData.position === 'Autre' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">Précisez votre fonction *</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="customPosition"
                        value={formData.customPosition}
                        onChange={handleInputChange}
                        required={formData.position === 'Autre'}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Entrez votre fonction"
                        aria-label="Custom Position"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Description de l'organisation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description de votre organisation *
                </label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Décrivez brièvement votre organisation, vos activités principales..."
                    aria-label="Organization Description"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">Décrivez vos activités principales</p>
                    <p className={`text-xs font-medium ${formData.description.length >= MAX_DESCRIPTION_LENGTH ? 'text-red-600' : 'text-gray-500'}`}>
                      {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email professionnel</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   aria-label="Email" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                    <span className="text-xs text-gray-500 font-normal ml-2">(Minimum 12 caractères)</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={handlePasswordBlur}
                      required
                      minLength={12}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        passwordTouched && passwordError
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      aria-label="Password"
                    />
                    {passwordTouched && passwordError && (
                      <div className="flex items-center mt-1 text-red-600 text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {passwordError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirmer le mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={handleConfirmPasswordBlur}
                      required
                      minLength={12}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        confirmPasswordTouched && confirmPasswordError
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      aria-label="Confirm Password"
                    />
                    {confirmPasswordTouched && confirmPasswordError && (
                      <div className="flex items-center mt-1 text-red-600 text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {confirmPasswordError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  variant="default"
                >
                  {isLoading ? 'Création du compte...' : 'Créer mon compte Exposant'}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>
                  Déjà un compte ?{' '}
                   <Link to={ROUTES.LOGIN} className="font-medium text-blue-600 hover:underline">
                    Connectez-vous
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </Card>
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirmer votre inscription</h2>
              <p className="text-gray-600 mb-6">Veuillez vérifier les informations avant de finaliser votre inscription.</p>

              <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between"><span className="font-medium text-gray-500">Nom complet:</span> <span className="font-semibold">{formData.firstName} {formData.lastName}</span></div>
                <div className="flex justify-between"><span className="font-medium text-gray-500">Entreprise:</span> <span className="font-semibold">{formData.companyName}</span></div>
                <div className="flex justify-between"><span className="font-medium text-gray-500">Pays:</span> <span className="font-semibold">{COUNTRIES.find(c => c.code === formData.country)?.name || formData.country}</span></div>
                <div className="flex justify-between"><span className="font-medium text-gray-500">Poste:</span> <span className="font-semibold">{formData.position === 'Autre' ? formData.customPosition : formData.position}</span></div>
                <div className="flex justify-between"><span className="font-medium text-gray-500">Email:</span> <span className="font-semibold">{formData.email}</span></div>
                <div className="flex justify-between"><span className="font-medium text-gray-500">Téléphone:</span> <span className="font-semibold">{formData.phone}</span></div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading} variant="default">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isLoading ? 'Confirmation...' : 'Confirmer la création'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Compte créé avec succès!
                </h2>
                <p className="text-gray-600 mb-2">
                  Votre demande d'inscription a été envoyée.
                </p>
                <p className="text-sm text-gray-500">
                  Votre compte est en attente d'approbation par notre équipe.
                </p>

                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                  className="mt-6 h-1 bg-green-600 rounded-full"
                />

                <p className="text-xs text-gray-400 mt-3">
                  Redirection automatique...
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
