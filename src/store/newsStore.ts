import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Données mockées supprimées - Les articles sont maintenant chargés depuis Supabase
// Les articles sont maintenant chargés depuis Supabase via la fonction fetchNews()

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  featured: boolean;
  image?: string;
  readTime: number;
  source: 'siports' | 'external';
  sourceUrl?: string;
  views: number;
}

interface NewsState {
  articles: NewsArticle[];
  featuredArticles: NewsArticle[];
  categories: string[];
  isLoading: boolean;
  selectedCategory: string;
  searchTerm: string;
  
  // Actions
  fetchNews: () => Promise<void>;
  fetchFromOfficialSite: () => Promise<void>;
  getArticleById: (id: string) => NewsArticle | null;
  setCategory: (category: string) => void;
  setSearchTerm: (term: string) => void;
  getFilteredArticles: () => NewsArticle[];
  createNewsArticle: (articleData: Partial<NewsArticle>) => Promise<void>;
  updateNewsArticle: (id: string, updates: Partial<NewsArticle>) => Promise<void>;
  deleteNewsArticle: (id: string) => Promise<void>;
}


export const useNewsStore = create<NewsState>((set, get) => ({
  articles: [],
  featuredArticles: [],
  categories: [],
  isLoading: false,
  selectedCategory: '',
  searchTerm: '',

  fetchNews: async () => {
    set({ isLoading: true });
    try {
      // Note: Ne plus filtrer par published car la politique RLS le fait déjà
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title, content, excerpt, category, tags, image_url, published, published_at, views, author_id')
        .order('published_at', { ascending: false });

      if (error) {
        throw error;
      }

      const articles: NewsArticle[] = (data || []).map(article => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt || '',
        content: article.content,
        author: 'Équipe SIPORTS',
        publishedAt: new Date(article.published_at || ''),
        category: article.category,
        tags: article.tags || [],
        featured: false,
        image: article.image_url || undefined,
        readTime: Math.ceil(article.content.split(' ').length / 200),
        source: 'siports' as const,
        views: article.views || 0
      }));

      const featuredArticles = articles.slice(0, 3);
      const categories = [...new Set(articles.map(article => article.category))];

      set({
        articles,
        featuredArticles,
        categories,
        isLoading: false
      });
    } catch (_error) {
      console.error('Erreur chargement articles:', _error);
      set({ isLoading: false });
    }
  },

  fetchFromOfficialSite: async () => {
    set({ isLoading: true });
    try {
      console.log('🔄 Synchronizing articles from official website...');
      
      // Appeler l'Edge Function de synchronisation
      const { data, error } = await supabase.functions.invoke('sync-news-articles', {
        body: {}
      });

      if (error) {
        console.error('❌ Error syncing articles:', error);
        throw error;
      }

      console.log('✅ Sync response:', data);

      // Recharger les articles depuis la base de données
      await get().fetchNews();

      return data;
    } catch (error) {
      console.error('❌ Failed to sync articles:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term });
  },

  getFilteredArticles: () => {
    const { articles, selectedCategory, searchTerm } = get();
    
    return articles.filter(article => {
      const matchesCategory = !selectedCategory || article.category === selectedCategory;
      const matchesSearch = !searchTerm || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  },

  getArticleById: (id: string) => {
    const { articles } = get();
    return articles.find(article => article.id === id) || null;
  },

  createNewsArticle: async (articleData: Partial<NewsArticle>) => {
    set({ isLoading: true });

    try {
      console.log('📝 Création article:', articleData.title);

      // Insérer dans la base de données
      const { data, error } = await supabase
        .from('news_articles')
        .insert([{
          title: articleData.title || 'Sans titre',
          excerpt: articleData.excerpt || '',
          content: articleData.content || '',
          category: articleData.category || 'Général',
          tags: articleData.tags || [],
          image_url: articleData.image,
          published: true,
          published_at: new Date().toISOString(),
          views: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur insertion article:', error);
        throw error;
      }

      console.log('✅ Article créé:', data.id);

      // Recharger les articles
      await get().fetchNews();

      set({ isLoading: false });
    } catch (_error) {
      console.error('❌ Erreur création article:', _error);
      set({ isLoading: false });
      throw _error;
    }
  },

  updateNewsArticle: async (id: string, updates: Partial<NewsArticle>) => {
    try {
      console.log('🔄 Mise à jour article:', id);

      // Mettre à jour dans la base de données
      const { error } = await supabase
        .from('news_articles')
        .update({
          title: updates.title,
          excerpt: updates.excerpt,
          content: updates.content,
          category: updates.category,
          tags: updates.tags,
          image_url: updates.image,
          published: updates.featured !== undefined ? updates.featured : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur mise à jour article:', error);
        throw error;
      }

      console.log('✅ Article mis à jour');

      // Recharger les articles
      await get().fetchNews();
    } catch (_error) {
      console.error('❌ Erreur mise à jour article:', _error);
      throw _error;
    }
  },

  deleteNewsArticle: async (id: string) => {
    try {
      console.log('🗑️  Suppression article:', id);

      // Supprimer de la base de données
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur suppression article:', error);
        throw error;
      }

      console.log('✅ Article supprimé');

      // Recharger les articles
      await get().fetchNews();
    } catch (_error) {
      console.error('❌ Erreur suppression article:', _error);
      throw _error;
    }
  }
}));