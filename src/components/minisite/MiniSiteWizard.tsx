import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { SupabaseService } from '../../services/supabaseService';
import AiAgentService from '../../services/aiAgentService';
import { validateUrl, extractDomain } from '../../utils/urlValidator';
import { MiniSitePreviewModal } from './MiniSitePreviewModal';
import { AlertCircle, Loader } from 'lucide-react';
import useAuthStore from '../../store/authStore';

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
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importUrl, setImportUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

  // Validation de l'URL en temps réel
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImportUrl(url);
    setUrlError(null);
    
    if (url.trim().length > 0) {
      const validation = validateUrl(url);
      if (!validation.isValid) {
        setUrlError(validation.error || 'URL invalide');
      }
    }
  };

  // Génération automatique avec prévisualisation
  const handleAutoGenerate = async () => {
    setError(null);
    setUrlError(null);

    // Valider l'URL
    const validation = validateUrl(importUrl);
    if (!validation.isValid) {
      setUrlError(validation.error || 'URL invalide');
      return;
    }

    setLoading(true);
    
    try {
      const domain = extractDomain(validation.normalizedUrl || importUrl);
      
      // Appel au service de scraping
      const generated = await AiAgentService.generate(validation.normalizedUrl || importUrl);
      
      // Stocker les données scrapées
      setScrapedData(generated);
      
      // Afficher la prévisualisation
      setShowPreview(true);
      
    } catch (aiError: any) {
      console.error('❌ Erreur agent IA:', aiError);
      
      // Messages d'erreur plus explicites
      if (aiError.message?.includes('timeout')) {
        setError(`Le site ${extractDomain(importUrl)} met trop de temps à répondre. Veuillez réessayer ou utiliser le mode manuel.`);
      } else if (aiError.message?.includes('404') || aiError.message?.includes('Fetch failed')) {
        setError(`Le site ${extractDomain(importUrl)} n'est pas accessible. Vérifiez l'URL et réessayez.`);
      } else if (aiError.message?.includes('Agent IA indisponible')) {
        setError('Le service de génération automatique est temporairement indisponible. Veuillez utiliser le mode manuel ou réessayer plus tard.');
      } else {
        setError(`Impossible de récupérer les informations du site. ${aiError.message || 'Erreur inconnue'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Confirmation de création depuis la prévisualisation
  const handleConfirmCreation = async () => {
    if (!scrapedData) return;
    
    setIsCreating(true);
    setError(null);

    try {
      // Préparation des données pour la création du mini-site
      const miniSiteData = {
        company: scrapedData.company || 'Entreprise',
        logo: scrapedData.logo || '',
        description: scrapedData.description || '',
        products: Array.isArray(scrapedData.products) ? scrapedData.products : [],
        socials: Array.isArray(scrapedData.socials) ? scrapedData.socials : [],
        documents: scrapedData.documents || [],
        sections: scrapedData.sections || [],
        contact: scrapedData.contact || {}
      };


      // Vérifier que l'utilisateur est connecté
      if (!user?.id) {
        throw new Error('Vous devez être connecté pour créer un mini-site');
      }

      // CRITICAL FIX: Récupérer l'exhibitorId depuis le profil utilisateur
      let exhibitorId = user.id; // Fallback au userId
      try {
        const exhibitor = await SupabaseService.getExhibitorByUserId(user.id);
        if (exhibitor?.id) {
          exhibitorId = exhibitor.id;
        }
      } catch (err) {
        console.warn('Utilisation du userId comme exhibitorId:', err);
      }

      // Création du mini-site avec l'exhibitorId correct
      const created = await SupabaseService.createMiniSite(exhibitorId, miniSiteData);

      // Publication automatique
      try {
        await SupabaseService.updateMiniSite(exhibitorId, {
          published: true
        });
      } catch (pubErr) {
        console.warn('⚠️ Impossible de publier automatiquement:', pubErr);
      }

      setSuccess(true);
      setShowPreview(false);
      if (onSuccess) onSuccess();
      
    } catch (e: any) {
      console.error('❌ Erreur création mini-site:', e);
      setError(e?.message || 'Erreur lors de la création du mini-site.');
      setShowPreview(false);
    } finally {
      setIsCreating(false);
    }
  };

  // Édition des données depuis la prévisualisation
  const handleEditFromPreview = () => {
    // Pré-remplir le formulaire avec les données scrapées
    if (scrapedData) {
      setForm({
        company: scrapedData.company || '',
        description: scrapedData.description || '',
        products: Array.isArray(scrapedData.products) 
          ? scrapedData.products.map((p: any) => p.name).join('\n')
          : '',
        socials: Array.isArray(scrapedData.socials) 
          ? scrapedData.socials.join(', ')
          : ''
      });
    }
    setShowPreview(false);
    setStep(0); // Retour au début du formulaire manuel
  };

  // Soumission manuelle
  const handleManualSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const miniSiteData = {
        company: form.company || 'Entreprise',
        logo: form.logo || '',
        description: form.description || '',
        products: typeof form.products === 'string' ? form.products.split('\n').filter(Boolean) : [],
        socials: typeof form.socials === 'string' ? form.socials.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        documents: form.documents || [],
      };


      // Vérifier que l'utilisateur est connecté
      if (!user?.id) {
        throw new Error('Vous devez être connecté pour créer un mini-site');
      }

      // CRITICAL FIX: Récupérer l'exhibitorId depuis le profil utilisateur
      let exhibitorId = user.id; // Fallback au userId
      try {
        const exhibitor = await SupabaseService.getExhibitorByUserId(user.id);
        if (exhibitor?.id) {
          exhibitorId = exhibitor.id;
        }
      } catch (err) {
        console.warn('Utilisation du userId comme exhibitorId:', err);
      }

      const created = await SupabaseService.createMiniSite(exhibitorId, miniSiteData);

      // Publication automatique
      try {
        await SupabaseService.updateMiniSite(exhibitorId, {
          published: true
        });
      } catch (pubErr) {
        console.warn('⚠️ Publication automatique échouée:', pubErr);
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
    <>
      <Card className="max-w-lg mx-auto p-8 mt-8">
        <div className="mb-6 text-xl font-bold text-center">🚀 Création de votre mini-site</div>
        
        {/* Mode automatique avec URL prioritaire */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="block font-medium mb-2 text-blue-800">
            ✨ Création automatique depuis votre site web
          </label>
          <input 
            type="url" 
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 ${
              urlError ? 'border-red-500' : 'border-blue-300'
            }`}
            placeholder="https://votresite.com" 
            value={importUrl} 
            onChange={handleUrlChange}
            disabled={loading}
            data-testid="input-website-url"
          />
          {urlError && (
            <div className="flex items-start space-x-2 mt-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{urlError}</span>
            </div>
          )}
          <div className="text-sm text-blue-600 mt-2">
            🤖 Notre IA récupérera automatiquement : nom, logo, description, produits, contacts et réseaux sociaux.
          </div>
          {importUrl && !urlError && (
            <Button 
              onClick={handleAutoGenerate} 
              disabled={loading} 
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
              data-testid="button-auto-generate"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Génération automatique en cours...</span>
                </span>
              ) : (
                '🚀 Créer automatiquement mon mini-site'
              )}
            </Button>
          )}
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-red-900">Erreur</div>
                <div className="text-sm text-red-700 mt-1">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Mode manuel en option */}
        <div className="border-t pt-4">
          <div className="text-center text-gray-500 mb-4 text-sm">
            Ou remplissez manuellement les informations
          </div>
          
          <form onSubmit={e => { e.preventDefault(); step === steps.length - 1 ? handleManualSubmit() : handleNext(); }}>
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
            <div className="flex justify-between mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePrev} 
                disabled={step === 0 || loading}
                data-testid="button-previous"
              >
                Précédent
              </Button>
              {step < steps.length - 1 ? (
                <Button type="submit" disabled={loading} data-testid="button-next">Suivant</Button>
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

      {/* Modal de prévisualisation */}
      {showPreview && scrapedData && (
        <MiniSitePreviewModal
          data={scrapedData}
          onConfirm={handleConfirmCreation}
          onEdit={handleEditFromPreview}
          onCancel={() => setShowPreview(false)}
          isCreating={isCreating}
        />
      )}
    </>
  );
}
