import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { SupabaseService } from '../../services/supabaseService';

interface MiniSiteWizardProps {
  onSuccess?: () => void;
}

const steps = [
  { label: 'Nom de la société', key: 'company', type: 'text', placeholder: 'Votre société' },
  { label: 'Logo', key: 'logo', type: 'file', placeholder: '' },
  { label: 'Description', key: 'description', type: 'textarea', placeholder: 'Décrivez votre activité...' },
  { label: 'Documents (PDF, Brochure...)', key: 'documents', type: 'file', multiple: true, placeholder: '' },
  { label: 'Produits principaux', key: 'products', type: 'textarea', placeholder: 'Listez vos produits phares...' },
  { label: 'Réseaux sociaux', key: 'socials', type: 'text', placeholder: 'Lien LinkedIn, Facebook...' },
];

export default function MiniSiteWizard({ onSuccess }: MiniSiteWizardProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files, type } = e.target as any;
    if (type === 'file') {
      setForm({ ...form, [name]: files });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleNext = () => {
    setStep(s => Math.min(s + 1, steps.length - 1));
  };
  const handlePrev = () => {
    setStep(s => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Pour l'instant, on ne gère pas l'upload de fichiers
      // Les URLs des fichiers seront gérées plus tard dans l'interface d'administration
      const logoUrl = '';
      const docsUrls: string[] = [];

      // Créer le mini-site en utilisant SupabaseService
      const created = await SupabaseService.createMiniSite({
        company: form.company,
        logo: logoUrl,
        description: form.description,
        products: form.products,
        socials: form.socials,
        documents: docsUrls,
      });

      console.log('createMiniSite result:', created);
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (e: any) {
      console.error('MiniSiteWizard handleSubmit error:', e);
      setError(e?.message || 'Erreur lors de la création du mini-site.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <div className="text-lg font-bold mb-2">Mini-site généré avec succès !</div>
        <div className="text-gray-600 mb-4">Vous pouvez maintenant le personnaliser ou le partager.</div>
        <a href="/minisite" target="_blank" rel="noopener noreferrer">
          <Button className="mb-2 w-full">Voir mon mini-site</Button>
        </a>
        <Button variant="outline" onClick={onSuccess} className="w-full">Retour au dashboard</Button>
      </Card>
    );
  }

  const current = steps[step];

  return (
    <Card className="max-w-lg mx-auto p-8 mt-8">
      <div className="mb-6 text-xl font-bold text-center">Création rapide de votre mini-site</div>
      <form onSubmit={e => { e.preventDefault(); step === steps.length - 1 ? handleSubmit() : handleNext(); }}>
        <div className="mb-4">
          <label className="block font-medium mb-2">{current.label}</label>
          {current.type === 'text' && (
            <Input name={current.key} value={form[current.key] || ''} onChange={handleChange} placeholder={current.placeholder} required />
          )}
          {current.type === 'textarea' && (
            <Textarea name={current.key} value={form[current.key] || ''} onChange={handleChange} placeholder={current.placeholder} required />
          )}
          {current.type === 'file' && (
            <Input name={current.key} type="file" onChange={handleChange} multiple={current.multiple} />
          )}
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={handlePrev} disabled={step === 0}>Précédent</Button>
          {step < steps.length - 1 ? (
            <Button type="submit">Suivant</Button>
          ) : (
            <Button type="submit" disabled={loading}>
              {loading ? 'Génération en cours...' : 'Générer mon mini-site'}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
