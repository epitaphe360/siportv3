import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';

const LEVELS = [
  {
    key: 'free',
    title: 'Pass Gratuit',
    description: 'Accès limité à la zone exposition, conférences publiques et networking.',
    price: '0€',
    features: [
      'Zone exposition',
      'Conférences publiques',
      'Networking',
      'Application mobile',
      'Inscription gratuite'
    ]
  },
  {
    key: 'basic',
    title: 'Pass Basic',
    description: 'Accès 1 jour, expositions, keynotes, networking et 2 rendez-vous B2B garantis.',
    price: '50€',
    features: [
      'Accès 1 jour',
      'Keynote lectures',
      'Networking coffee break',
      '2 rendez-vous B2B garantis'
    ]
  },
  {
    key: 'premium',
    title: 'Pass Premium',
    description: 'Accès 2 jours, ateliers spécialisés, déjeuners networking, lounge VIP.',
    price: '120€',
    features: [
      'Accès 2 jours',
      'Ateliers spécialisés',
      'Déjeuners networking',
      '5 rendez-vous B2B garantis',
      'Accès lounge VIP'
    ]
  },
  {
    key: 'vip',
    title: 'Pass VIP',
    description: 'Accès 3 jours All Inclusive, soirée gala, conférences exclusives, service concierge.',
    price: '250€',
    features: [
      'Accès 3 jours',
      'Soirée gala',
      'Conférences exclusives',
      'Service concierge',
      'Transferts aéroport inclus'
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
    // Ici, intégrer la logique de paiement si nécessaire
    // Après paiement, mettre à jour visitor_level
    if (!userId) {
      setMessage('Utilisateur non connecté');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ visitor_level: level })
      .eq('id', userId);
    setLoading(false);
    if (error) {
      setMessage('Erreur lors de la souscription.');
    } else {
      setMessage('Souscription réussie ! Votre niveau : ' + level);
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
