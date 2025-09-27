import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function VisitorUpgrade() {
  return (
    <div style={{padding:24}}>
      <h1>Mettre à niveau votre compte</h1>
      <p>Choisissez un niveau et simulez un paiement pour les tests.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginTop:12}}>
        <div style={{padding:12,border:'1px solid #eaeaea',borderRadius:8}}>
          <h3>Basic</h3>
          <p>2 RDV</p>
          <Button>Choisir Basic</Button>
        </div>
        <div style={{padding:12,border:'1px solid #eaeaea',borderRadius:8}}>
          <h3>Premium</h3>
          <p>5 RDV</p>
          <Button>Choisir Premium</Button>
        </div>
        <div style={{padding:12,border:'1px solid #eaeaea',borderRadius:8}}>
          <h3>VIP</h3>
          <p>RDV illimités</p>
          <Button>Choisir VIP</Button>
        </div>
      </div>
      <p style={{marginTop:16}}>Ce flow est un stub - intégration Stripe/PayPal à prévoir.</p>
      <Link to="/visitor/subscription"><Button variant="outline" style={{marginTop:12}}>Retour</Button></Link>
    </div>
  );
}
