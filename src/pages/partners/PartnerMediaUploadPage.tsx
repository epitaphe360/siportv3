import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Video, Mic, Image as ImageIcon, FileText } from 'lucide-react';
import { mediaService } from '../../services/mediaService';
import { useAuthStore } from '../../store/authStore';
import type { MediaType } from '../../types/media';

export const PartnerMediaUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'webinar' as MediaType,
    category: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: 0,
    tags: [] as string[]
  });

  const mediaTypes: { value: MediaType; label: string; icon: any }[] = [
    { value: 'webinar', label: 'Webinaire', icon: Video },
    { value: 'podcast', label: 'Podcast', icon: Mic },
    { value: 'capsule', label: 'Capsule vidÃ©o', icon: ImageIcon },
    { value: 'live', label: 'Live Studio', icon: Video },
    { value: 'moment', label: 'Best Moment', icon: FileText },
    { value: 'testimonial', label: 'TÃ©moignage', icon: Video }
  ];

  const categories = [
    'Logistique',
    'Transport',
    'Supply Chain',
    'Innovation',
    'Digital',
    'DÃ©veloppement Durable',
    'E-commerce',
    'Industrie 4.0'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await mediaService.createMedia({
        ...formData,
        partner_id: user.id,
        status: 'pending', // En attente de validation admin
        view_count: 0,
        like_count: 0
      });
      
      alert('MÃ©dia uploadÃ© avec succÃ¨s ! Il sera visible aprÃ¨s validation par l\'Ã©quipe SIPORT.');
      navigate('/partner/media');
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload du mÃ©dia');
    } finally {
      setLoading(false);
    }
  };

  const SelectedIcon = mediaTypes.find(t => t.value === formData.type)?.icon || Video;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/partner/media" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour Ã  ma bibliothÃ¨que
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Uploader un MÃ©dia</h1>
          <p className="mt-2 text-gray-600">Partagez vos contenus avec la communautÃ© SIPORT</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
          {/* Type de mÃ©dia */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Type de mÃ©dia *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mediaTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.type === type.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${
                      formData.type === type.value ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.type === type.value ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Titre */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Titre accrocheur de votre mÃ©dia"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="DÃ©crivez le contenu de votre mÃ©dia..."
            />
          </div>

          {/* CatÃ©gorie */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              CatÃ©gorie *
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">SÃ©lectionner une catÃ©gorie</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* URL vidÃ©o/audio */}
          <div className="mb-6">
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
              URL du mÃ©dia *
            </label>
            <input
              type="url"
              id="videoUrl"
              required
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="mt-2 text-sm text-gray-500">
              Lien YouTube, Vimeo ou autre plateforme d'hÃ©bergement
            </p>
          </div>

          {/* URL thumbnail */}
          <div className="mb-6">
            <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-2">
              URL de la miniature
            </label>
            <input
              type="url"
              id="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          {/* DurÃ©e */}
          <div className="mb-6">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              DurÃ©e (minutes) *
            </label>
            <input
              type="number"
              id="duration"
              required
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="30"
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (sÃ©parÃ©s par des virgules)
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="logistique, innovation, transport"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {loading ? 'Upload en cours...' : 'Uploader le mÃ©dia'}
            </button>
            <Link
              to="/partner/media"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              Annuler
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            * Votre mÃ©dia sera soumis Ã  validation avant publication
          </p>
        </form>
      </div>
    </div>
  );
};

export default PartnerMediaUploadPage;



