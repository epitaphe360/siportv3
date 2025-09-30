import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Mock data for news articles (kept for backwards compatibility)
const mockNewsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'SIPORTS 2025 : Lancement Officiel du Salon International des Ports',
    excerpt: 'Le plus grand événement portuaire de l\'année ouvre ses portes avec plus de 500 exposants internationaux.',
    content: 'Le Salon International des Ports (SIPORTS) 2025 a officiellement ouvert ses portes aujourd\'hui avec une participation record...',
    author: 'Équipe SIPORTS',
    publishedAt: new Date('2025-01-15'),
    category: 'Événements',
    tags: ['salon', 'ouverture', 'exposants'],
    featured: true,
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    readTime: 3,
    source: 'siports',
    views: 1250
  },
  {
    id: '2',
    title: 'Innovation Technologique dans les Ports Modernes',
    excerpt: 'Découvrez les dernières avancées technologiques présentées par les leaders de l\'industrie portuaire.',
    content: 'Les technologies de l\'information et de la communication transforment l\'industrie portuaire...',
    author: 'Marie Dubois',
    publishedAt: new Date('2025-01-10'),
    category: 'Innovation',
    tags: ['technologie', 'innovation', 'numérique'],
    featured: false,
    image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg',
    readTime: 5,
    source: 'siports',
    views: 890
  },
  {
    id: '3',
    title: 'Nouveau partenariat avec le Port de Rotterdam',
    excerpt: 'Une collaboration stratégique majeure pour développer les technologies portuaires de demain.',
    content: 'SIPORTS annonce aujourd\'hui un partenariat stratégique avec le Port de Rotterdam, leader européen en matière d\'innovation portuaire. Cette collaboration vise à développer conjointement des solutions technologiques avancées pour l\'optimisation des opérations portuaires et la réduction de l\'empreinte carbone.\n\nLe partenariat couvre plusieurs domaines clés :\n\n• Technologies IoT pour la surveillance en temps réel des infrastructures\n• Solutions d\'intelligence artificielle pour l\'optimisation des flux logistiques\n• Développement durable et transition énergétique des ports\n• Formation et partage d\'expertise technique\n\n"Ce partenariat représente une étape majeure dans notre stratégie de développement international", déclare le Directeur Général de SIPORTS. "Le savoir-faire du Port de Rotterdam combiné à notre expertise technologique nous permettra d\'offrir des solutions innovantes à l\'échelle mondiale."',
    author: 'Équipe SIPORTS',
    publishedAt: new Date('2024-01-14'),
    category: 'Partenariat',
    tags: ['partenariat', 'rotterdam', 'collaboration', 'innovation'],
    featured: true,
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
    readTime: 4,
    source: 'siports',
    views: 2100
  },
  {
    id: '4',
    title: 'Lancement de la version 3.0 de SmartPort',
    excerpt: 'La nouvelle version révolutionne la gestion portuaire avec des fonctionnalités d\'IA avancées.',
    content: 'Après deux ans de développement intensif, SIPORTS lance aujourd\'hui la version 3.0 de sa plateforme SmartPort, intégrant les dernières avancées en intelligence artificielle et en analyse prédictive.\n\nLes principales nouveautés de cette version majeure :\n\n🚀 Intelligence Artificielle Avancée\n• Prédiction des flux de conteneurs avec une précision de 95%\n• Optimisation automatique des ressources portuaires\n• Détection précoce des anomalies opérationnelles\n\n📊 Analytics en Temps Réel\n• Tableaux de bord personnalisables pour chaque utilisateur\n• Métriques de performance en continu\n• Rapports automatisés et alertes intelligentes\n\n🔒 Sécurité Renforcée\n• Chiffrement de bout en bout des données sensibles\n• Authentification multi-facteurs obligatoire\n• Traçabilité complète des actions utilisateurs\n\n🌱 Développement Durable\n• Calcul automatique de l\'empreinte carbone\n• Optimisation des consommations énergétiques\n• Suivi des objectifs de développement durable\n\n"SmartPort 3.0 représente un saut technologique majeur qui positionne SIPORTS comme leader incontesté de la digitalisation portuaire", affirme l\'équipe de développement.',
    author: 'Équipe Technique SIPORTS',
    publishedAt: new Date('2024-01-09'),
    category: 'Innovation',
    tags: ['smartport', 'version-3.0', 'ia', 'digitalisation'],
    featured: true,
    image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
    readTime: 6,
    source: 'siports',
    views: 1850
  },
  {
    id: '5',
    title: 'Expansion Internationale : Ouverture de Bureaux en Asie',
    excerpt: 'SIPORTS étend sa présence mondiale avec l\'inauguration de ses premiers bureaux asiatiques.',
    content: 'Dans le cadre de sa stratégie de développement international, SIPORTS annonce l\'ouverture de ses premiers bureaux en Asie, situés à Singapour et Shanghai. Cette expansion stratégique vise à renforcer la présence de l\'entreprise sur le marché asiatique en pleine croissance.\n\nLes nouveaux bureaux accueilleront :\n\n• Une équipe d\'experts techniques locaux\n• Un centre de formation régional\n• Un showroom technologique permanent\n• Des services de support 24/7 pour la zone Asie-Pacifique\n\nCette initiative s\'inscrit dans la volonté de SIPORTS d\'accompagner au plus près ses clients asiatiques et de s\'adapter aux spécificités régionales du marché portuaire.',
    author: 'Direction Internationale',
    publishedAt: new Date('2024-01-05'),
    category: 'Expansion',
    tags: ['expansion', 'asie', 'singapour', 'shanghai'],
    featured: false,
    image: 'https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg',
    readTime: 3,
    source: 'siports',
    views: 950
  },
  {
    id: '6',
    title: 'Conférence sur la Transition Écologique des Ports',
    excerpt: 'Experts mondiaux réunis pour discuter des stratégies de décarbonation du secteur portuaire.',
    content: 'SIPORTS organise une conférence internationale sur la transition écologique des ports, rassemblant plus de 200 experts et décideurs du secteur. L\'événement se tiendra les 15 et 16 février 2024 à Marseille.\n\nLes thèmes principaux abordés :\n\n• Stratégies de réduction des émissions de CO2\n• Technologies vertes pour les opérations portuaires\n• Financement de la transition énergétique\n• Réglementation environnementale internationale\n• Cas d\'usage et retours d\'expérience\n\nCette conférence constitue une plateforme unique d\'échange entre acteurs publics et privés pour accélérer la transition écologique du secteur portuaire.',
    author: 'Comité Scientifique',
    publishedAt: new Date('2024-01-03'),
    category: 'Événements',
    tags: ['environnement', 'transition', 'conférence', 'développement-durable'],
    featured: false,
    image: 'https://images.pexels.com/photos/3184294/pexels-photo-3184294.jpeg',
    readTime: 4,
    source: 'siports',
    views: 720
  },
  {
    id: '7',
    title: 'Prix de l\'Innovation Portuaire 2024',
    excerpt: 'Découvrez les lauréats du prestigieux Prix de l\'Innovation Portuaire décerné par SIPORTS.',
    content: 'Pour la troisième année consécutive, SIPORTS a décerné ses Prix de l\'Innovation Portuaire lors d\'une cérémonie prestigieuse. Cette année, plus de 150 candidatures ont été reçues, démontrant l\'effervescence innovante du secteur.\n\nLes lauréats 2024 :\n\n🥇 Catégorie Technologie : "PortVision AI" - Système de vision par ordinateur pour l\'inspection automatique des conteneurs\n🥈 Catégorie Durabilité : "GreenPort Solutions" - Plateforme d\'optimisation énergétique des terminaux\n🥉 Catégorie Sécurité : "SecureHarbor" - Solution de cybersécurité intégrée pour les infrastructures portuaires\n\n🏆 Prix Spécial du Jury : "MaritimeChain" - Blockchain pour la traçabilité des chaînes logistiques maritimes\n\nCes innovations témoignent de la vitalité du secteur portuaire et de son engagement dans la transformation digitale et durable.',
    author: 'Jury des Prix',
    publishedAt: new Date('2023-12-20'),
    category: 'Prix',
    tags: ['prix', 'innovation', 'récompenses', 'technologie'],
    featured: false,
    image: 'https://images.pexels.com/photos/3184295/pexels-photo-3184295.jpeg',
    readTime: 5,
    source: 'siports',
    views: 1100
  },
  {
    id: '8',
    title: 'Formation Continue : Nouveau Programme de Certification',
    excerpt: 'SIPORTS lance un programme complet de formation et certification pour les professionnels du secteur.',
    content: 'Afin de répondre aux besoins croissants en compétences techniques du secteur portuaire, SIPORTS lance un nouveau programme de formation continue et de certification professionnelle.\n\nLe programme comprend :\n\n📚 Modules de Formation\n• Technologies portuaires avancées\n• Gestion des opérations logistiques\n• Cybersécurité des infrastructures critiques\n• Développement durable et transition énergétique\n\n🎓 Certifications Disponibles\n• Certificat de Spécialiste SmartPort\n• Certification Gestionnaire d\'Opérations Portuaires\n• Diplôme Expert en Technologies Portuaires\n\n💼 Avantages\n• Formation 100% en ligne avec accompagnement personnalisé\n• Reconnaissance internationale des certifications\n• Mise à jour continue des contenus pédagogiques\n• Réseau professionnel des alumni\n\nLes inscriptions pour la première session sont ouvertes jusqu\'au 31 mars 2024.',
    author: 'Direction Formation',
    publishedAt: new Date('2023-12-15'),
    category: 'Formation',
    tags: ['formation', 'certification', 'compétences', 'professionnel'],
    featured: false,
    image: 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg',
    readTime: 4,
    source: 'siports',
    views: 680
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
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          id,
          title,
          content,
          excerpt,
          category,
          tags,
          image_url,
          published,
          published_at,
          views,
          author_id
        `)
        .eq('published', true)
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
    await get().fetchNews();
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
      // Simulation de création
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newArticle: NewsArticle = {
        id: Date.now().toString(),
        title: articleData.title || 'Sans titre',
        excerpt: articleData.excerpt || '',
        content: articleData.content || '',
        author: articleData.author || 'Anonyme',
        publishedAt: new Date(),
        category: articleData.category || 'Général',
        tags: articleData.tags || [],
        featured: articleData.featured || false,
        image: articleData.image,
        readTime: articleData.readTime || 1,
        source: 'siports',
        views: 0
      };
      
      const { articles } = get();
      const updatedArticles = [newArticle, ...articles];
      const featuredArticles = updatedArticles.filter((article: NewsArticle) => article.featured);
      const categories = [...new Set(updatedArticles.map((article: NewsArticle) => article.category))];
      
      set({ 
        articles: updatedArticles,
        featuredArticles,
        categories,
        isLoading: false 
      });
    } catch (_error) {
      console.error('Erreur création article:', _error);
      set({ isLoading: false });
      throw _error;
    }
  },

  updateNewsArticle: async (id: string, updates: Partial<NewsArticle>) => {
    try {
      // Simulation de mise à jour
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { articles } = get();
      const updatedArticle = articles.find(article => article.id === id);
      if (!updatedArticle) throw new Error('Article non trouvé');
      
      const finalArticle = { ...updatedArticle, ...updates };
      const updatedArticles = articles.map(article => 
        article.id === id ? finalArticle : article
      );
      const featuredArticles = updatedArticles.filter((article: NewsArticle) => article.featured);
      
      set({ 
        articles: updatedArticles,
        featuredArticles
      });
    } catch (_error) {
      console.error('Erreur mise à jour article:', _error);
      throw _error;
    }
  },

  deleteNewsArticle: async (id: string) => {
    try {
      // Simulation de suppression
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const { articles } = get();
      const updatedArticles = articles.filter(article => article.id !== id);
      const featuredArticles = updatedArticles.filter((article: NewsArticle) => article.featured);
      
      set({ 
        articles: updatedArticles,
        featuredArticles
      });
    } catch (_error) {
      console.error('Erreur suppression article:', _error);
      throw _error;
    }
  }
}));