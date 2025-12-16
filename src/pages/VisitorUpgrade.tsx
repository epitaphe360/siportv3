import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function VisitorUpgrade() {
  return (
    <div style={{padding:24}}>
      <h1>Mettre à niveau votre compte</h1>
      <p>Choisissez un niveau et simulez un paiement pour les tests.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginTop:12}}>
        <div style={{padding:12,border:'1px solid #eaeaea',borderRadius:8}}>
          <h3>Pass Gratuit</h3>
          <p>0 RDV B2B - Accès limité</p>
          <Button>Choisir Pass Gratuit</Button>
        </div>
        <div style={{padding:12,border:'1px solid #eaeaea',borderRadius:8}}>
          <h3>Pass Premium VIP - 700€</h3>
          <p>RDV B2B illimités + Tous les avantages</p>
          <ul style={{fontSize:'12px',marginTop:'8px',textAlign:'left'}}>
            <li>Invitation inauguration</li>
            <li>Ateliers spécialisés</li>
            <li>Soirée gala exclusive</li>
            <li>Conférences</li>
            <li>Déjeuners networking</li>
          </ul>
          <Button>Choisir Premium VIP</Button>
        </div>
      </div>
      <p style={{marginTop:16}}>Ce flow est un stub - paiement par virement bancaire.</p>
      <Link to="/visitor/subscription"><Button variant="outline" style={{marginTop:12}}>Retour</Button></Link>
    </div>
  );
}
