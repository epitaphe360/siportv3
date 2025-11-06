import React, { useState, useEffect } from 'react';
import { 
  Save,
  ArrowLeft,
  Tag,
  DollarSign,
  Info
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';
import { SupabaseService } from '../../services/supabaseService';
import { Product } from '../../types';
import MultiImageUploader from '../ui/MultiImageUploader';

interface ProductEditFormProps {
  productId?: string;
  exhibitorId: string;
  product?: Product;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProductEditForm({ 
  productId, 
  exhibitorId, 
  product, 
  onSave, 
  onCancel 
}: ProductEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    images: [] as string[],
    specifications: '',
    price: '',
    featured: false
  });

  // Remplir le formulaire avec les données du produit existant
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        images: product.images || [],
        specifications: product.specifications || '',
        price: product.price ? product.price.toString() : '',
        featured: product.featured || false
      });
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImagesUploaded = (urls: string[]) => {
    setFormData(prev => ({ ...prev, images: urls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Préparer les données pour l'envoi
      const productData = {
        exhibitorId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        images: formData.images,
        specifications: formData.specifications,
        price: formData.price ? parseFloat(formData.price) : undefined,
        featured: formData.featured
      };

      if (productId) {
        // Mise à jour d'un produit existant
        await SupabaseService.updateProduct(productId, productData);
        toast.success('Produit mis à jour avec succès !');
      } else {
        // Création d'un nouveau produit
        await SupabaseService.createProduct(productData);
        toast.success('Produit créé avec succès !');
      }

      onSave();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error('Erreur lors de l\'enregistrement. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 bg-gray-50 border-b flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {productId ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            onClick={onCancel}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Enregistrer
          </Button>
        </div>
      </div>
      
      <form className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informations du produit
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du produit *
                  </label>
                  <input type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                   aria-label="Name" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie *
                    </label>
                    <input type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ex: Logiciels, Équipements..."
                      required
                     aria-label="ex: Logiciels, Équipements..." />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix (€)
                    </label>
                    <div className="flex items-center">
                      <div className="bg-gray-100 px-3 py-2 rounded-l-lg border border-gray-300 border-r-0">
                        <DollarSign className="h-5 w-5 text-gray-500" />
                      </div>
                      <input type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ex: 1999.99"
                        min="0"
                        step="0.01"
                       aria-label="ex: 1999.99" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spécifications techniques
                  </label>
                  <textarea
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dimensions, matériaux, caractéristiques techniques..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    id="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    Produit vedette (mis en avant sur la page d'accueil)
                  </label>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Colonne droite - Images */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Images du produit
              </h3>
              
              <MultiImageUploader
                onImagesUploaded={handleImagesUploaded}
                currentImages={formData.images}
                bucketName="products"
                folderName={exhibitorId}
                label="Images du produit"
                maxSizeMB={5}
                maxImages={8}
              />
              
              <div className="mt-4 flex items-start space-x-2 text-sm text-gray-500">
                <Info className="h-4 w-4 mt-0.5" />
                <p>Les images seront affichées dans l'ordre de téléchargement. La première image sera l'image principale du produit.</p>
              </div>
            </Card>
            
            {/* Aperçu du produit */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Aperçu
              </h3>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {formData.images.length > 0 ? (
                  <img 
                    src={formData.images[0]}
                    alt={formData.name} 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/siports-logo.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <Tag className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {formData.category || 'Catégorie'}
                    </span>
                    {formData.featured && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Vedette
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {formData.name || 'Nom du produit'}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {formData.description || 'Description du produit...'}
                  </p>
                  
                  {formData.price && (
                    <p className="text-lg font-bold text-blue-600">
                      {parseFloat(formData.price).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
