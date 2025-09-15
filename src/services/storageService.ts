import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service pour gérer le stockage des fichiers dans Supabase Storage
 */
export class StorageService {
  /**
   * Télécharge une image dans le bucket Supabase
   * @param file Le fichier à télécharger
   * @param bucket Le nom du bucket (par défaut 'images')
   * @param folder Le dossier de destination (optionnel)
   * @returns L'URL publique de l'image téléchargée
   */
  static async uploadImage(
    file: File,
    bucket: string = 'images',
    folder: string = ''
  ): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image.');
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Télécharger le fichier
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erreur de téléchargement:', error);
      throw error;
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  /**
   * Télécharge une image depuis une URL et la stocke dans Supabase
   * @param imageUrl L'URL de l'image à télécharger
   * @param bucket Le nom du bucket (par défaut 'images')
   * @param folder Le dossier de destination (optionnel)
   * @returns L'URL publique de l'image téléchargée
   */
  static async uploadImageFromUrl(
    imageUrl: string,
    bucket: string = 'images',
    folder: string = ''
  ): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    try {
      // Télécharger l'image depuis l'URL
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Déterminer l'extension à partir du type MIME
      let fileExt = 'jpg'; // par défaut
      const contentType = response.headers.get('content-type');
      if (contentType) {
        if (contentType.includes('png')) fileExt = 'png';
        else if (contentType.includes('jpeg') || contentType.includes('jpg')) fileExt = 'jpg';
        else if (contentType.includes('gif')) fileExt = 'gif';
        else if (contentType.includes('webp')) fileExt = 'webp';
        else if (contentType.includes('svg')) fileExt = 'svg';
      }
      
      // Créer un fichier à partir du blob
      const file = new File([blob], `image.${fileExt}`, { type: contentType || 'image/jpeg' });
      
      // Utiliser la méthode d'upload existante
      return await this.uploadImage(file, bucket, folder);
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image depuis l\'URL:', error);
      throw error;
    }
  }

  /**
   * Supprime un fichier du stockage
   * @param filePath Le chemin du fichier à supprimer
   * @param bucket Le nom du bucket (par défaut 'images')
   */
  static async deleteFile(filePath: string, bucket: string = 'images'): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Erreur de suppression:', error);
      throw error;
    }
  }

  /**
   * Récupère l'URL publique d'un fichier
   * @param filePath Le chemin du fichier
   * @param bucket Le nom du bucket (par défaut 'images')
   * @returns L'URL publique du fichier
   */
  static getPublicUrl(filePath: string, bucket: string = 'images'): string {
    if (!supabase) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Crée un bucket s'il n'existe pas déjà
   * @param bucketName Le nom du bucket à créer
   * @param isPublic Si le bucket doit être public (true par défaut)
   */
  static async createBucketIfNotExists(bucketName: string, isPublic: boolean = true): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    // Vérifier si le bucket existe déjà
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic
      });

      if (error) {
        console.error('Erreur lors de la création du bucket:', error);
        throw error;
      }
    }
  }
}
