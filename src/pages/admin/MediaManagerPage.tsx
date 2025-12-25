import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import AdminMediaManager from '../../components/admin/media/AdminMediaManager';
import { toast } from 'sonner';

const MediaManagerPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageSelect = (url: string) => {
    setSelectedImage(url);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestionnaire de médias</h1>
        <p className="text-gray-600">
          Gérez tous les fichiers médias de la plateforme. Vous pouvez télécharger, supprimer,
          organiser et utiliser les médias dans différentes parties de l'application.
        </p>
      </div>

      {selectedImage && (
        <div className="mb-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Image sélectionnée</h2>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 border rounded-md overflow-hidden">
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">URL de l'image :</p>
              <div className="flex">
                <input type="text"
                  value={selectedImage}
                  readOnly
                  className="flex-1 p-2 border rounded-l-md text-sm bg-white"
                 aria-label="Text" />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedImage);
                    toast.success('URL copiée dans le presse-papier');
                  }}
                  className="bg-blue-500 text-white px-3 py-2 rounded-r-md text-sm"
                >
                  Copier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminMediaManager 
        onImageSelect={handleImageSelect}
        title="Gestionnaire de médias administrateur"
        showUploadButton={true}
        maxSelections={1}
      />
    </div>
  );
};

export default MediaManagerPage;



