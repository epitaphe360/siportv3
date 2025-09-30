import { supabase } from '../lib/supabase';

export interface ArticleAudio {
  id: string;
  article_id: string;
  audio_url: string | null;
  duration: number | null;
  language: string;
  voice_type: string;
  file_size: number | null;
  status: 'pending' | 'processing' | 'ready' | 'error';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export class ArticleAudioService {
  /**
   * Récupérer l'audio d'un article
   */
  static async getArticleAudio(articleId: string, language = 'fr'): Promise<ArticleAudio | null> {
    if (!supabase) {
      console.error('Supabase non initialisé');
      return null;
    }

    const { data, error } = await supabase
      .from('articles_audio')
      .select('*')
      .eq('article_id', articleId)
      .eq('language', language)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Erreur lors de la récupération de l\'audio:', error);
      return null;
    }

    return data;
  }

  /**
   * Demander la conversion d'un article en audio
   */
  static async convertArticleToAudio(
    articleId: string,
    text: string,
    language = 'fr',
    voiceType = 'alloy'
  ): Promise<{ success: boolean; audio?: ArticleAudio; error?: string; useClientSide?: boolean }> {
    if (!supabase) {
      return { success: false, error: 'Supabase non initialisé' };
    }

    try {
      console.log('📢 Demande de conversion audio pour l\'article:', articleId);

      const { data, error } = await supabase.functions.invoke('convert-text-to-speech', {
        body: {
          articleId,
          text,
          language,
          voiceType
        }
      });

      if (error) {
        console.error('❌ Erreur lors de la conversion:', error);
        console.error('Details:', error);
        return {
          success: false,
          error: `${error.message}${error.context?.body ? ` - ${JSON.stringify(error.context.body)}` : ''}`
        };
      }

      console.log('✅ Réponse de la conversion:', data);

      // Vérifier si la réponse contient une erreur
      if (data && !data.success) {
        console.error('❌ Erreur dans la réponse:', data);
        return {
          success: false,
          error: `${data.error || 'Erreur inconnue'}${data.details ? ` - ${data.details}` : ''}`
        };
      }

      // Si la conversion doit être faite côté client
      if (data.useClientSide) {
        return {
          success: true,
          audio: data.audio,
          useClientSide: true
        };
      }

      return {
        success: true,
        audio: data.audio
      };
    } catch (error: any) {
      console.error('Erreur lors de la conversion audio:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Générer l'audio côté client avec Web Speech API
   */
  static async generateClientSideAudio(
    text: string,
    language = 'fr-FR'
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve({ success: false, error: 'Web Speech API non supportée' });
        return;
      }

      try {
        // Nettoyer le texte HTML
        const cleanText = text.replace(/<[^>]*>/g, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = language;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          resolve({ success: true });
        };

        utterance.onerror = (event) => {
          console.error('Erreur Speech Synthesis:', event);
          resolve({ success: false, error: event.error });
        };

        window.speechSynthesis.speak(utterance);
      } catch (error: any) {
        resolve({ success: false, error: error.message });
      }
    });
  }

  /**
   * Arrêter la lecture audio côté client
   */
  static stopClientSideAudio() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Vérifier si la Web Speech API est disponible
   */
  static isWebSpeechAvailable(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * Obtenir les voix disponibles pour la Web Speech API
   */
  static getAvailableVoices(language = 'fr'): SpeechSynthesisVoice[] {
    if (!this.isWebSpeechAvailable()) {
      return [];
    }

    const voices = window.speechSynthesis.getVoices();
    return voices.filter(voice => voice.lang.startsWith(language));
  }

  /**
   * Supprimer l'audio d'un article
   */
  static async deleteArticleAudio(audioId: string): Promise<boolean> {
    if (!supabase) {
      console.error('Supabase non initialisé');
      return false;
    }

    const { error } = await supabase
      .from('articles_audio')
      .delete()
      .eq('id', audioId);

    if (error) {
      console.error('Erreur lors de la suppression de l\'audio:', error);
      return false;
    }

    return true;
  }

  /**
   * Obtenir tous les audios avec un statut spécifique
   */
  static async getAudiosByStatus(status: 'pending' | 'processing' | 'ready' | 'error'): Promise<ArticleAudio[]> {
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from('articles_audio')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des audios:', error);
      return [];
    }

    return data || [];
  }
}
