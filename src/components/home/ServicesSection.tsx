import React from 'react';
import { MessageCircle, Mail, Phone, Clock } from 'lucide-react';
import { Button } from '../ui/Button';

export function ServicesSection() {
  const whatsappNumber = '+212612345678'; // À personnaliser avec votre numéro
  const phoneNumber = '+212123456789'; // À personnaliser
  const emailAddress = 'contact@siportevent.com'; // À personnaliser

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Bonjour, je souhaiterais entrer en contact avec votre équipe commerciale');
    window.open(`https://wa.me/${whatsappNumber.replace(/\s/g, '')}?text=${message}`, '_blank');
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Besoin d'assistance ?
          </h2>
          <p className="text-xl text-gray-600">
            Nos équipes commerciales sont disponibles pour vous aider
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* WhatsApp */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 flex flex-col">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              WhatsApp
            </h3>
            <p className="text-sm text-gray-600 mb-4 flex-grow">
              Contactez-nous directement par message
            </p>
            <Button
              onClick={handleWhatsAppClick}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Envoyer un message
            </Button>
          </div>

          {/* Email */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 flex flex-col">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Email
            </h3>
            <p className="text-sm text-gray-600 mb-4 flex-grow">
              Envoyez un email à notre équipe
            </p>
            <a href={`mailto:${emailAddress}`}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Envoyer un email
              </Button>
            </a>
          </div>

          {/* Phone */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 flex flex-col">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <Phone className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Téléphone
            </h3>
            <p className="text-sm text-gray-600 mb-4 flex-grow">
              Appelez-nous directement
            </p>
            <a href={`tel:${phoneNumber}`}>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Appeler maintenant
              </Button>
            </a>
          </div>

          {/* Horaires */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 flex flex-col">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg mb-4">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Horaires
            </h3>
            <p className="text-sm text-gray-600 mb-4 flex-grow">
              Nous sommes disponibles:<br />Lundi - Vendredi: 9h-18h
            </p>
            <div className="text-xs text-gray-500 mt-auto">
              Fuseau horaire: GMT+1
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">
            Prêt à discuter avec notre équipe ?
          </h3>
          <p className="mb-6 text-green-50 max-w-2xl mx-auto">
            Utilisez WhatsApp pour une réponse rapide et instantanée
          </p>
          <Button
            onClick={handleWhatsAppClick}
            className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Démarrer une conversation WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
