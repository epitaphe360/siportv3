import { useState, useCallback } from 'react';
import { StorageService } from '../../services/storage/storageService';

interface UseStorageOptions {
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

interface UseStorageReturn {
  uploadFile: (file: File) => Promise<string>;
  uploadFiles: (files: File[]) => Promise<string[]>;
  deleteFile: (url: string) => Promise<boolean>;
  listFiles: () => Promise<{name: string; url: string; size: number; createdAt: string}[]>;
  loading: boolean;
  error: string | null;
  progress: number;
  clearError: () => void;
}

/**
 * Hook personnalisé pour faciliter l'utilisation du service de stockage dans les composants
 */
export const useStorage = (options: UseStorageOptions = {}): UseStorageReturn => {
  const {
    bucket = 'images',
    folder = '',
    maxSizeMB = 5,
    acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validateFile = useCallback((file: File): boolean => {
    // Vérifier la taille
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Le fichier "${file.name}" dépasse la taille maximale de ${maxSizeMB}MB`);
      return false;
    }

    // Vérifier le type
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      setError(`Le type de fichier "${file.type}" n'est pas accepté. Types acceptés: ${acceptedTypes.join(', ')}`);
      return false;
    }

    return true;
  }, [maxSizeMB, acceptedTypes]);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (!validateFile(file)) {
      return Promise.reject(new Error('Validation du fichier échouée'));
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Créer le bucket si nécessaire
      await StorageService.createBucketIfNotExists(bucket);

      // Simuler la progression
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (Math.random() * 15);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      // Télécharger le fichier
      const url = await StorageService.uploadImage(file, bucket, folder);

      // Progression complète
      clearInterval(interval);
      setProgress(100);

      return url;
    } catch (err: unknown) {
      setError(err.message || 'Erreur lors du téléchargement du fichier');
      throw err;
    } finally {
      setLoading(false);
      // Réinitialiser la progression après un délai
      setTimeout(() => {
        setProgress(0);
      }, 1000);
    }
  }, [bucket, folder, validateFile]);

  const uploadFiles = useCallback(async (files: File[]): Promise<string[]> => {
    // Valider tous les fichiers d'abord
    const validFiles = files.filter(validateFile);

    if (validFiles.length !== files.length) {
      return Promise.reject(new Error('Certains fichiers n\'ont pas passé la validation'));
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Créer le bucket si nécessaire
      await StorageService.createBucketIfNotExists(bucket);

      // Télécharger les fichiers avec progression
      const totalFiles = validFiles.length;
      let completedFiles = 0;

      const updateProgress = () => {
        completedFiles++;
        setProgress(Math.round((completedFiles / totalFiles) * 100));
      };

      const uploadPromises = validFiles.map(async (file) => {
        const url = await StorageService.uploadImage(file, bucket, folder);
        updateProgress();
        return url;
      });

      return Promise.all(uploadPromises);
    } catch (err: unknown) {
      setError(err.message || 'Erreur lors du téléchargement des fichiers');
      throw err;
    } finally {
      setLoading(false);
      // Réinitialiser la progression après un délai
      setTimeout(() => {
        setProgress(0);
      }, 1000);
    }
  }, [bucket, folder, validateFile]);

  const deleteFile = useCallback(async (url: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await StorageService.deleteImage(url, bucket);
      return result;
    } catch (err: unknown) {
      setError(err.message || 'Erreur lors de la suppression du fichier');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bucket]);

  const listFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const files = await StorageService.listFiles(bucket, folder);
      return files;
    } catch (err: unknown) {
      setError(err.message || 'Erreur lors de la récupération des fichiers');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bucket, folder]);

  return {
    uploadFile,
    uploadFiles,
    deleteFile,
    listFiles,
    loading,
    error,
    progress,
    clearError
  };
};

export default useStorage;
