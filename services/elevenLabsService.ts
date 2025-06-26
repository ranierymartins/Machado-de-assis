
import { ELEVENLABS_API_URL_BASE, ELEVENLABS_VOICE_ID_PORTUGUESE, ELEVENLABS_MODEL_ID, ELEVENLABS_API_KEY, ELEVENLABS_API_KEY_PLACEHOLDER } from '../constants';

export const textToSpeech = async (text: string): Promise<Blob | null> => {
  if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === ELEVENLABS_API_KEY_PLACEHOLDER) {
    console.warn("Chave API da ElevenLabs não configurada ou é o valor placeholder. Funcionalidade de áudio desabilitada.");
    return null;
  }

  const url = `${ELEVENLABS_API_URL_BASE}${ELEVENLABS_VOICE_ID_PORTUGUESE}`;
  const headers = {
    'Accept': 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': ELEVENLABS_API_KEY,
  };
  const body = JSON.stringify({
    text: text,
    model_id: ELEVENLABS_MODEL_ID, // e.g., "eleven_multilingual_v2" or a specific Portuguese model
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.3, // Add style parameter if desired (0 to 1)
      use_speaker_boost: true
    },
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`Erro na API ElevenLabs: ${response.status}`, errorData);
      throw new Error(`Erro ${response.status} da API ElevenLabs: ${errorData.detail?.message || errorData.message || response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error("Erro ao converter texto para fala:", error);
    // Propagate the error message to be displayed to the user
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Falha na comunicação com o serviço de voz.");
  }
};
