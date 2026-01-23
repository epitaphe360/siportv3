/**
 * Service de scrapping intelligent avec IA (GPT-4o-mini)
 * Extrait automatiquement les informations d'un site web pour remplir les profils
 *
 * COÛT: GPT-4o-mini = $0.15/1M tokens (le plus rentable qualité/prix)
 * USAGE: ~500 tokens par scrapping = $0.000075 par profil
 */

interface ScrapResult {
  success: boolean;
  data?: {
    companyName: string;
    description: string;
    sector: string;
    services: string[];
    logoUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    foundedYear?: number;
    employeeCount?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
    };
  };
  error?: string;
}

interface MiniSiteScrapResult {
  success: boolean;
  data?: {
    companyName: string;
    tagline: string;
    description: string;
    products: Array<{
      name: string;
      description: string;
      category: string;
      price?: string;
    }>;
    services: string[];
    achievements: string[];
    teamMembers?: Array<{
      name: string;
      position: string;
      bio: string;
    }>;
    gallery?: string[];
    contactInfo: {
      email: string;
      phone: string;
      address: string;
    };
  };
  error?: string;
}

class AIScrapperService {
  private apiKey: string;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    // ⚠️ IMPORTANT: Stocker la clé API dans les variables d'environnement
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

    if (!this.apiKey) {
      console.error('⚠️ VITE_OPENAI_API_KEY non définie dans .env');
    }
  }

  /**
   * Scrape le contenu HTML d'un site web
   */
  private async fetchWebsiteContent(url: string): Promise<string> {
    try {
      // Utiliser un proxy CORS ou un service backend pour éviter les problèmes CORS
      // Option 1: Utiliser allorigins.win (gratuit)
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

      const response = await fetch(proxyUrl);
      const data = await response.json();

      if (!data.contents) {
        throw new Error('Impossible de récupérer le contenu du site');
      }

      // Nettoyer le HTML: enlever scripts, styles, etc.
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data.contents;

      // Supprimer les éléments inutiles
      const selectorsToRemove = ['script', 'style', 'noscript', 'iframe', 'nav', 'footer'];
      selectorsToRemove.forEach(selector => {
        const elements = tempDiv.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      });

      // Extraire le texte visible
      const textContent = tempDiv.textContent || tempDiv.innerText || '';

      // Limiter à 5000 caractères pour économiser les tokens
      return textContent.trim().slice(0, 5000);
    } catch (error) {
      console.error('Erreur fetch website:', error);
      throw new Error('Impossible de charger le site web. Vérifiez l\'URL.');
    }
  }

  /**
   * Scrapper pour PROFIL PARTENAIRE
   */
  async scrapPartnerProfile(websiteUrl: string): Promise<ScrapResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Clé API OpenAI non configurée'
      };
    }

    try {
      // 1. Récupérer le contenu du site
      const websiteContent = await this.fetchWebsiteContent(websiteUrl);

      // 2. Appeler GPT-4o-mini pour extraire les infos
      const prompt = `Tu es un assistant intelligent qui extrait des informations d'entreprise depuis le contenu d'un site web.

CONTENU DU SITE WEB:
${websiteContent}

TÂCHE: Extrais les informations suivantes au format JSON strict (pas de markdown, pas de \`\`\`):
{
  "companyName": "Nom de l'entreprise",
  "description": "Description courte de l'entreprise (200 caractères max)",
  "sector": "Secteur d'activité (maritime, logistique, technologie, etc.)",
  "services": ["Service 1", "Service 2", "Service 3"],
  "logoUrl": "URL du logo si trouvé, sinon null",
  "contactEmail": "Email de contact si trouvé",
  "contactPhone": "Téléphone si trouvé",
  "address": "Adresse physique si trouvée",
  "foundedYear": 2020,
  "employeeCount": "50-100 employés",
  "socialLinks": {
    "linkedin": "URL LinkedIn si trouvé",
    "twitter": "URL Twitter si trouvé",
    "facebook": "URL Facebook si trouvé"
  }
}

RÈGLES:
- Retourne UNIQUEMENT le JSON, sans texte avant ou après
- Si une info n'est pas trouvée, mets null
- La description doit être professionnelle et concise
- Les services doivent être les principaux services offerts
- Le secteur doit être choisi parmi: maritime, logistique, technologie, finance, industrie, services, autre`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant expert en extraction de données d\'entreprise. Tu réponds UNIQUEMENT en JSON valide.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      const aiResponse = result.choices[0]?.message?.content || '';

      // Parser le JSON de la réponse
      let extractedData;
      try {
        // Nettoyer la réponse (enlever les ``` si présents)
        const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        extractedData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Erreur parsing JSON:', aiResponse);
        throw new Error('L\'IA n\'a pas retourné un JSON valide');
      }

      return {
        success: true,
        data: extractedData
      };

    } catch (error: any) {
      console.error('Erreur scrapping partner:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors du scrapping'
      };
    }
  }

  /**
   * Scrapper pour MINI-SITE EXPOSANT
   */
  async scrapExhibitorMiniSite(websiteUrl: string): Promise<MiniSiteScrapResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Clé API OpenAI non configurée'
      };
    }

    try {
      // 1. Récupérer le contenu du site
      const websiteContent = await this.fetchWebsiteContent(websiteUrl);

      // 2. Appeler GPT-4o-mini pour extraire les infos du mini-site
      const prompt = `Tu es un assistant intelligent qui crée du contenu pour un mini-site d'exposant depuis le contenu d'un site web.

CONTENU DU SITE WEB:
${websiteContent}

TÂCHE: Extrais et structure les informations pour créer un mini-site professionnel au format JSON strict:
{
  "companyName": "Nom de l'entreprise",
  "tagline": "Slogan accrocheur de l'entreprise (80 caractères max)",
  "description": "Description détaillée de l'entreprise, son histoire, sa mission (500 caractères max)",
  "products": [
    {
      "name": "Nom du produit/service 1",
      "description": "Description du produit (200 caractères)",
      "category": "Catégorie",
      "price": "Sur devis"
    }
  ],
  "services": ["Service principal 1", "Service principal 2", "Service principal 3"],
  "achievements": ["Réalisation 1", "Réalisation 2", "Réalisation 3"],
  "teamMembers": [
    {
      "name": "Nom du dirigeant",
      "position": "PDG",
      "bio": "Courte bio (150 caractères)"
    }
  ],
  "gallery": ["URL image 1", "URL image 2"],
  "contactInfo": {
    "email": "contact@entreprise.com",
    "phone": "+212 X XX XX XX XX",
    "address": "Adresse complète"
  }
}

RÈGLES:
- Retourne UNIQUEMENT le JSON, sans texte avant ou après
- Si une info n'est pas trouvée, mets un tableau vide [] ou null
- Crée du contenu professionnel et engageant
- Liste 3-5 produits/services principaux
- Les achievements doivent être des réalisations concrètes
- Maximum 3 membres d'équipe
- Description et tagline doivent être en français, professionnels et attractifs`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en création de contenu web professionnel. Tu réponds UNIQUEMENT en JSON valide.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.4,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      const aiResponse = result.choices[0]?.message?.content || '';

      // Parser le JSON de la réponse
      let extractedData;
      try {
        const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        extractedData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Erreur parsing JSON:', aiResponse);
        throw new Error('L\'IA n\'a pas retourné un JSON valide');
      }

      return {
        success: true,
        data: extractedData
      };

    } catch (error: any) {
      console.error('Erreur scrapping exhibitor:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors du scrapping'
      };
    }
  }

  /**
   * Teste la connexion à l'API OpenAI
   */
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton
export const aiScrapperService = new AIScrapperService();
export default aiScrapperService;
