
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import { createMachadoChat, sendMessageToMachado } from './services/geminiService';
import { textToSpeech } from './services/elevenLabsService';
import ChatMessageComponent from './components/ChatMessage';
import { ChatMessage, Sender } from './types';
import MicrophoneIcon from './components/icons/MicrophoneIcon';
import SpinnerIcon from './components/icons/SpinnerIcon';
import SpeakerWaveIcon from './components/icons/SpeakerWaveIcon';
import { ELEVENLABS_API_KEY, ELEVENLABS_API_KEY_PLACEHOLDER } from './constants';
import HomePage from './components/HomePage';

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
  const [showChat, setShowChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSynthesizingSpeech, setIsSynthesizingSpeech] = useState<boolean>(false);
  const [machadoChat, setMachadoChat] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geminiAvailable, setGeminiAvailable] = useState<boolean>(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioEndedHandler = useRef<(() => void) | null>(null);
  const currentAudioErrorHandler = useRef<((event: Event) => void) | null>(null);

  useEffect(() => {
    // Check for Gemini API key availability on mount.
    if (!process.env.API_KEY) {
        setGeminiAvailable(false);
        setError("Atenção: A API Key do Gemini não foi detectada. O chatbot não funcionará.");
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
    setIsSynthesizingSpeech(false); 
  }, []);

  const handleStartChat = useCallback(() => {
    if (!geminiAvailable) return;
    
    setError(null);
    setIsLoading(false);
    cleanupOldAudio();
    
    try {
      const chatInstance = createMachadoChat();
      setMachadoChat(chatInstance);
      let initialMessages: ChatMessage[] = [
        {
          id: Date.now().toString(),
          text: "Saudações! Sou Machado de Assis, ou ao menos uma emulação de seu espírito literário. Em que posso ser útil ou com que reflexões podemos nos entreter hoje?",
          sender: Sender.Bot,
          timestamp: new Date(),
        },
      ];
      if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === ELEVENLABS_API_KEY_PLACEHOLDER) {
        initialMessages.push({
            id: Date.now().toString() + '-system-no-audio',
            text: "A funcionalidade de áudio está desabilitada. Para ativá-la, configure a chave da API da ElevenLabs no arquivo constants.ts.",
            sender: Sender.System,
            timestamp: new Date()
        });
      } else {
         initialMessages.push({
            id: Date.now().toString() + '-system-audio-ready',
            text: "Voz de Machado pronta. As respostas poderão ser ouvidas.",
            sender: Sender.System,
            timestamp: new Date()
        });
      }
      setMessages(initialMessages);
      setShowChat(true);

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
        setError(`Erro ao inicializar o chat: ${errorMessage}. Verifique a configuração da API Key.`);
        setShowChat(true); // Show chat screen to display the error
    }
  }, [cleanupOldAudio, geminiAvailable]);
  
  const handleGoBack = () => {
    cleanupOldAudio();
    setShowChat(false);
  };

  const playAudio = useCallback(async (text: string) => {
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === ELEVENLABS_API_KEY_PLACEHOLDER || !text) {
        setIsLoading(false); 
        setIsSynthesizingSpeech(false);
        return;
    }
    setIsSynthesizingSpeech(true);
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
    setIsSynthesizingSpeech(false); 

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
      }
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
  
  if (!showChat) {
    return <HomePage onStartChat={handleStartChat} />;
  }
  
  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-stone-50 shadow-2xl font-serif">
      <header className="bg-stone-800 text-white p-4 shadow-md flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="p-2 rounded-full hover:bg-stone-700 transition-colors"
          aria-label="Voltar para a página inicial"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-['Georgia',_serif] text-amber-50">Diálogos com Machado</h1>
            { ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== ELEVENLABS_API_KEY_PLACEHOLDER ? 
                <p className="text-xs text-emerald-300">Áudio Ativado</p> :
                <p className="text-xs text-amber-300">Áudio Desativado</p>
            }
        </div>
        <div className="w-10 h-10"></div> {/* Placeholder to balance flex layout */}
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
              <span>Machado está preparando o aúdio...</span>
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
              disabled={!geminiAvailable || !machadoChat} 
              className={`p-4 rounded-full text-white transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-50
                          ${isRecording 
                            ? 'bg-red-500 hover:bg-red-600 ring-red-400 animate-pulse' 
                            : (isLoading && !isRecording)
                              ? 'bg-teal-400 hover:bg-teal-500 ring-teal-300'
                              : 'bg-teal-500 hover:bg-teal-600 ring-teal-300'
                          }
                          ${(!geminiAvailable || !machadoChat) ? 'bg-stone-400 cursor-not-allowed ring-stone-200 pointer-events-none' : ''}
                          w-24 h-24 md:w-28 md:h-28 flex items-center justify-center 
                        `}
              aria-label={isRecording ? "Parar gravação" : "Gravar voz"}
            >
              <MicrophoneIcon className="w-12 h-12 md:w-14 md:h-14" />
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
