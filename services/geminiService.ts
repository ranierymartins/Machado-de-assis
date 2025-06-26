import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME, MACHADO_DE_ASSIS_SYSTEM_INSTRUCTION } from '../constants';
import { GroundingChunk } from "../types";

let ai: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY do Gemini não configurada nas variáveis de ambiente.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const createMachadoChat = (): Chat => {
  const client = getAIClient();
  return client.chats.create({
    model: GEMINI_MODEL_NAME,
    config: {
      systemInstruction: MACHADO_DE_ASSIS_SYSTEM_INSTRUCTION,
      temperature: 0.7, 
      topP: 0.9,
      topK: 40,
    },
    // safetySettings: [...] // Add safety settings if needed
  });
};

export const sendMessageToMachado = async (
  chat: Chat,
  message: string
): Promise<{ text: string; groundingChunks?: GroundingChunk[] }> => {
  try {
    const stream = await chat.sendMessageStream({ message });
    let accumulatedText = "";
    let finalResponse: GenerateContentResponse | null = null;

    for await (const chunk of stream) {
        accumulatedText += chunk.text;
        finalResponse = chunk; // Keep track of the last chunk, which might contain aggregated data like grounding
    }

    let groundingChunks: GroundingChunk[] | undefined;
    if (finalResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        groundingChunks = finalResponse.candidates[0].groundingMetadata.groundingChunks.map(chunk => ({
            web: chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : undefined,
            retrievedContext: chunk.retrievedContext ? { uri: chunk.retrievedContext.uri, title: chunk.retrievedContext.title } : undefined,
        }));
    }

    return { text: accumulatedText, groundingChunks };

  } catch (error) {
    console.error("Erro ao enviar mensagem para o Gemini:", error);
    
    if (error instanceof Error) {
        // The error from the API can be messy. Let's give a user-friendly response.
        // Specifically for the 503 "overloaded" error, which is common.
        if (error.message.includes("503") || error.message.includes("overloaded")) {
            return { text: `Meu caro leitor, a musa da inspiração parece momentaneamente ausente, ou, em termos mais mundanos, o sistema está sobrecarregado. Rogo-lhe que tente novamente em alguns instantes.` };
        }

        // For other errors, try to parse the message to make it cleaner.
        try {
            // The error can be a JSON string, sometimes nested. We'll try to find the innermost message.
            let errorMessage = error.message;
            let parsed = JSON.parse(errorMessage);
            if (parsed.error && parsed.error.message) {
                errorMessage = parsed.error.message;
                try {
                    let nestedParsed = JSON.parse(errorMessage);
                    if (nestedParsed.error && nestedParsed.error.message) {
                        errorMessage = nestedParsed.error.message;
                    }
                } catch (e) { /* It wasn't a nested JSON, so we use the message we already extracted. */ }
            }
            return { text: `Enfrentei um percalço técnico: ${errorMessage}. Poderia reformular sua questão?` };

        } catch (e) {
            // If parsing fails, it's probably not a JSON string. Display the original error message.
            return { text: `Desculpe-me, ocorreu um contratempo em minha biblioteca interna: ${error.message}. Poderia reformular sua questão?` };
        }
    }

    // Fallback for non-Error instances.
    return { text: "Desculpe-me, ocorreu um contratempo em minha biblioteca interna. Poderia reformular sua questão?" };
  }
};
