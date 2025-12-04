import React, { useState } from 'react';
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
    description: 'Accès VIP complet 3 jours All Inclusive - Tout accès illimité au salon.',
    price: '700€',
    features: [
      'Accès VIP 3 jours complets',
      'Rendez-vous B2B illimités',
      'Networking illimité',
      'Ateliers spécialisés',
      'Soirée gala exclusive',
      'Conférences VIP',
      'Déjeuners networking',
      'Accès lounge VIP exécutif',
      'Service concierge dédié',
      'Transferts aéroport inclus',
      'Kit VIP premium',
      'Recommandations IA avancées'
    ]
  }
];

export default function VisitorSubscription() {
  const [selected, setSelected] = useState<string | null>(null);
  const { user } = useAuthStore();
  const userId = user?.id || '';
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubscribe(level: string) {
    setLoading(true);

    if (!userId) {
      setMessage('Utilisateur non connecté');
      setLoading(false);
      return;
    }

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
        setMessage('Inscription gratuite réussie !');
      }
      return;
    }

    try {
      // Appeler l'Edge Function pour créer une session Stripe Checkout
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          userId: userId,
          level: level,
          successUrl: `${window.location.origin}/subscription/success?level=${level}`,
          cancelUrl: `${window.location.origin}/subscription/cancel`
        }
      });

      if (error) {
        console.error('Erreur création session Stripe:', error);
        setMessage(`Erreur lors de la création de la session de paiement: ${error.message}`);
        setLoading(false);
        return;
      }

      console.log('Session Stripe créée:', data);

      // Rediriger vers Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage('Erreur: URL de paiement manquante');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Erreur paiement:', err);
      setMessage(`Erreur: ${err.message || 'Erreur inconnue'}`);
      setLoading(false);
    }
  }

  return (
    <div style={{maxWidth:800,margin:'auto',padding:32}}>
      <h1>Choisissez votre Pass Visiteur</h1>
      <p>Découvrez les différents niveaux d’accès au Salon International des Ports d’Afrique.</p>
      <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
        {LEVELS.map(level => (
          <div key={level.key} style={{border:'1px solid #ccc',borderRadius:8,padding:24,width:220,background:selected===level.key?'#f0f8ff':'#fff'}}>
            <h2>{level.title}</h2>
            <p>{level.description}</p>
            <ul>
              {level.features.map((f,i)=>(<li key={i}>{f}</li>))}
            </ul>
            <div style={{fontWeight:'bold',fontSize:18,margin:'12px 0'}}>{level.price}</div>
            <button disabled={loading} onClick={()=>{setSelected(level.key);handleSubscribe(level.key);}}>
              {level.price==='0€'?'S\'inscrire':'Acheter'}
            </button>
          </div>
        ))}
      </div>
      {message && <div style={{marginTop:24,color:'green'}}>{message}</div>}
    </div>
  );
}
