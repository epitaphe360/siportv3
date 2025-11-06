import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../lib/routes';
import { motion } from 'framer-motion';
import { Building, Mail, Lock, User, Phone, Briefcase, CheckCircle, XCircle } from 'lucide-react';

export default function ExhibitorSignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    position: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuthStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password' && value.length > 0 && value.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères.');
    } else if (name === 'password') {
      setPasswordError(null);
    }

    if (name === 'confirmPassword' && formData.password !== value) {
      setError('Les mots de passe ne correspondent pas.');
    } else if (name === 'confirmPassword' && formData.password === value) {
      setError(null);
    }
  };

  const handleConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setShowConfirmation(true);
  };

  const handleSubmit = async () => {
    setShowConfirmation(false);
    setIsLoading(true);
    try {
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
          position: formData.position,
          role: 'exhibitor',
          status: 'pending' // Statut initial en attente
        }
      );

      if (error) {
        setError(error.message);
        console.error("Erreur d'inscription:", error.message); // Log l'erreur pour le débogage
       } else {
        // Afficher un message de succès temporaire avant la redirection
        setShowConfirmation(false); // Fermer la modale de confirmation si elle est ouverte
        alert("Votre compte a été créé avec succès et est en attente d'approbation."); // Message de succès temporaire
        navigate('/signup-success');
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
                {/* Poste */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Votre poste</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     aria-label="Position" />
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     aria-label="Password" />
                    {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                  </div>
                </div>

                {/* Confirmer le mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     aria-label="Confirm Password" />
                    {error && name === 'confirmPassword' && <p className="text-red-500 text-xs mt-1">{error}</p>}
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
                <div className="flex justify-between"><span className="font-medium text-gray-500">Poste:</span> <span className="font-semibold">{formData.position}</span></div>
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
      </motion.div>
    </div>
  );
};
