import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';

const LEVELS = [
  {
    key: 'free',
    title: 'Pass Gratuit',
    description: 'Accès limité à la zone exposition, conférences publiques et networking de base.',
    price: '0€',
    features: [
      'Zone exposition',
      'Conférences publiques',
      'Networking limité',
      'Application mobile',
      'Inscription gratuite',
      '0 rendez-vous B2B'
    ]
  },
  {
    key: 'premium',
    title: 'Pass Premium VIP',
    description: 'Accès VIP complet 3 jours All Inclusive - Tout Accès illimité au salon.',
    price: '700€',
    features: [
      'Invitation inauguration',
      'Rendez-vous B2B illimités',
      'Networking illimité',
      'Ateliers spécialisés',
      'Soirée gala exclusive',
      'Conférences',
      'Déjeuners networking'
    ]
  }
];

export default function VisitorSubscription() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const { user } = useAuthStore();
  const userId = user?.id || '';
  const isLogged = !!userId;
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubscribe(level: string) {
    // Si l'utilisateur n'est pas connecté, rediriger vers l'inscription
    if (!userId) {
      window.location.href = `/register?next=/visitor/subscription&level=${level}`;
      return;
    }

    setLoading(true);

    // Le niveau gratuit ne nécessite pas de paiement
    if (level === 'free') {
      const { error } = await supabase
        .from('users')
        .update({ visitor_level: 'free' })
        .eq('id', userId);

      setLoading(false);
      if (error) {
        setMessage('Erreur lors de l\'inscription gratuite.');
      } else {
        setMessage('✓ Inscription gratuite réussie !');
      }
      return;
    }

    // Pour le niveau premium : créer une demande de paiement par virement bancaire
    try {
      // Vérifier si une demande pending existe déjà
      const { data: existingRequests, error: checkError } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (checkError) {
        console.error('Erreur vérification demande:', checkError);
        setMessage(`✗ Erreur lors de la vérification: ${checkError.message}`);
        setLoading(false);
        return;
      }

      if (existingRequests && existingRequests.length > 0) {
        setMessage('⚠ Vous avez déjà une demande de paiement en attente. Consultez votre profil pour les instructions de virement.');
        setLoading(false);
        return;
      }

      // Créer la demande de paiement
      const { data: request, error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: userId,
          requested_level: level,
          amount: 700.00,
          currency: 'EUR',
          status: 'pending',
          payment_method: 'bank_transfer'
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur création demande:', error);
        setMessage(`✗ Erreur lors de la création de la demande: ${error.message}`);
        setLoading(false);
        return;
      }

      setMessage(`✓ Demande créée avec succès ! Consultez les instructions de virement bancaire ci-dessous.`);
      setLoading(false);

      // Rediriger vers la page des instructions de paiement après 2 secondes
      setTimeout(() => {
        window.location.href = `/visitor/payment-instructions?request_id=${request.id}`;
      }, 2000);

    } catch (err: any) {
      console.error('Erreur:', err);
      setMessage(`✗ Erreur: ${err.message || 'Erreur inconnue'}`);
      setLoading(false);
    }
  }

  return (
    <div style={{maxWidth:800,margin:'auto',padding:32}}>
      <h1>Choisissez votre Pass Visiteur</h1>
      <p>Découvrez les différents niveaux d'accès au Salon International des Ports d'Afrique.</p>
      <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
        {LEVELS.map(level => (
          <div key={level.key} style={{border:'1px solid #ccc',borderRadius:8,padding:24,width:220,background:selected===level.key?'#f0f8ff':'#fff'}}>
            <h2>{level.title}</h2>
            <p>{level.description}</p>
            <ul>
              {level.features.map((f,i)=>(<li key={i}>{f}</li>))}
            </ul>
            <div style={{fontWeight:'bold',fontSize:18,margin:'12px 0'}}>{level.price}</div>
            <button
              disabled={loading}
              onClick={() => {
                if (!isLogged) {
                  // inviter à créer un compte avant de souscrire
                  window.location.href = `/register?next=/visitor/subscription&level=${level.key}`;
                  return;
                }

                setSelected(level.key);
                handleSubscribe(level.key);
              }}
            >
              {!isLogged ? 'Créer un compte' : (level.price==='0€' ? 'S\'inscrire' : 'Demander le Pass Premium')}
            </button>
          </div>
        ))}
      </div>
      {message && <div style={{marginTop:24,color:'green'}}>{message}</div>}
    </div>
  );
}




