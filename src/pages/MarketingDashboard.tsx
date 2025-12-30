import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { motion } from 'framer-motion';
import {
  Image,
  Video,
  Mic,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Download,
  Calendar,
  Tag,
  Filter
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';

interface MediaItem {
  id: string;
  type: 'webinar' | 'capsule_inside' | 'podcast' | 'live_studio' | 'best_moments' | 'testimonial';
  title: string;
  description: string;
  video_url?: string;
  audio_url?: string;
  thumbnail_url?: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  views_count: number;
  likes_count: number;
  shares_count: number;
  tags?: string[];
  duration?: number;
}

type MediaType = 'all' | 'webinar' | 'capsule_inside' | 'podcast' | 'live_studio' | 'best_moments' | 'testimonial';
type MediaStatus = 'all' | 'draft' | 'published' | 'archived';

export default function MarketingDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<MediaType>('all');
  const [filterStatus, setFilterStatus] = useState<MediaStatus>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'webinar' | 'capsule_inside' | 'podcast'>('podcast');

  // Stats
  const stats = {
    total: mediaItems.length,
    webinars: mediaItems.filter(m => m.type === 'webinar').length,
    capsules: mediaItems.filter(m => m.type === 'capsule_inside').length,
    podcasts: mediaItems.filter(m => m.type === 'podcast').length,
    lives: mediaItems.filter(m => m.type === 'live_studio').length,
    published: mediaItems.filter(m => m.status === 'published').length,
    draft: mediaItems.filter(m => m.status === 'draft').length,
  };

  // Charger les médias
  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('media_contents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaItems(data || []);
    } catch (error: any) {
      console.error('Erreur chargement médias:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les médias
  const filteredMedia = mediaItems.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  // Publier/dépublier un média
  const togglePublish = async (item: MediaItem) => {
    try {
      const newStatus = item.status === 'published' ? 'draft' : 'published';
      
      const { error } = await supabase
        .from('media_contents')
        .update({ 
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null
        })
        .eq('id', item.id);

      if (error) throw error;

      setMediaItems(prev =>
        prev.map(m => m.id === item.id ? { ...m, status: newStatus } : m)
      );

      toast.success(
        newStatus === 'published' 
          ? '✅ Média publié' 
          : '📝 Média mis en brouillon'
      );
    } catch (error: any) {
      console.error('Erreur toggle publish:', error);
      toast.error('Erreur de mise à jour');
    }
  };

  // Supprimer un média
  const deleteMedia = async (item: MediaItem) => {
    if (!confirm(`Supprimer "${item.title}" ?`)) return;

    try {
      const { error } = await supabase
        .from('media_contents')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      setMediaItems(prev => prev.filter(m => m.id !== item.id));
      toast.success('🗑️ Média supprimé');
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur de suppression');
    }
  };

  // Uploader un nouveau média
  const handleUpload = async (formData: {
    title: string;
    description: string;
    url: string;
    category: string;
  }) => {
    try {
      const newMedia: any = {
        type: selectedType,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: 'draft',
        views_count: 0,
        likes_count: 0,
        shares_count: 0,
        tags: []
      };

      // Ajouter l'URL selon le type
      if (selectedType === 'podcast') {
        newMedia.audio_url = formData.url;
      } else {
        newMedia.video_url = formData.url;
      }

      const { data, error } = await supabase
        .from('media_contents')
        .insert(newMedia)
        .select()
        .single();

      if (error) throw error;

      setMediaItems(prev => [data, ...prev]);
      setShowUploadModal(false);
      toast.success('✅ Média ajouté');
    } catch (error: any) {
      console.error('Erreur upload:', error);
      toast.error('Erreur d\'ajout');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'podcast': return <Mic className="h-5 w-5" />;
      case 'webinar': return <Video className="h-5 w-5" />;
      case 'capsule_inside': return <Video className="h-5 w-5" />;
      case 'live_studio': return <Video className="h-5 w-5" />;
      case 'best_moments': return <Video className="h-5 w-5" />;
      case 'testimonial': return <Video className="h-5 w-5" />;
      default: return <Image className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'podcast': return 'text-orange-600 bg-orange-50';
      case 'webinar': return 'text-blue-600 bg-blue-50';
      case 'capsule_inside': return 'text-purple-600 bg-purple-50';
      case 'live_studio': return 'text-red-600 bg-red-50';
      case 'best_moments': return 'text-green-600 bg-green-50';
      case 'testimonial': return 'text-pink-600 bg-pink-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Dashboard Marketing
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos médias : webinaires, podcasts, capsules vidéo
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-blue-500">
                <Filter className="h-8 w-8" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.webinars}</div>
                <div className="text-sm text-gray-600">Webinaires</div>
              </div>
              <div className="text-blue-500">
                <Video className="h-8 w-8" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.podcasts}</div>
                <div className="text-sm text-gray-600">Podcasts</div>
              </div>
              <div className="text-orange-500">
                <Mic className="h-8 w-8" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.capsules}</div>
                <div className="text-sm text-gray-600">Capsules</div>
              </div>
              <div className="text-purple-500">
                <Video className="h-8 w-8" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.published}</div>
                <div className="text-sm text-gray-600">Publiés</div>
              </div>
              <div className="text-green-500">
                <Eye className="h-8 w-8" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.draft}</div>
                <div className="text-sm text-gray-600">Brouillons</div>
              </div>
              <div className="text-gray-500">
                <EyeOff className="h-8 w-8" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters & Actions */}
        <Card className="p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                Tous
              </Button>
              <Button
                variant={filterType === 'webinar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('webinar')}
              >
                <Video className="h-4 w-4 mr-1" />
                Webinaires
              </Button>
              <Button
                variant={filterType === 'podcast' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('podcast')}
              >
                <Mic className="h-4 w-4 mr-1" />
                Podcasts
              </Button>
              <Button
                variant={filterType === 'capsule_inside' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('capsule_inside')}
              >
                <Video className="h-4 w-4 mr-1" />
                Capsules
              </Button>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Statut:</span>
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Tous
              </Button>
              <Button
                variant={filterStatus === 'published' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('published')}
              >
                <Eye className="h-4 w-4 mr-1" />
                Publiés
              </Button>
              <Button
                variant={filterStatus === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('draft')}
              >
                <EyeOff className="h-4 w-4 mr-1" />
                Brouillons
              </Button>
            </div>

            <div className="ml-auto">
              <Button onClick={() => setShowUploadModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un média
              </Button>
            </div>
          </div>
        </Card>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Image className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun média trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Ajoutez des photos, vidéos ou podcasts pour commencer
            </p>
            <Button onClick={() => setShowUploadModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un média
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gray-100">
                    {item.type === 'photo' && item.url && (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {(item.type === 'webinar' || item.type === 'capsule_inside' || item.type === 'live_studio' || item.type === 'best_moments' || item.type === 'testimonial') && (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-500 to-purple-700">
                        <Video className="h-16 w-16 text-white" />
                      </div>
                    )}
                    {item.type === 'podcast' && (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-500 to-orange-700">
                        <Mic className="h-16 w-16 text-white" />
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                        <span className="capitalize">{item.type.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge variant={item.status === 'published' ? 'success' : 'default'}>
                        {item.status === 'published' ? '✅ Publié' : '📝 Brouillon'}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Category */}
                    {item.category && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <Tag className="h-3 w-3" />
                        {item.category}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {item.views_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {item.likes_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={item.status === 'published' ? 'outline' : 'default'}
                        className="flex-1"
                        onClick={() => togglePublish(item)}
                      >
                        {item.status === 'published' ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Dépublier
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Publier
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMedia(item)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadModal
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            onUpload={handleUpload}
            onClose={() => setShowUploadModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// Modal d'upload
function UploadModal({
  selectedType,
  onTypeChange,
  onUpload,
  onClose
}: {
  selectedType: 'photo' | 'video' | 'podcast';
  onTypeChange: (type: 'photo' | 'video' | 'podcast') => void;
  onUpload: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'conferences'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      toast.error('Titre et URL requis');
      return;
    }
    onUpload(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Ajouter un média</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de média
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={selectedType === 'webinar' ? 'default' : 'outline'}
                  onClick={() => onTypeChange('webinar')}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Webinaire
                </Button>
                <Button
                  type="button"
                  variant={selectedType === 'capsule_inside' ? 'default' : 'outline'}
                  onClick={() => onTypeChange('capsule_inside')}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Capsule
                </Button>
                <Button
                  type="button"
                  variant={selectedType === 'podcast' ? 'default' : 'outline'}
                  onClick={() => onTypeChange('podcast')}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Podcast
                </Button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Lien vers le fichier (hébergé externalement)
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Technologie">Technologie</option>
                <option value="Business">Business</option>
                <option value="Leadership">Leadership</option>
                <option value="Innovation">Innovation</option>
                <option value="Politique">Politique</option>
                <option value="Témoignage">Témoignage</option>
                <option value="Formation">Formation</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
