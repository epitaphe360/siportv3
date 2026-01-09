import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, XCircle, Clock, Eye, TrendingUp, BarChart3, Plus } from 'lucide-react';
import { mediaService } from '../../../services/mediaService';
import type { MediaContent } from '../../../types/media';
import { ROUTES } from '../../../lib/routes';

export const MediaManagementPage: React.FC = () => {
  const [media, setMedia] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalViews: 0
  });

  useEffect(() => {
    loadMedia();
    loadStats();
  }, [filter]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await mediaService.getMedia({
        status: filter === 'all' ? undefined : filter
      });
      setMedia(data);
    } catch (error) {
      console.error('Erreur chargement médias:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const globalStats = await mediaService.getGlobalMediaStats();
      setStats(prev => ({ ...prev, ...globalStats }));
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  }; 

  const handleApprove = async (mediaId: string) => {
    try {
      await mediaService.updateMedia(mediaId, { status: 'published' });
      await loadMedia();
      await loadStats();
    } catch (error) {
      console.error('Erreur approbation:', error);
    }
  };

  const handleReject = async (mediaId: string) => {
    try {
      await mediaService.updateMedia(mediaId, { status: 'rejected' });
      await loadMedia();
      await loadStats();
    } catch (error) {
      console.error('Erreur rejet:', error);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) {
      try {
        await mediaService.deleteMedia(mediaId);
        await loadMedia();
        await loadStats();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Médias</h1>
              <p className="mt-2 text-gray-600">Validez, modérez et gérez tous les contenus médias</p>
            </div>
            <Link to={ROUTES.ADMIN_MEDIA_CREATE}>
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all">
                <Plus className="w-5 h-5" />
                Créer Nouveau Média
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Médias</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Play className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approuvés</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejetés</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vues totales</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Tous' : status === 'pending' ? 'En attente' : status === 'approved' ? 'Approuvés' : 'Rejetés'}
              </button>
            ))}
          </div>
        </div>

        {/* Media List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun média trouvé</p>
          </div>
        ) : (
          <div className="space-y-4">
            {media.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === 'published' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'published' ? 'Publié' : item.status === 'pending' ? 'En attente' : 'Rejeté'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {item.view_count || 0} vues
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {item.like_count || 0} likes
                      </span>
                      <span>Durée: {item.duration || 0} min</span>
                      <span>Créé le {new Date(item.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approuver
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Rejeter
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaManagementPage;



