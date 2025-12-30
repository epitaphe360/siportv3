import { ShortcodeRenderer } from '@/components/ShortcodeRenderer';

/**
 * Page de démonstration pour les shortcodes
 * Montre comment intégrer des articles dans n'importe quelle page
 */
export default function ShortcodeDemo() {
  // Exemple de contenu avec des shortcodes
  const pageContent = `
    <h1>Actualités SIPORTS 2025</h1>
    
    <p>Découvrez les dernières nouvelles du salon SIPORTS !</p>
    
    [article id="00000000-0000-0000-0000-000000000401"]
    
    <p>D'autres actualités suivront bientôt...</p>
    
    [article id="00000000-0000-0000-0000-000000000402"]
  `;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-bold text-blue-900 mb-2">
            📋 Démonstration des Shortcodes
          </h2>
          <p className="text-blue-700">
            Cette page montre comment les shortcodes sont automatiquement 
            convertis en articles formatés. Le contenu est chargé dynamiquement 
            depuis la base de données.
          </p>
        </div>

        {/* Contenu avec shortcodes */}
        <ShortcodeRenderer content={pageContent} />

        {/* Guide d'utilisation */}
        <div className="mt-12 p-6 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-bold mb-4">💡 Comment utiliser les shortcodes</h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">1. Copier le shortcode</h4>
              <p className="text-gray-600">
                Depuis le Dashboard Marketing, copiez le code de l'article :
              </p>
              <code className="block mt-2 p-3 bg-white rounded border">
                [article id="00000000-0000-0000-0000-000000000401"]
              </code>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Coller dans votre contenu</h4>
              <p className="text-gray-600">
                Ajoutez le shortcode dans n'importe quelle page, email, ou description :
              </p>
              <pre className="block mt-2 p-3 bg-white rounded border overflow-x-auto">
{`<div>
  <h1>Mon titre</h1>
  <p>Texte d'introduction...</p>
  
  [article id="uuid-de-l-article"]
  
  <p>Texte de conclusion...</p>
</div>`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Le résultat</h4>
              <p className="text-gray-600">
                L'article s'affiche automatiquement avec :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li>Image à la une (si disponible)</li>
                <li>Titre et extrait</li>
                <li>Contenu complet formaté</li>
                <li>Catégorie et tags</li>
                <li>Auteur et date de publication</li>
                <li>Design responsive</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Avantages */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-bold text-green-900 mb-3">✅ Avantages</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Mise à jour automatique du contenu</li>
              <li>• Design cohérent sur tout le site</li>
              <li>• Réutilisable dans plusieurs pages</li>
              <li>• Pas de code HTML complexe à écrire</li>
              <li>• SEO optimisé automatiquement</li>
            </ul>
          </div>

          <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-bold text-orange-900 mb-3">⚠️ À retenir</h4>
            <ul className="space-y-2 text-sm text-orange-700">
              <li>• L'article doit être publié pour être visible</li>
              <li>• L'ID doit être exact (copier-coller recommandé)</li>
              <li>• Les articles supprimés ne s'afficheront plus</li>
              <li>• Vérifier la prévisualisation avant publication</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
