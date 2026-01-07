import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2, BookmarkPlus, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VideoStreamPlayer } from '../../components/media/VideoStreamPlayer';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import toast from 'react-hot-toast';

interface Capsule {
  id: string;
  title: string;
  description: string;
  content_url: string;
  thumbnail_url?: string;
  duration?: number;
  category?: string;
  speaker_name?: string;
  speaker_title?: string;
  published_date?: string;
  views_count?: number;
  tags?: string[];
  created_at: string;
}

export const CapsuleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      loadCapsule();
    }
  }, [id]);

  const loadCapsule = async () => {
    try {
      const { data, error } = await supabase
        .from('media_contents')
        .select('*')
        .eq('id', id)
        .eq('type', 'capsule_inside')
        .maybeSingle();

      if (error) throw error;
      setCapsule(data);
    } catch (error) {
      console.error('Error loading capsule:', error);
      toast.error('Erreur lors du chargement de la capsule');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: capsule?.title,
        text: capsule?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Capsule introuvable</h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="relative">
              <Badge 
                variant="default" 
                className="absolute top-4 left-4 z-10 bg-blue-600"
              >
                🎬 Inside SIPORTS
              </Badge>
              <VideoStreamPlayer
                src={capsule.content_url}
                poster={capsule.thumbnail_url}
                title={capsule.title}
                isLive={false}
              />
            </div>

            {/* Title & Actions */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {capsule.title}
              </h1>

              <div className="flex items-center flex-wrap gap-2 mb-4">
                {capsule.category && (
                  <Badge variant="secondary">{capsule.category}</Badge>
                )}
                {capsule.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">#{tag}</Badge>
                ))}
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <Button
                  variant={isSaved ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleSave}
                >
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  {isSaved ? 'Enregistré' : 'Enregistrer'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                {capsule.views_count && (
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {capsule.views_count.toLocaleString()} vues
                  </div>
                )}
                {capsule.duration && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(capsule.duration)}
                  </div>
                )}
                {capsule.published_date && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(capsule.published_date)}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                À propos de cette capsule
              </h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {capsule.description}
                </p>
              </div>
            </div>

            {/* Speaker Info */}
            {capsule.speaker_name && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Intervenant
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-white">
                      {capsule.speaker_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{capsule.speaker_name}</h3>
                    {capsule.speaker_title && (
                      <p className="text-sm text-gray-600">{capsule.speaker_title}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Related Capsules */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Autres capsules Inside SIPORTS
              </h2>
              <p className="text-gray-600 text-sm">
                Découvrez d'autres contenus exclusifs...
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Durée</p>
                  <p className="text-sm text-gray-600">
                    {formatDuration(capsule.duration)}
                  </p>
                </div>
                {capsule.published_date && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Publié le</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(capsule.published_date)}
                    </p>
                  </div>
                )}
                {capsule.category && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Catégorie</p>
                    <p className="text-sm text-gray-600">{capsule.category}</p>
                  </div>
                )}
              </div>
            </div>

            {/* What is Inside SIPORTS */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
              <div className="text-4xl mb-3">🎬</div>
              <h3 className="text-lg font-semibold mb-2">
                Inside SIPORTS
              </h3>
              <p className="text-sm text-blue-100 mb-4">
                Des capsules vidéo exclusives pour découvrir les coulisses du salon et les acteurs clés du sport business.
              </p>
              <Button variant="secondary" className="w-full" asChild>
                <Link to="/media/capsules">
                  Voir toutes les capsules
                </Link>
              </Button>
            </div>

            {/* Newsletter CTA */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Restez informé
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Recevez les nouvelles capsules directement dans votre boîte mail
              </p>
              <input
                type="email"
                placeholder="votre@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
              />
              <Button variant="default" size="sm" className="w-full">
                S'abonner
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
