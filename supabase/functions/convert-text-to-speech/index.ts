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

    const { articleId, text, language = 'fr', voiceType = 'alloy' }: TextToSpeechRequest = await req.json();

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

    // OPTION 1: Utiliser OpenAI TTS (recommandé)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (openaiApiKey) {
      console.log('🤖 Utilisation de OpenAI TTS...');
      
      try {
        // Nettoyer et limiter le texte (OpenAI TTS limite: 4096 caractères)
        const cleanText = text.replace(/<[^>]*>/g, '').substring(0, 4096);
        
        // Mapper les langues aux voix OpenAI
        const voiceMap: { [key: string]: string } = {
          'fr': 'alloy',
          'en': 'nova',
          'ar': 'shimmer'
        };
        const voice = voiceMap[language] || 'alloy';

        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: cleanText,
            voice: voice,
            response_format: 'mp3'
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI TTS error: ${response.statusText}`);
        }

        const audioBlob = await response.blob();
        const audioBuffer = await audioBlob.arrayBuffer();
        const audioBytes = new Uint8Array(audioBuffer);

        // Upload vers Supabase Storage
        const fileName = `${articleId}_${language}_${Date.now()}.mp3`;
        const { data: uploadData, error: uploadError } = await supabaseClient
          .storage
          .from('article-audio')
          .upload(fileName, audioBytes, {
            contentType: 'audio/mpeg',
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Obtenir l'URL publique
        const { data: urlData } = supabaseClient
          .storage
          .from('article-audio')
          .getPublicUrl(fileName);

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
            status: 'ready'
          })
          .eq('id', audioRecord.id)
          .select()
          .single();

        if (updateError) throw updateError;

        console.log('✅ Audio créé avec succès via OpenAI');

        return new Response(
          JSON.stringify({ 
            success: true, 
            audio: updatedAudio,
            message: 'Audio généré avec succès (OpenAI)'
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
            status: 200,
          }
        );
      } catch (openaiError) {
        console.error('❌ Erreur OpenAI TTS:', openaiError);
        
        // Mettre à jour le statut en erreur
        await supabaseClient
          .from('articles_audio')
          .update({
            status: 'error',
            error_message: `OpenAI TTS error: ${openaiError.message}`
          })
          .eq('id', audioRecord.id);

        throw openaiError;
      }
    }

    // OPTION 2: Fallback - Retourner un statut 'pending' pour génération côté client
    console.log('⚠️ Pas de clé OpenAI - Audio sera généré côté client');
    
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

  } catch (error) {
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