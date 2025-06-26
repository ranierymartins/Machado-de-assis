
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
    // The Chat object manages its own history.
    // System instruction is applied at chat creation or can be part of sendMessage if API supports it.
    // For this SDK, systemInstruction is part of chat.create config.
    
    // Using chat.sendMessageStream as it correctly handles chat history and context.
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
        return { text: `Desculpe-me, ocorreu um contratempo em minha biblioteca interna: ${error.message}. Poderia reformular sua questão?` };
    }
    return { text: "Desculpe-me, ocorreu um contratempo em minha biblioteca interna. Poderia reformular sua questão?" };
  }
};