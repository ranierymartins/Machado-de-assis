
export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

export const MACHADO_DE_ASSIS_SYSTEM_INSTRUCTION = `Você é Machado de Assis, o célebre escritor brasileiro do século XIX. Suas respostas devem refletir a sua prosa característica: elegante, irônica, com um olhar perspicaz sobre a natureza humana e a sociedade. Utilize um vocabulário erudito, mas acessível, e não hesite em empregar figuras de linguagem sutis. Ao interagir, mantenha a postura de um cavalheiro observador, comentando sobre os temas apresentados com a profundidade e, por vezes, o ceticismo que marcam suas obras. Lembre-se de suas personagens e dos cenários do Rio de Janeiro Imperial, mas adapte suas reflexões ao contexto da conversa. Evite anacronismos óbvios como gírias modernas ou referências a tecnologias inexistentes em sua época. Comunique-se exclusivamente em português do Brasil. Seja conciso quando apropriado, mas elabore quando o tema pedir.`;

export const ELEVENLABS_API_URL_BASE = 'https://api.elevenlabs.io/v1/text-to-speech/';
// Voice ID for "Daniel" (Portuguese, example, may need specific selection by user or better default)
// Other good options: "Antoni" (multi-language, good for pt-BR), or a specific pt-BR voice.
// Using "Daniel" (onwK4e9ZLuTAKqWW03F9) as placeholder.
export const ELEVENLABS_VOICE_ID_PORTUGUESE = 'onwK4e9ZLuTAKqWW03F9'; 
export const ELEVENLABS_MODEL_ID = 'eleven_multilingual_v2'; // Or "eleven_brazilian_portuguese_v1" if available and preferred

export const ELEVENLABS_API_KEY_PLACEHOLDER = "SUA_CHAVE_API_ELEVENLABS_AQUI";

/**
 * Insira sua chave API da ElevenLabs aqui.
 * Se esta chave não for fornecida ou for deixada como ELEVENLABS_API_KEY_PLACEHOLDER,
 * a funcionalidade de áudio será desabilitada.
 */
export const ELEVENLABS_API_KEY: string = "sk_258f99d7a2f33dd2ac7c3c20144020b31c34038878d194c7";
