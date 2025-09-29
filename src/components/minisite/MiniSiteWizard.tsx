import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { SupabaseService } from '../../services/supabaseService';
import AiAgentService from '../../services/aiAgentService';

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
  const [importUrl, setImportUrl] = useState<string>('');

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
      // Création automatique complète du mini-site
      let miniSiteData;
      
      // Si une URL est fournie, générer automatiquement le contenu
      if (importUrl && importUrl.trim().length > 0) {
        console.log('🚀 Génération automatique du mini-site depuis:', importUrl.trim());
        
        try {
          // Génération du contenu via l'agent IA
          const generated = await AiAgentService.generate(importUrl.trim());
          console.log('✅ Contenu généré:', generated);
          
          // Préparation des données pour la création du mini-site
          miniSiteData = {
            company: generated.company || 'Entreprise',
            logo: generated.logo || '',
            description: generated.description || '',
            products: Array.isArray(generated.products) ? generated.products.join('\n') : (generated.products || ''),
            socials: Array.isArray(generated.socials) ? generated.socials.join(', ') : (generated.socials || ''),
            documents: generated.documents || [],
          };
        } catch (aiError) {
          console.error('❌ Erreur agent IA:', aiError);
          setError('Impossible de récupérer les informations du site web. Vérifiez l\'URL et réessayez.');
          setLoading(false);
          return;
        }
      } else {
        // Utilisation des données du formulaire manuel
        miniSiteData = {
          company: form.company || 'Entreprise',
          logo: form.logo || '',
          description: form.description || '',
          products: typeof form.products === 'string' ? form.products : JSON.stringify(form.products || []),
          socials: typeof form.socials === 'string' ? form.socials : JSON.stringify(form.socials || []),
          documents: form.documents || [],
        };
      }

      console.log('🔄 Création du mini-site avec les données:', miniSiteData);
      
      // Création et publication automatique du mini-site
      const created = await SupabaseService.createMiniSite(miniSiteData);
      console.log('✅ Mini-site créé:', created);

      // Publication automatique du mini-site
      try {
        const miniSite = Array.isArray(created) ? created[0] : created;
        if (miniSite && (miniSite.id || miniSite.exhibitor_id)) {
          const exhibitorId = miniSite.exhibitor_id || miniSite.id;
          await SupabaseService.updateMiniSite(exhibitorId, { 
            ...miniSite, 
            published: true 
          });
          console.log('✅ Mini-site publié automatiquement');
        }
      } catch (pubErr) {
        console.warn('⚠️ Impossible de publier automatiquement:', pubErr);
        // Le mini-site est créé même si la publication échoue
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      
    } catch (e: any) {
      console.error('❌ Erreur création mini-site:', e);
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
      <div className="mb-6 text-xl font-bold text-center">🚀 Création automatique de votre mini-site</div>
      
      {/* Mode automatique avec URL prioritaire */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <label className="block font-medium mb-2 text-blue-800">
          ✨ Création automatique depuis votre site web
        </label>
        <input 
          type="url" 
          className="w-full p-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
          placeholder="https://votresite.com" 
          value={importUrl} 
          onChange={e => setImportUrl(e.target.value)}
          data-testid="input-website-url"
        />
        <div className="text-sm text-blue-600 mt-2">
          🤖 Notre IA récupérera automatiquement toutes les informations de votre site : nom, logo, description, produits, etc.
        </div>
        {importUrl && (
          <Button 
            onClick={handleSubmit} 
            disabled={loading} 
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
            data-testid="button-auto-generate"
          >
            {loading ? '🔄 Génération automatique en cours...' : '🚀 Créer automatiquement mon mini-site'}
          </Button>
        )}
      </div>

      {/* Mode manuel en option */}
      <div className="border-t pt-4">
        <div className="text-center text-gray-500 mb-4 text-sm">
          Ou remplissez manuellement les informations
        </div>
        
        <form onSubmit={e => { e.preventDefault(); step === steps.length - 1 ? handleSubmit() : handleNext(); }}>
          <div className="mb-4">
            <label className="block font-medium mb-2">{current.label}</label>
            {current.type === 'text' && (
              <Input 
                name={current.key} 
                value={form[current.key] || ''} 
                onChange={handleChange} 
                placeholder={current.placeholder} 
                required 
                data-testid={`input-${current.key}`}
              />
            )}
            {current.type === 'textarea' && (
              <Textarea 
                name={current.key} 
                value={form[current.key] || ''} 
                onChange={handleChange} 
                placeholder={current.placeholder} 
                required 
                data-testid={`textarea-${current.key}`}
              />
            )}
            {current.type === 'file' && (
              <Input 
                name={current.key} 
                type="file" 
                onChange={handleChange} 
                multiple={current.multiple} 
                data-testid={`file-${current.key}`}
              />
            )}
          </div>
          {error && <div className="text-red-500 mb-2" data-testid="error-message">{error}</div>}
          <div className="flex justify-between mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handlePrev} 
              disabled={step === 0}
              data-testid="button-previous"
            >
              Précédent
            </Button>
            {step < steps.length - 1 ? (
              <Button type="submit" data-testid="button-next">Suivant</Button>
            ) : (
              <Button 
                type="submit" 
                disabled={loading}
                data-testid="button-manual-generate"
              >
                {loading ? 'Génération en cours...' : 'Générer mon mini-site'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </Card>
  );
}
