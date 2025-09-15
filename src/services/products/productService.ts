import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { StorageService } from '../storage/storageService';

/**
 * Service pour gérer les produits des exposants
 */
export class ProductService {
  /**
   * Récupère tous les produits d'un exposant
   * @param exhibitorId ID de l'exposant
   * @returns Liste des produits
   */
  static async getProductsByExhibitor(exhibitorId: string): Promise<Product[]> {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('exhibitor_id', exhibitorId);

    if (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }

    // Convertir en format Product
    return (data as any[]).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      images: item.images || [],
      specifications: item.specifications || undefined,
      price: item.price || undefined,
      featured: item.featured,
      technicalSpecs: item.technical_specs || []
    }));
  }

  /**
   * Récupère un produit par son ID
   * @param productId ID du produit
   * @returns Détails du produit
   */
  static async getProductById(productId: string): Promise<Product> {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      throw error;
    }

    return {
      id: (data as any).id,
      name: (data as any).name,
      description: (data as any).description,
      category: (data as any).category,
      images: (data as any).images || [],
      specifications: (data as any).specifications || undefined,
      price: (data as any).price || undefined,
      featured: (data as any).featured,
      technicalSpecs: (data as any).technical_specs || []
    };
  }

  /**
   * Crée un nouveau produit
   * @param exhibitorId ID de l'exposant
   * @param product Données du produit
   * @param imageFiles Fichiers images à télécharger
   * @returns Le produit créé avec les URLs des images
   */
  static async createProduct(
    exhibitorId: string,
    product: Omit<Product, 'id' | 'images'>,
    imageFiles?: File[]
  ): Promise<Product> {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    // Télécharger les images si fournies
    let imageUrls: string[] = [];
    
    if (imageFiles && imageFiles.length > 0) {
      try {
        // Créer le bucket si nécessaire
        await StorageService.createBucketIfNotExists('products');
        
        // Générer un ID temporaire pour le dossier (sera remplacé par l'ID réel après création)
        const tempId = crypto.randomUUID();
        imageUrls = await StorageService.uploadMultipleImages(
          imageFiles, 
          'products', 
          `${exhibitorId}/${tempId}`
        );
      } catch (err) {
        console.error('Erreur lors du téléchargement des images:', err);
        throw err;
      }
    }

    // Insérer le produit dans la base de données
    const { data, error } = await supabase
      .from('products')
      .insert([{
        exhibitor_id: exhibitorId,
        name: product.name,
        description: product.description,
        category: product.category,
        images: imageUrls,
        specifications: product.specifications,
        price: product.price,
        featured: product.featured,
        technical_specs: product.technicalSpecs
      }] as any)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du produit:', error);
      
      // En cas d'erreur, supprimer les images téléchargées
      if (imageUrls.length > 0) {
        await Promise.all(
          imageUrls.map(url => StorageService.deleteImage(url, 'products'))
        ).catch(err => console.error('Erreur lors de la suppression des images:', err));
      }
      
      throw error;
    }

    // Si les images ont été téléchargées avec un ID temporaire, les déplacer vers le dossier avec l'ID réel
    if (imageUrls.length > 0) {
      try {
        const updatedImageUrls = await this.moveProductImages(
          exhibitorId,
          (data as any).id,
          imageUrls
        );
        
        // Mettre à jour le produit avec les nouvelles URLs
        const { error: updateError } = await (supabase as any)
          .from('products')
          .update({ images: updatedImageUrls })
          .eq('id', (data as any).id);
          
        if (updateError) {
          console.error('Erreur lors de la mise à jour des URLs d\'images:', updateError);
        } else {
          // Remplacer les URLs dans l'objet à retourner
          (data as any).images = updatedImageUrls;
        }
      } catch (err) {
        console.error('Erreur lors du déplacement des images:', err);
      }
    }

    return {
      id: (data as any).id,
      name: (data as any).name,
      description: (data as any).description,
      category: (data as any).category,
      images: (data as any).images || [],
      specifications: (data as any).specifications || undefined,
      price: (data as any).price || undefined,
      featured: (data as any).featured,
      technicalSpecs: (data as any).technical_specs || []
    };
  }

  /**
   * Met à jour un produit existant
   * @param productId ID du produit
   * @param updates Modifications à appliquer
   * @param newImageFiles Nouveaux fichiers images à télécharger
   * @param imagesToDelete URLs des images à supprimer
   * @returns Le produit mis à jour
   */
  static async updateProduct(
    productId: string,
    exhibitorId: string,
    updates: Partial<Omit<Product, 'id'>>,
    newImageFiles?: File[],
    imagesToDelete?: string[]
  ): Promise<Product> {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    // Récupérer le produit actuel
    const currentProduct = await this.getProductById(productId);
    
    // Gérer les images à supprimer
    let remainingImages = [...currentProduct.images];
    if (imagesToDelete && imagesToDelete.length > 0) {
      // Supprimer les images du stockage
      await Promise.all(
        imagesToDelete.map(url => StorageService.deleteImage(url, 'products'))
      ).catch(err => console.error('Erreur lors de la suppression des images:', err));
      
      // Filtrer les images restantes
      remainingImages = currentProduct.images.filter(url => !imagesToDelete.includes(url));
    }
    
    // Télécharger les nouvelles images
    let newImageUrls: string[] = [];
    if (newImageFiles && newImageFiles.length > 0) {
      try {
        // Créer le bucket si nécessaire
        await StorageService.createBucketIfNotExists('products');
        
        newImageUrls = await StorageService.uploadMultipleImages(
          newImageFiles, 
          'products', 
          `${exhibitorId}/${productId}`
        );
      } catch (err) {
        console.error('Erreur lors du téléchargement des nouvelles images:', err);
        throw err;
      }
    }
    
    // Combiner les images restantes et les nouvelles images
    const updatedImages = [...remainingImages, ...newImageUrls];
    
    // Préparer les données à mettre à jour
    const updateData: any = {
      ...updates,
      images: updatedImages
    };
    
    // Convertir les champs techniques pour la base de données
    if (updates.technicalSpecs) {
      updateData.technical_specs = updates.technicalSpecs;
      delete updateData.technicalSpecs;
    }
    
    // Mettre à jour le produit
    const { data, error } = await (supabase as any)
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      
      // En cas d'erreur, supprimer les nouvelles images téléchargées
      if (newImageUrls.length > 0) {
        await Promise.all(
          newImageUrls.map(url => StorageService.deleteImage(url, 'products'))
        ).catch(err => console.error('Erreur lors de la suppression des nouvelles images:', err));
      }
      
      throw error;
    }

    return {
      id: (data as any).id,
      name: (data as any).name,
      description: (data as any).description,
      category: (data as any).category,
      images: (data as any).images || [],
      specifications: (data as any).specifications || undefined,
      price: (data as any).price || undefined,
      featured: (data as any).featured,
      technicalSpecs: (data as any).technical_specs || []
    };
  }

  /**
   * Supprime un produit
   * @param productId ID du produit
   * @returns true si la suppression a réussi
   */
  static async deleteProduct(productId: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    // Récupérer le produit pour obtenir les URLs des images
    const product = await this.getProductById(productId);
    
    // Supprimer le produit de la base de données
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      throw error;
    }
    
    // Supprimer les images du stockage
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map(url => StorageService.deleteImage(url, 'products'))
      ).catch(err => console.error('Erreur lors de la suppression des images:', err));
    }

    return true;
  }

  /**
   * Déplace les images d'un produit d'un dossier temporaire vers le dossier définitif
   * @param exhibitorId ID de l'exposant
   * @param productId ID du produit
   * @param imageUrls URLs des images à déplacer
   * @returns Nouvelles URLs des images
   */
  private static async moveProductImages(
    exhibitorId: string,
    productId: string,
    imageUrls: string[]
  ): Promise<string[]> {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }
    
    const newUrls: string[] = [];
    
    for (const url of imageUrls) {
      try {
        // Extraire le chemin et le nom de fichier de l'URL
        const urlParts = url.split('products/');
        if (urlParts.length < 2) continue;
        
        const filePath = urlParts[1];
        const fileName = filePath.split('/').pop();
        if (!fileName) continue;
        
        // Définir le nouveau chemin
        const newPath = `${exhibitorId}/${productId}/${fileName}`;
        
        // Déplacer le fichier
        await StorageService.moveFile('products', filePath, newPath);
        
        // Générer la nouvelle URL
        const { data: urlData } = supabase!.storage
          .from('products')
          .getPublicUrl(newPath);
        
        newUrls.push(urlData.publicUrl);
      } catch (err) {
        console.error('Erreur lors du déplacement d\'une image:', err);
        // En cas d'erreur, conserver l'URL d'origine
        newUrls.push(url);
      }
    }
    
    return newUrls;
  }

  /**
   * Met à jour l'ordre des images d'un produit
   * @param productId ID du produit
   * @param newOrder Nouvel ordre des URLs d'images
   * @returns Le produit mis à jour
   */
  static async updateProductImagesOrder(
    productId: string,
    newOrder: string[]
  ): Promise<Product> {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    const { data, error } = await (supabase as any)
      .from('products')
      .update({ images: newOrder })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de l\'ordre des images:', error);
      throw error;
    }

    return {
      id: (data as any).id,
      name: (data as any).name,
      description: (data as any).description,
      category: (data as any).category,
      images: (data as any).images || [],
      specifications: (data as any).specifications || undefined,
      price: (data as any).price || undefined,
      featured: (data as any).featured,
      technicalSpecs: (data as any).technical_specs || []
    };
  }
}
