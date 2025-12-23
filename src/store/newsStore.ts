import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Articles de fallback pour quand la base de données est vide ou indisponible
const fallbackArticles: NewsArticle[] = [
  {
    id: 'fallback-1',
    title: 'SIPORTS 2026 : Le Salon International des Ports et de la Logistique',
    excerpt: 'Découvrez le plus grand événement portuaire d\'Afrique du Nord prévu pour 2026. Une occasion unique de réseautage et de découvertes.',
    content: 'SIPORTS 2026 est le rendez-vous incontournable des professionnels du secteur portuaire et logistique. Cet événement majeur réunira les acteurs clés de l\'industrie maritime pour échanger sur les innovations, les défis et les opportunités du secteur.',
    author: 'Équipe SIPORTS',
    publishedAt: new Date('2025-12-15'),
    category: 'Événements',
    tags: ['SIPORTS', 'salon', 'port', 'logistique'],
    featured: true,
    image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&auto=format&fit=crop',
    readTime: 3,
    source: 'siports',
    sourceUrl: 'https://siportevent.com/actualite-portuaire/',
    views: 1250
  },
  {
    id: 'fallback-2',
    title: 'Innovation Portuaire : Les Technologies qui Transforment nos Ports',
    excerpt: 'Intelligence artificielle, automatisation, IoT : les ports modernes adoptent les technologies de pointe pour améliorer leur efficacité.',
    content: 'Les ports du monde entier investissent massivement dans les nouvelles technologies. De l\'automatisation des grues à l\'intelligence artificielle pour optimiser les flux, découvrez les innovations qui façonnent l\'avenir du secteur maritime.',
    author: 'Équipe SIPORTS',
    publishedAt: new Date('2025-12-10'),
    category: 'Innovation',
    tags: ['technologie', 'innovation', 'automatisation', 'IA'],
    featured: true,
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop',
    readTime: 5,
    source: 'siports',
    sourceUrl: 'https://siportevent.com/actualite-portuaire/',
    views: 890
  },
  {
    id: 'fallback-3',
    title: 'Développement Durable : Les Ports s\'engagent pour l\'Environnement',
    excerpt: 'Les initiatives écologiques se multiplient dans les ports pour réduire l\'empreinte carbone du transport maritime.',
    content: 'Face aux enjeux climatiques, les ports adoptent des stratégies ambitieuses pour réduire leur impact environnemental. Énergies renouvelables, électrification des quais, gestion des déchets : tour d\'horizon des bonnes pratiques.',
    author: 'Équipe SIPORTS',
    publishedAt: new Date('2025-12-05'),
    category: 'Environnement',
    tags: ['écologie', 'développement durable', 'environnement'],
    featured: true,
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop',
    readTime: 4,
    source: 'siports',
    sourceUrl: 'https://siportevent.com/actualite-portuaire/',
    views: 756
  },
  {
    id: 'fallback-4',
    title: 'Le Commerce Maritime en Méditerranée : Perspectives 2026',
    excerpt: 'Analyse des tendances du commerce maritime méditerranéen et des opportunités pour les acteurs du secteur.',
    content: 'La Méditerranée reste un carrefour stratégique pour le commerce mondial. Avec l\'évolution des routes commerciales et les nouveaux accords, le bassin méditerranéen offre de nombreuses opportunités de croissance.',
    author: 'Équipe SIPORTS',
    publishedAt: new Date('2025-11-28'),
    category: 'Commerce',
    tags: ['commerce', 'méditerranée', 'import-export'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1559136560-a9d9e3f5e9b0?w=800&auto=format&fit=crop',
    readTime: 6,
    source: 'siports',
    sourceUrl: 'https://siportevent.com/actualite-portuaire/',
    views: 620
  },
  {
    id: 'fallback-5',
    title: 'Formation et Emploi : Les Métiers du Port de Demain',
    excerpt: 'Le secteur portuaire recrute ! Découvrez les formations et les opportunités de carrière dans l\'industrie maritime.',
    content: 'Le secteur portuaire est en pleine mutation et recherche de nouveaux talents. Des métiers traditionnels aux nouvelles spécialités liées à la digitalisation, les opportunités sont nombreuses pour ceux qui souhaitent faire carrière dans ce domaine.',
    author: 'Équipe SIPORTS',
    publishedAt: new Date('2025-11-20'),
    category: 'Emploi',
    tags: ['emploi', 'formation', 'carrière', 'métiers'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop',
    readTime: 4,
    source: 'siports',
    sourceUrl: 'https://siportevent.com/actualite-portuaire/',
    views: 543
  },
  {
    id: 'fallback-6',
    title: 'Sécurité Portuaire : Les Nouvelles Normes Internationales',
    excerpt: 'Les standards de sécurité évoluent pour répondre aux nouveaux défis du transport maritime mondial.',
    content: 'La sécurité reste une priorité absolue dans les installations portuaires. Cybersécurité, contrôle des accès, prévention des risques : découvrez les dernières réglementations et innovations en matière de sécurité portuaire.',
    author: 'Équipe SIPORTS',
    publishedAt: new Date('2025-11-15'),
    category: 'Sécurité',
    tags: ['sécurité', 'normes', 'réglementation'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop',
    readTime: 5,
    source: 'siports',
    sourceUrl: 'https://siportevent.com/actualite-portuaire/',
    views: 412
  }
];

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
      // Essayer de charger depuis Supabase
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title, content, excerpt, category, tags, image_url, published, published_at, views, featured')
        .order('published_at', { ascending: false });

      if (error) {
        console.warn('⚠️ Erreur Supabase, utilisation du fallback:', error);
        throw error;
      }

      let articles: NewsArticle[] = [];

      if (data && data.length > 0) {
        // Articles depuis la base de données
        articles = data.map(article => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt || '',
          content: article.content,
          author: 'Équipe SIPORTS',
          publishedAt: new Date(article.published_at || ''),
          category: article.category,
          tags: article.tags || [],
          featured: article.featured || false,
          image: article.image_url || undefined,
          readTime: Math.ceil(article.content.split(' ').length / 200),
          source: 'siports' as const,
          views: article.views || 0
        }));
        console.log(`✅ ${articles.length} articles chargés depuis Supabase`);
      } else {
        // Utiliser les articles de fallback
        articles = fallbackArticles;
        console.log('📰 Utilisation des articles de fallback');
      }

      const featuredArticles = articles.filter(a => a.featured).slice(0, 3);
      const categories = [...new Set(articles.map(article => article.category))];

      set({
        articles,
        featuredArticles: featuredArticles.length > 0 ? featuredArticles : articles.slice(0, 3),
        categories,
        isLoading: false
      });
    } catch (_error) {
      console.error('Erreur chargement articles, utilisation du fallback:', _error);
      // En cas d'erreur, utiliser les articles de fallback
      const categories = [...new Set(fallbackArticles.map(article => article.category))];
      set({ 
        articles: fallbackArticles,
        featuredArticles: fallbackArticles.filter(a => a.featured).slice(0, 3),
        categories,
        isLoading: false 
      });
    }
  },

  fetchFromOfficialSite: async () => {
    set({ isLoading: true });
    try {
      
      // Appeler l'Edge Function de synchronisation
      const { data, error } = await supabase.functions.invoke('sync-news-articles', {
        body: {}
      });

      if (error) {
        console.error('❌ Error syncing articles:', error);
        throw error;
      }


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

      // Insérer dans la base de données
      const { data, error } = await supabase
        .from('news_articles')
        .insert([{
          title: articleData.title || 'Sans titre',
          excerpt: articleData.excerpt || '',
          content: articleData.content || '',
          author: articleData.author || 'Admin', // Added author field
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
        throw new Error(error.message || JSON.stringify(error));
      }


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


      // Recharger les articles
      await get().fetchNews();
    } catch (_error) {
      console.error('❌ Erreur mise à jour article:', _error);
      throw _error;
    }
  },

  deleteNewsArticle: async (id: string) => {
    try {

      // Supprimer de la base de données
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur suppression article:', error);
        throw error;
      }


      // Recharger les articles
      await get().fetchNews();
    } catch (_error) {
      console.error('❌ Erreur suppression article:', _error);
      throw _error;
    }
  }
}));