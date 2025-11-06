import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contactez-nous
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vous avez des questions sur SIPORTS 2026 ? Notre équipe est là pour vous aider.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Envoyez-nous un message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input type="text"
                    id="firstName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre prénom"
                   aria-label="Votre prénom" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input type="text"
                    id="lastName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre nom"
                   aria-label="Votre nom" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input type="email"
                  id="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre.email@exemple.com"
                 aria-label="votre.email@exemple.com" />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Société
                </label>
                <input type="text"
                  id="company"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom de votre société"
                 aria-label="Nom de votre société" />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet *
                </label>
                <select
                  id="subject"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="exhibitor">Devenir exposant</option>
                  <option value="visitor">S'inscrire comme visiteur</option>
                  <option value="partnership">Partenariat</option>
                  <option value="support">Support technique</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre message..."
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4 mr-2" />
                Envoyer le message
              </Button>
            </form>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Informations de contact
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Adresse</h3>
                    <p className="text-gray-600">
                      El Jadida, Maroc<br />
                      5-7 Février 2026
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <a
                      href="mailto:contact@siportevent.com"
                      className="text-blue-600 hover:text-blue-800"
                      aria-label="Envoyer un email à contact@siportevent.com"
                    >
                      contact@siportevent.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Téléphone</h3>
                    <a
                      href="tel:+212123456789"
                      className="text-blue-600 hover:text-blue-800"
                      aria-label="Appeler le +212 1 23 45 67 89"
                    >
                      +212 1 23 45 67 89
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Horaires d'ouverture
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lundi - Vendredi</span>
                  <span className="font-medium">9h00 - 18h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Samedi</span>
                  <span className="font-medium">9h00 - 12h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dimanche</span>
                  <span className="font-medium">Fermé</span>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Suivez-nous
              </h2>
              <p className="text-gray-600 mb-4">
                Restez informé des dernières actualités de SIPORTS 2026
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com/siports2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                  aria-label="Visiter notre page Facebook"
                >
                  Facebook
                </a>
                <a
                  href="https://linkedin.com/company/siports2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-700 text-white p-3 rounded-lg hover:bg-blue-800 transition-colors"
                  aria-label="Visiter notre page LinkedIn"
                >
                  LinkedIn
                </a>
                <a
                  href="https://twitter.com/siports2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-400 text-white p-3 rounded-lg hover:bg-blue-500 transition-colors"
                  aria-label="Visiter notre page Twitter"
                >
                  Twitter
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
