import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Filter,
  FileText,
  Copy,
  Edit,
  Sparkles,
  LayoutDashboard,
  BarChart3,
  Globe,
  Newspaper
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';
import ArticleEditor from '../components/marketing/ArticleEditor';
import { MoroccanPattern } from '../components/ui/MoroccanDecor';

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

interface ArticleItem {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  published: boolean;
  published_at: string | null;
  category: string | null;
  tags: string[];
  image_url: string | null;
  created_at: string;
  shortcode: string;
}

type ContentTab = 'media' | 'articles';
type MediaType = 'all' | 'webinar' | 'capsule_inside' | 'podcast' | 'live_studio' | 'best_moments' | 'testimonial';
type MediaStatus = 'all' | 'draft' | 'published' | 'archived';

export default function MarketingDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ContentTab>('media');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<MediaType>('all');
  const [filterStatus, setFilterStatus] = useState<MediaStatus>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'webinar' | 'capsule_inside' | 'podcast'>('podcast');
  const [showArticleEditor, setShowArticleEditor] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

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
    loadArticles();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('media_contents')
        .select('id, type, title, description, thumbnail_url, status, created_at, category, views_count')
        .order('created_at', { ascending: false })
        .range(0, 49);

      if (error) throw error;
      setMediaItems(data || []);
    } catch (error: any) {
      console.error('Erreur chargement médias:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title, content, excerpt, author, category, tags, image_url, published_at, created_at, published')
        .order('created_at', { ascending: false })
        .range(0, 49);

      if (error) throw error;
      
      // Ajouter le shortcode à chaque article
      const articlesWithShortcode = (data || []).map(article => ({
        ...article,
        shortcode: `[article id="${article.id}"]`
      }));
      
      setArticles(articlesWithShortcode);
    } catch (error: any) {
      console.error('Erreur chargement articles:', error);
      toast.error('Erreur de chargement des articles');
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

  // Publier/dépublier un article
  const toggleArticlePublish = async (article: ArticleItem) => {
    try {
      const newStatus = !article.published;
      
      const { error } = await supabase
        .from('news_articles')
        .update({ 
          published: newStatus,
          published_at: newStatus ? new Date().toISOString() : null
        })
        .eq('id', article.id);

      if (error) throw error;

      setArticles(prev =>
        prev.map(a => a.id === article.id ? { ...a, published: newStatus } : a)
      );

      toast.success(
        newStatus 
          ? '✅ Article publié' 
          : '📝 Article mis en brouillon'
      );
    } catch (error: any) {
      console.error('Erreur toggle publish:', error);
      toast.error('Erreur de mise à jour');
    }
  };

  // Supprimer un article
  const deleteArticle = async (article: ArticleItem) => {
    if (!confirm(`Supprimer "${article.title}" ?`)) return;

    try {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', article.id);

      if (error) throw error;

      setArticles(prev => prev.filter(a => a.id !== article.id));
      toast.success('🗑️ Article supprimé');
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur de suppression');
    }
  };

  // Copier le shortcode
  const copyShortcode = (shortcode: string) => {
    navigator.clipboard.writeText(shortcode);
    toast.success('📋 Shortcode copié !');
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
    <div className="min-h-screen bg-slate-50">
      {/* Premium Hub Header */}
      <div className="bg-slate-900 pt-16 pb-24 relative overflow-hidden">
        <MoroccanPattern className="opacity-10" color="white" scale={1.2} />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-indigo-900/40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 backdrop-blur-xl rounded-2xl border border-blue-400/30">
                  <BarChart3 className="h-8 w-8 text-blue-300" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 backdrop-blur-md px-4 py-1.5 text-sm font-bold">
                  MARKETING CONTROL CENTER
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 italic">Strategy Hub</span>
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl font-medium leading-relaxed">
                Gérez l'expérience narrative de SIPORT 2026. Publiez des contenus impactants et analysez l'engagement.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => {
                  setSelectedType('webinar');
                  setShowUploadModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white border-none shadow-[0_0_20px_rgba(37,99,235,0.4)] px-8 py-6 rounded-2xl font-bold transition-all hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-3" />
                Nouveau Contenu
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-20">
        {/* Navigation Tabs */}
        <div className="bg-white/70 backdrop-blur-2xl p-2 rounded-[2.5rem] shadow-2xl border border-white/50 mb-10 inline-flex flex-wrap gap-2">
          {[
            { id: 'media', label: 'Médiathèque', icon: Video, count: stats.total },
            { id: 'articles', label: 'Articles & News', icon: Newspaper, count: articles.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-4 px-10 py-5 rounded-[2rem] font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className={`h-6 w-6 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
              <div className="text-left">
                <div className="text-sm leading-none opacity-80 mb-1">Explorer</div>
                <div className="text-lg leading-none">{tab.label}</div>
              </div>
              <Badge className={`ml-2 px-2 py-0.5 rounded-lg ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: "circOut" }}
          >
            {activeTab === 'media' ? renderMediaTab() : renderArticlesTab()}
          </motion.div>
        </AnimatePresence>

        {/* Article Editor Modal */}
        {showArticleEditor && (
          <ArticleEditor
            article={selectedArticle}
            onSave={() => {
              loadArticles();
              setShowArticleEditor(false);
              setSelectedArticle(null);
            }}
            onClose={() => {
              setShowArticleEditor(false);
              setSelectedArticle(null);
            }}
          />
        )}
      </div>
    </div>
  );

  // Render Media Tab
  function renderMediaTab() {
    return (
      <div className="space-y-8">
        {/* Stats Grid - Modern Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {[
            { label: 'Total Médias', value: stats.total, icon: Video, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Webinaires', value: stats.webinars, icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Podcasts', value: stats.podcasts, icon: Mic, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Capsules', value: stats.capsules, icon: Video, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'En Ligne', value: stats.published, icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Brouillons', value: stats.draft, icon: EyeOff, color: 'text-slate-600', bg: 'bg-slate-50' }
          ].map((stat, i) => (
            <Card key={i} className="p-6 border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-3xl hover:-translate-y-1 transition-all">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 shadow-inner`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-4xl font-black text-slate-800 mb-1">{stat.value}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Filters & Actions Control Card */}
        <Card className="p-8 bg-white rounded-[2.5rem] shadow-2xl border-none relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Filtrer par:</span>
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-xl px-4 ${filterType === 'all' ? 'bg-blue-600' : 'text-slate-600'}`}
                    onClick={() => setFilterType('all')}
                  >
                    Tous
                  </Button>
                  <Button
                    variant={filterType === 'webinar' ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-xl px-4 ${filterType === 'webinar' ? 'bg-blue-600' : 'text-slate-600'}`}
                    onClick={() => setFilterType('webinar')}
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Webinaires
                  </Button>
                  <Button
                    variant={filterType === 'podcast' ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-xl px-4 ${filterType === 'podcast' ? 'bg-blue-600' : 'text-slate-600'}`}
                    onClick={() => setFilterType('podcast')}
                  >
                    <Mic className="h-4 w-4 mr-1" />
                    Podcasts
                  </Button>
                  <Button
                    variant={filterType === 'capsule_inside' ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-xl px-4 ${filterType === 'capsule_inside' ? 'bg-blue-600' : 'text-slate-600'}`}
                    onClick={() => setFilterType('capsule_inside')}
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Capsules
                  </Button>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-300" />

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Statut:</span>
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-xl px-4 ${filterStatus === 'all' ? 'bg-blue-600' : 'text-slate-600'}`}
                    onClick={() => setFilterStatus('all')}
                  >
                    Tous
                  </Button>
                  <Button
                    variant={filterStatus === 'published' ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-xl px-4 ${filterStatus === 'published' ? 'bg-blue-600' : 'text-slate-600'}`}
                    onClick={() => setFilterStatus('published')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Publiés
                  </Button>
                  <Button
                    variant={filterStatus === 'draft' ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-xl px-4 ${filterStatus === 'draft' ? 'bg-blue-600' : 'text-slate-600'}`}
                    onClick={() => setFilterStatus('draft')}
                  >
                    <EyeOff className="h-4 w-4 mr-1" />
                    Brouillons
                  </Button>
                </div>
              </div>
            </div>

            <div className="ml-auto">
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
              >
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

                    {/* Shortcode */}
                    <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-xs text-blue-600 font-mono flex-1 overflow-x-auto">
                          [media id="{item.id}"]
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyShortcode(`[media id="${item.id}"]`)}
                          className="flex-shrink-0"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copier
                        </Button>
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
    );
  }

  // Render Articles Tab
  function renderArticlesTab() {
    const publishedArticles = articles.filter(a => a.published);
    const draftArticles = articles.filter(a => !a.published);

    return (
      <>
        {/* Create Article Button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Articles Management</h2>
            <p className="text-sm text-gray-600 mt-1">Create and manage articles for siportevent.com</p>
          </div>
          <Button
            onClick={() => {
              setSelectedArticle(null);
              setShowArticleEditor(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Article
          </Button>
        </div>

        {/* Stats Articles */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-2xl font-bold">{articles.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{publishedArticles.length}</div>
            <div className="text-sm text-gray-600">Publiés</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-orange-600">{draftArticles.length}</div>
            <div className="text-sm text-gray-600">Brouillons</div>
          </Card>
        </div>

        {/* Info Shortcodes */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <Tag className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Utilisation des shortcodes</h3>
              <p className="text-sm text-blue-700 mt-1">
                Copiez le shortcode d'un article et collez-le dans n'importe quelle page de siportevent.com. 
                L'article s'affichera automatiquement avec sa mise en forme.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Exemple : <code className="bg-blue-100 px-2 py-1 rounded">[article id="abc-123"]</code>
              </p>
            </div>
          </div>
        </Card>

        {/* Liste des articles */}
        <div className="space-y-4">
          {articles.map((article) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  {/* Image */}
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}

                  {/* Contenu */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {article.excerpt}
                        </p>
                      </div>
                      <Badge variant={article.published ? 'default' : 'secondary'}>
                        {article.published ? '✅ Publié' : '📝 Brouillon'}
                      </Badge>
                    </div>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {article.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Shortcode */}
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <code className="text-sm text-gray-700 font-mono">
                          {article.shortcode}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyShortcode(article.shortcode)}
                        >
                          📋 Copier
                        </Button>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <span>👤 {article.author}</span>
                      {article.category && <span>📁 {article.category}</span>}
                      <span>📅 {new Date(article.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedArticle(article);
                          setShowArticleEditor(true);
                        }}
                        className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={article.published ? 'outline' : 'default'}
                        onClick={() => toggleArticlePublish(article)}
                      >
                        {article.published ? (
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
                        onClick={() => deleteArticle(article)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {articles.length === 0 && (
            <Card className="p-12 text-center">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun article pour le moment</p>
            </Card>
          )}
        </div>
      </>
    );
  }
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
