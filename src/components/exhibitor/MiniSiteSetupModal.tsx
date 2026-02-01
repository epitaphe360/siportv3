import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Globe, Zap, FileText, ArrowRight, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { aiScrapperService } from '../../services/aiScrapperService';

interface MiniSiteSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const MiniSiteSetupModal: React.FC<MiniSiteSetupModalProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'choice' | 'auto' | 'manual'>('choice');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);

  // Validate URL
  const handleUrlChange = (value: string) => {
    setWebsiteUrl(value);
    try {
      const url = new URL(value);
      setIsValidUrl(url.protocol === 'http:' || url.protocol === 'https:');
    } catch {
      setIsValidUrl(false);
    }
  };

  // Handle automatic mini-site creation via scraping
  const handleAutoCreate = async () => {
    if (!websiteUrl || !isValidUrl) {
      toast.error('Veuillez entrer une URL valide');
      return;
    }

    setIsLoading(true);

    try {
      // Check if API key is configured
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        toast.info(
          '⚙️ Configuration requise : La clé API OpenAI doit être ajoutée dans le fichier .env',
          { duration: 5000 }
        );
        console.warn('⚠️ VITE_OPENAI_API_KEY not configured');
        setMode('manual');
        setIsLoading(false);
        return;
      }

      // Use AI Scrapper Service directly
      toast.loading('🔍 Analyse de votre site web en cours...', { id: 'scraping' });
      
      const scrapResult = await aiScrapperService.scrapExhibitorMiniSite(websiteUrl);

      if (!scrapResult.success) {
        throw new Error(scrapResult.error || 'Échec du scraping');
      }

      toast.dismiss('scraping');
      toast.loading('💾 Création de votre mini-site...', { id: 'creating' });

      // Get current user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_name, description')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Update user with scraped data
      const updateData: any = {
        minisite_created: true,
        company_name: scrapResult.data.companyName || userData.company_name,
        description: scrapResult.data.description || userData.description,
        website: websiteUrl
      };

      // Update logo if found
      if (scrapResult.data.logo) {
        updateData.logo_url = scrapResult.data.logo;
      }

      await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      // Create products if found
      if (scrapResult.data.products && scrapResult.data.products.length > 0) {
        // Resolve exhibitor ID first
        const { data: exhibitor } = await supabase
          .from('exhibitors')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        
        const targetExhibitorId = exhibitor?.id || userId; // Fallback to userId if no exhibitor entry

        const products = scrapResult.data.products.map((product: any) => ({
          exhibitor_id: targetExhibitorId,
          name: product.name,
          description: product.description,
          category: product.category || 'Autre',
          images: product.image ? [product.image] : []
        }));

        await supabase
          .from('products')
          .insert(products);
      }

      toast.dismiss('creating');
      toast.success('🎉 Mini-site créé automatiquement avec succès !', { duration: 5000 });
      onClose();

      // Redirect to mini-site editor
      navigate(ROUTES.MINISITE_EDITOR);
    } catch (error: any) {
      console.error('Error creating auto mini-site:', error);
      toast.dismiss('scraping');
      toast.dismiss('creating');
      
      // Handle specific errors
      if (error?.message?.includes('API key')) {
        toast.error(
          '⚙️ Configuration requise : Veuillez ajouter la clé API OpenAI.',
          { duration: 6000 }
        );
      } else if (error?.message?.includes('CORS') || error?.message?.includes('Failed to fetch')) {
        toast.error(
          '⚠️ Impossible d\'accéder au site web. Vérifiez l\'URL ou utilisez la création manuelle.',
          { duration: 6000 }
        );
      } else {
        toast.error(
          'Impossible de créer le mini-site automatiquement. Essayez la création manuelle.',
          { duration: 5000 }
        );
      }
      setMode('manual');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual mini-site creation
  const handleManualCreate = async () => {
    setIsLoading(true);

    try {
      // Mark minisite as created (will be filled manually)
      await supabase
        .from('users')
        .update({ minisite_created: true })
        .eq('id', userId);

      toast.success('Vous allez être redirigé vers l\'éditeur de mini-site');
      onClose();

      // Redirect to mini-site wizard
      navigate(ROUTES.MINISITE_CREATION);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle skip (remind later)
  const handleSkip = async () => {
    try {
      // ✅ CORRECTION: Marquer minisite_created = true pour ne plus afficher la popup
      // L'utilisateur pourra toujours créer son mini-site depuis le dashboard
      await supabase
        .from('users')
        .update({ minisite_created: true })
        .eq('id', userId);

      toast.success('Vous pourrez créer votre mini-site plus tard depuis votre tableau de bord');
      onClose();
    } catch (error) {
      console.error('Error marking minisite as skipped:', error);
      // Fermer quand même la popup même si l'update échoue
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-t-2xl relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      🎉 Bienvenue sur SIPORTS 2026 !
                    </h2>
                    <p className="text-blue-100">
                      Votre compte exposant a été activé avec succès
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {mode === 'choice' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Créez votre Mini-Site Exposant
                      </h3>
                      <p className="text-gray-600">
                        Choisissez comment vous souhaitez créer votre mini-site professionnel
                      </p>
                    </div>

                    {/* Option 1: Automatic */}
                    <div
                      className="border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50"
                      onClick={() => setMode('auto')}
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-600 p-3 rounded-full">
                          <Zap className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-xl font-bold text-gray-900">
                              Création Automatique (Recommandé)
                            </h4>
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                              IA
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">
                            Notre système scrape votre site web officiel et remplit automatiquement
                            votre mini-site avec vos informations, produits, et images.
                          </p>
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">2-3 minutes chrono</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Option 2: Manual */}
                    <div
                      className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-400 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setMode('manual')}
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-600 p-3 rounded-full">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-2">
                            Création Manuelle
                          </h4>
                          <p className="text-gray-600 mb-3">
                            Remplissez votre mini-site étape par étape avec notre éditeur guidé.
                            Vous avez le contrôle total sur chaque élément.
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">10-15 minutes</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Option 3: Skip for now */}
                    <div className="text-center pt-4 border-t">
                      <button
                        onClick={handleSkip}
                        className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                      >
                        Je créerai mon mini-site plus tard
                      </button>
                    </div>
                  </motion.div>
                )}

                {mode === 'auto' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <button
                        onClick={() => setMode('choice')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
                      >
                        ← Retour aux options
                      </button>

                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Création Automatique par IA
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Entrez l'URL de votre site web officiel. Notre système va analyser
                        et extraire automatiquement vos informations.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="websiteUrl">URL de votre site web *</Label>
                      <div className="relative mt-2">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="websiteUrl"
                          type="url"
                          placeholder="https://www.votre-entreprise.com"
                          value={websiteUrl}
                          onChange={(e) => handleUrlChange(e.target.value)}
                          className="pl-10"
                          autoFocus
                        />
                      </div>
                      {websiteUrl && !isValidUrl && (
                        <p className="text-red-500 text-sm mt-1">
                          Veuillez entrer une URL valide (http:// ou https://)
                        </p>
                      )}
                      {isValidUrl && (
                        <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                          <span>✓</span> URL valide
                        </p>
                      )}
                    </div>

                    {/* What will be extracted */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3">
                        🤖 Ce qui sera extrait automatiquement :
                      </h4>
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">•</span>
                          Nom de l'entreprise et logo
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">•</span>
                          Description et présentation
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">•</span>
                          Produits et services
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">•</span>
                          Images et galerie photos
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">•</span>
                          Liens réseaux sociaux
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-blue-600">•</span>
                          Coordonnées de contact
                        </li>
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                      <Button
                        onClick={handleAutoCreate}
                        disabled={!isValidUrl || isLoading}
                        className="flex-1"
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                            Création en cours...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Créer Automatiquement
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {mode === 'manual' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <button
                        onClick={() => setMode('choice')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
                      >
                        ← Retour aux options
                      </button>

                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Création Manuelle
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Vous allez être redirigé vers notre éditeur guidé pour créer
                        votre mini-site étape par étape.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        📝 Étapes de création :
                      </h4>
                      <ol className="space-y-2 text-sm text-gray-700">
                        <li className="flex gap-3">
                          <span className="font-bold text-blue-600">1.</span>
                          <span>Informations de l'entreprise</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-blue-600">2.</span>
                          <span>Personnalisation du thème (couleurs, polices)</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-blue-600">3.</span>
                          <span>Ajout de produits et services</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-blue-600">4.</span>
                          <span>Upload d'images et médias</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-blue-600">5.</span>
                          <span>Prévisualisation et publication</span>
                        </li>
                      </ol>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={handleManualCreate}
                        disabled={isLoading}
                        className="flex-1"
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                            Redirection...
                          </>
                        ) : (
                          <>
                            Commencer la Création
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
