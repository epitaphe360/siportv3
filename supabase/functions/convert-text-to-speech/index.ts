import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface TextToSpeechRequest {
  articleId: string;
  text: string;
  language?: string;
  voiceType?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { articleId, text, language = 'fr', voiceType = 'default' }: TextToSpeechRequest = await req.json();

    console.log(`🎵 Conversion texte en audio pour l'article ${articleId}`);

    // Vérifier si l'audio existe déjà
    const { data: existingAudio, error: checkError } = await supabaseClient
      .from('articles_audio')
      .select('*')
      .eq('article_id', articleId)
      .eq('language', language)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // Si l'audio existe déjà et est prêt, le retourner
    if (existingAudio && existingAudio.status === 'ready') {
      console.log('✅ Audio déjà existant et prêt');
      return new Response(
        JSON.stringify({ 
          success: true, 
          audio: existingAudio,
          message: 'Audio déjà disponible'
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      );
    }

    // Créer ou mettre à jour l'enregistrement avec status 'processing'
    let audioRecord;
    if (existingAudio) {
      const { data, error } = await supabaseClient
        .from('articles_audio')
        .update({ status: 'processing', error_message: null })
        .eq('id', existingAudio.id)
        .select()
        .single();
      
      if (error) throw error;
      audioRecord = data;
    } else {
      const { data, error } = await supabaseClient
        .from('articles_audio')
        .insert({
          article_id: articleId,
          language: language,
          voice_type: voiceType,
          status: 'processing'
        })
        .select()
        .single();
      
      if (error) throw error;
      audioRecord = data;
    }

    console.log('🔄 Statut mis à jour: processing');

    // Utiliser Google Cloud Text-to-Speech
    const googleApiKey = Deno.env.get('GOOGLE_TTS_API_KEY') || 'AIzaSyD3t1wu2BpwlQ6CfQeTfgQGkpd1VLGxVQI';
    
    if (googleApiKey) {
      console.log('🌟 Utilisation de Google Cloud Text-to-Speech...');
      
      try {
        // Nettoyer le texte HTML et limiter la longueur
        const cleanText = text.replace(/<[^>]*>/g, '').substring(0, 5000);
        
        // Mapper les langues aux codes Google Cloud
        const languageCodeMap: { [key: string]: string } = {
          'fr': 'fr-FR',
          'en': 'en-US',
          'ar': 'ar-XA'
        };
        const languageCode = languageCodeMap[language] || 'fr-FR';

        // Mapper les langues aux voix Google Cloud
        const voiceNameMap: { [key: string]: { name: string, gender: string } } = {
          'fr': { name: 'fr-FR-Wavenet-C', gender: 'FEMALE' },
          'en': { name: 'en-US-Wavenet-F', gender: 'FEMALE' },
          'ar': { name: 'ar-XA-Wavenet-A', gender: 'FEMALE' }
        };
        const voiceConfig = voiceNameMap[language] || { name: 'fr-FR-Wavenet-C', gender: 'FEMALE' };

        // Requête vers Google Cloud Text-to-Speech API
        const requestBody = {
          input: {
            text: cleanText
          },
          voice: {
            languageCode: languageCode,
            name: voiceConfig.name,
            ssmlGender: voiceConfig.gender
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0.0,
            volumeGainDb: 0.0
          }
        };

        console.log('📡 Envoi de la requête à Google Cloud TTS...');
        console.log('Langue:', languageCode, 'Voix:', voiceConfig.name);

        const response = await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erreur Google TTS:', errorText);
          throw new Error(`Google TTS error: ${response.status} - ${errorText}`);
        }

        const responseData = await response.json();
        
        if (!responseData.audioContent) {
          throw new Error('Pas de contenu audio dans la réponse');
        }

        console.log('✅ Audio reçu de Google Cloud TTS');

        // Décoder le contenu audio base64
        const audioBase64 = responseData.audioContent;
        const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));

        console.log(`💾 Taille audio: ${audioBytes.length} bytes`);

        // Upload vers Supabase Storage
        const fileName = `${articleId}_${language}_${Date.now()}.mp3`;
        console.log(`📤 Upload vers Storage: ${fileName}`);
        
        const { data: uploadData, error: uploadError } = await supabaseClient
          .storage
          .from('article-audio')
          .upload(fileName, audioBytes, {
            contentType: 'audio/mpeg',
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('❌ Erreur upload:', uploadError);
          throw uploadError;
        }

        console.log('✅ Upload réussi:', uploadData);

        // Obtenir l'URL publique
        const { data: urlData } = supabaseClient
          .storage
          .from('article-audio')
          .getPublicUrl(fileName);

        console.log('🔗 URL publique:', urlData.publicUrl);

        // Estimer la durée (environ 150 mots par minute)
        const wordCount = cleanText.split(/\s+/).length;
        const estimatedDuration = Math.ceil((wordCount / 150) * 60);

        // Mettre à jour l'enregistrement
        const { data: updatedAudio, error: updateError } = await supabaseClient
          .from('articles_audio')
          .update({
            audio_url: urlData.publicUrl,
            duration: estimatedDuration,
            file_size: audioBytes.length,
            status: 'ready',
            voice_type: voiceConfig.name
          })
          .eq('id', audioRecord.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Erreur mise à jour:', updateError);
          throw updateError;
        }

        console.log('✅ Audio créé avec succès via Google Cloud TTS');

        return new Response(
          JSON.stringify({ 
            success: true, 
            audio: updatedAudio,
            message: 'Audio généré avec succès (Google Cloud TTS)',
            provider: 'google'
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
            status: 200,
          }
        );
      } catch (googleError: any) {
        console.error('❌ Erreur Google TTS:', googleError);
        
        // Mettre à jour le statut en erreur
        await supabaseClient
          .from('articles_audio')
          .update({
            status: 'error',
            error_message: `Google TTS error: ${googleError.message}`
          })
          .eq('id', audioRecord.id);

        throw googleError;
      }
    }

    // Fallback - Retourner un statut 'pending' pour génération côté client
    console.log('⚠️ Pas de clé Google - Audio sera généré côté client');
    
    await supabaseClient
      .from('articles_audio')
      .update({ status: 'pending' })
      .eq('id', audioRecord.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        audio: { ...audioRecord, status: 'pending' },
        message: 'Audio sera généré dans le navigateur',
        useClientSide: true
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Erreur dans convert-text-to-speech:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Une erreur est survenue lors de la conversion audio' 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});