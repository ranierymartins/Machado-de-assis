
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import { createMachadoChat, sendMessageToMachado } from './services/geminiService';
import { textToSpeech } from './services/elevenLabsService';
import ChatMessageComponent from './components/ChatMessage';
import { ChatMessage, Sender } from './types';
import MicrophoneIcon from './components/icons/MicrophoneIcon';
import SpinnerIcon from './components/icons/SpinnerIcon';
import SpeakerWaveIcon from './components/icons/SpeakerWaveIcon'; // Novo ícone
import { ELEVENLABS_API_KEY, ELEVENLABS_API_KEY_PLACEHOLDER } from './constants';

const BrowserSpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any | null = null;
if (BrowserSpeechRecognition) {
  recognition = new BrowserSpeechRecognition();
  if (recognition) {
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  }
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSynthesizingSpeech, setIsSynthesizingSpeech] = useState<boolean>(false); // Novo estado
  const [machadoChat, setMachadoChat] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geminiAvailable, setGeminiAvailable] = useState<boolean>(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioEndedHandler = useRef<(() => void) | null>(null);
  const currentAudioErrorHandler = useRef<((event: Event) => void) | null>(null);

  useEffect(() => {
    if (!process.env.API_KEY) {
        setGeminiAvailable(false);
    }
    try {
      const chatInstance = createMachadoChat();
      setMachadoChat(chatInstance);
      setMessages([
        {
          id: Date.now().toString(),
          text: "Saudações! Sou Machado de Assis, ou ao menos uma emulação de seu espírito literário. Em que posso ser útil ou com que reflexões podemos nos entreter hoje?",
          sender: Sender.Bot,
          timestamp: new Date(),
        },
      ]);
      if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === ELEVENLABS_API_KEY_PLACEHOLDER) {
        setMessages(prev => [...prev, {
            id: Date.now().toString() + '-system-no-audio',
            text: "A funcionalidade de áudio está desabilitada. Para ativá-la, configure a chave da API da ElevenLabs no arquivo constants.ts.",
            sender: Sender.System,
            timestamp: new Date()
        }]);
      } else {
         setMessages(prev => [...prev, {
            id: Date.now().toString() + '-system-audio-ready',
            text: "Voz de Machado pronta. As respostas poderão ser ouvidas.",
            sender: Sender.System,
            timestamp: new Date()
        }]);
      }
    } catch (e) {
        setGeminiAvailable(false);
        if (e instanceof Error) {
            setError(`Erro ao inicializar o chat com Gemini: ${e.message}. Verifique se a API_KEY do Gemini está configurada corretamente no ambiente.`);
            setMessages([{
                id: Date.now().toString(),
                text: `Não foi possível iniciar a conversa: ${e.message}. Por favor, verifique a configuração da API Key do Gemini.`,
                sender: Sender.System,
                timestamp: new Date(),
            }]);
        } else {
            setError("Ocorreu um erro desconhecido ao inicializar o chat com Gemini.");
             setMessages([{
                id: Date.now().toString(),
                text: "Ocorreu um erro desconhecido ao inicializar o chat.",
                sender: Sender.System,
                timestamp: new Date(),
            }]);
        }
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const cleanupOldAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (currentAudioEndedHandler.current) {
        audioRef.current.removeEventListener('ended', currentAudioEndedHandler.current);
        currentAudioEndedHandler.current = null;
      }
      if (currentAudioErrorHandler.current) {
        audioRef.current.removeEventListener('error', currentAudioErrorHandler.current);
        currentAudioErrorHandler.current = null;
      }
      audioRef.current.src = "";
    }
    setIsSynthesizingSpeech(false); // Garante que o estado de síntese seja resetado
  }, []);


  const playAudio = useCallback(async (text: string) => {
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === ELEVENLABS_API_KEY_PLACEHOLDER || !text) {
        setIsLoading(false); 
        setIsSynthesizingSpeech(false);
        return;
    }
    setIsSynthesizingSpeech(true); // Começa a síntese
    try {
      const audioBlob = await textToSpeech(text);
      if (audioBlob) {
        cleanupOldAudio(); 

        const audioUrl = URL.createObjectURL(audioBlob);
        const newAudio = new Audio(audioUrl);
        audioRef.current = newAudio; 
        
        const onAudioEnd = () => {
            setIsLoading(false);
            setIsSynthesizingSpeech(false);
            if (audioRef.current) { 
                audioRef.current.removeEventListener('ended', onAudioEnd); 
                if (currentAudioErrorHandler.current) audioRef.current.removeEventListener('error', currentAudioErrorHandler.current);
            }
            currentAudioEndedHandler.current = null;
            currentAudioErrorHandler.current = null;
        };

        const onAudioError = (event: Event) => {
            console.error("Audio playback error:", event);
            setError("Erro ao reproduzir o áudio gerado.");
            setIsLoading(false);
            setIsSynthesizingSpeech(false);
            if (audioRef.current) {
                if (currentAudioEndedHandler.current) audioRef.current.removeEventListener('ended', currentAudioEndedHandler.current);
                audioRef.current.removeEventListener('error', onAudioError); 
            }
            currentAudioEndedHandler.current = null;
            currentAudioErrorHandler.current = null;
        };

        currentAudioEndedHandler.current = onAudioEnd;
        currentAudioErrorHandler.current = onAudioError;
        
        newAudio.addEventListener('ended', onAudioEnd);
        newAudio.addEventListener('error', onAudioError);
        
        await newAudio.play();
      } else {
        setIsLoading(false); 
        setIsSynthesizingSpeech(false);
      }
    } catch (e) {
      console.error("Erro ao reproduzir áudio:", e);
      if (e instanceof Error) {
        setError(`Erro na reprodução de áudio: ${e.message}`);
      } else {
         setError("Erro desconhecido na reprodução de áudio.");
      }
      setIsLoading(false);
      setIsSynthesizingSpeech(false);
    }
  }, [cleanupOldAudio, setIsLoading, setError, setIsSynthesizingSpeech]);

  const handleSendMessage = useCallback(async (messageText: string) => {
    const textToSend = messageText.trim();
    if (!textToSend || !machadoChat) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      text: textToSend,
      sender: Sender.User,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsSynthesizingSpeech(false); // Reset before new message

    cleanupOldAudio(); 

    try {
      const response = await sendMessageToMachado(machadoChat, textToSend);
      const botMessage: ChatMessage = {
        id: Date.now().toString() + '-bot',
        text: response.text,
        sender: Sender.Bot,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      
      if (ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== ELEVENLABS_API_KEY_PLACEHOLDER && response.text) {
        // isLoading é mantido true, playAudio irá setá-lo para false ao terminar ou falhar
        await playAudio(response.text); 
      } else {
        setIsLoading(false);
        setIsSynthesizingSpeech(false);
      }

    } catch (e) {
      console.error("Erro ao processar mensagem:", e);
      const errorMessageText = e instanceof Error ? e.message : "Erro desconhecido.";
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        text: `Meu caro, parece que enfrentamos um percalço técnico: ${errorMessageText}`,
        sender: Sender.Bot, 
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError(`Erro ao enviar mensagem: ${errorMessageText}`);
      setIsLoading(false);
      setIsSynthesizingSpeech(false);
    }
  }, [machadoChat, playAudio, cleanupOldAudio, setIsLoading, setMessages, setError, setIsSynthesizingSpeech]);

  useEffect(() => {
    if (recognition) {
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript); 
      };
      recognition.onerror = (event: any) => {
        console.error("Erro no reconhecimento de voz:", event.error);
        setError(`Erro no reconhecimento de voz: ${event.error}. Tente novamente.`);
        setIsRecording(false);
      };
      recognition.onend = () => {
        setIsRecording(false);
      };
    }
  }, [handleSendMessage, setError, setIsRecording]);


  const handleVoiceInput = useCallback(() => {
    if (!BrowserSpeechRecognition) {
      setError("Seu navegador não suporta reconhecimento de voz.");
      return;
    }
    if (!recognition) {
        setError("Não foi possível inicializar o reconhecimento de voz.");
        return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      if (audioRef.current && !audioRef.current.paused) {
        cleanupOldAudio();
        // Se a interrupção de áudio estava causando isLoading, ele será resetado indiretamente
        // pelo fluxo normal de playAudio ou pelo início de uma nova mensagem.
        // Explicitamente setar isLoading(false) aqui pode ser prematuro se Gemini estiver pensando.
        // O fluxo de handleSendMessage cuidará de setIsLoading.
      }
      // Se Gemini estiver 'ponderando' (isLoading=true, !isSynthesizingSpeech), 
      // iniciar uma nova gravação deve limpar esse estado visualmente, 
      // pois a nova interação tem prioridade.
      // setIsLoading(false); // Reset visual do "ponderando" - mas handleSendMessage fará isso.
      // setIsSynthesizingSpeech(false); // Garante que o indicador de narração suma.
      
      try {
        recognition.start();
        setIsRecording(true);
        setError(null); 
      } catch (e) {
         console.error("Erro ao iniciar gravação:", e);
         setError("Não foi possível iniciar a gravação. Verifique as permissões do microfone.");
         setIsRecording(false);
      }
    }
  }, [isRecording, recognition, cleanupOldAudio, setIsRecording, setError, audioRef]);
  
  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-stone-50 shadow-2xl font-serif">
      <header className="bg-stone-800 text-white p-4 shadow-md">
        <h1 className="text-3xl font-['Georgia',_serif] text-amber-50 text-center">Diálogos com Machado de Assis</h1>
        { !geminiAvailable && <p className="text-xs text-red-400 text-center mt-2">Atenção: A API Key do Gemini não foi detectada ou é inválida. O chatbot pode não funcionar.</p> }
         { ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== ELEVENLABS_API_KEY_PLACEHOLDER ? 
            <p className="text-xs text-emerald-300 text-center mt-2">Áudio da ElevenLabs Ativado.</p> :
            <p className="text-xs text-amber-300 text-center mt-2">Áudio da ElevenLabs Desativado.</p> // Removido 'Configure a chave...' para simplificar
         }
      </header>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 border-b border-red-300 text-sm text-center">
          {error} <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700 font-semibold">[X]</button>
        </div>
      )}

      <div ref={chatContainerRef} className="flex-grow p-4 md:p-6 space-y-4 overflow-y-auto bg-stone-100 scroll-smooth">
        {messages.map((msg) => (
          <ChatMessageComponent key={msg.id} message={msg} />
        ))}
        {/* Indicador de "ponderando" foi movido para o footer */}
      </div>

      <footer className="bg-stone-200 p-3 md:p-4 border-t border-stone-300 flex flex-col items-center justify-center space-y-3 min-h-[140px] md:min-h-[160px]">
        <div className="h-6 text-sm"> {/* Área para texto de status */}
          {isRecording && (
            <div className="flex items-center text-red-700">
              <MicrophoneIcon className="w-5 h-5 mr-2 text-red-500 opacity-75 animate-ping" style={{animationDuration: '1.5s'}} />
              <span>Gravando sua eloquência...</span>
            </div>
          )}
          {!isRecording && isLoading && isSynthesizingSpeech && (
            <div className="flex items-center text-teal-700">
              <SpeakerWaveIcon className="w-5 h-5 mr-2 animate-pulse" style={{animationDuration: '1.2s'}}/>
              <span>Machado está narrando...</span>
            </div>
          )}
          {!isRecording && isLoading && messages.length > 0 && messages[messages.length -1]?.sender === Sender.User && !isSynthesizingSpeech && (
            <div className="flex items-center text-sky-700">
              <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
              <span>Machado está a ponderar...</span>
            </div>
          )}
        </div>
        
        {BrowserSpeechRecognition ? (
            <button
              onClick={handleVoiceInput}
              disabled={!geminiAvailable} 
              className={`p-4 rounded-full text-white transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-50
                          ${isRecording 
                            ? 'bg-red-500 hover:bg-red-600 ring-red-400 animate-pulse' 
                            : (isLoading && !isRecording) // Visualmente menos ativo se carregando mas não gravando
                              ? 'bg-teal-400 hover:bg-teal-500 ring-teal-300'
                              : 'bg-teal-500 hover:bg-teal-600 ring-teal-300'
                          }
                          ${!geminiAvailable ? 'bg-stone-400 cursor-not-allowed ring-stone-200 pointer-events-none' : ''}
                          w-16 h-16 md:w-20 md:h-20 flex items-center justify-center 
                        `}
              aria-label={isRecording ? "Parar gravação" : "Gravar voz"}
            >
              <MicrophoneIcon className="w-8 h-8 md:w-10 md:h-10" />
            </button>
          ) : (
            <p className="text-sm text-stone-700">Reconhecimento de voz não suportado neste navegador.</p>
          )
        }
         {!BrowserSpeechRecognition && geminiAvailable && (
             <p className="text-xs text-stone-600 text-center mt-1">Considere usar um navegador com suporte a reconhecimento de voz para uma experiência completa.</p>
         )}
      </footer>
    </div>
  );
};

export default App;
