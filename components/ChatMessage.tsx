
import React from 'react';
import { ChatMessage as ChatMessageType, Sender } from '../types';
import { UserIcon, BotIcon, SystemIcon } from './icons/MessageIcons'; // Assuming you have these

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;
  const isBot = message.sender === Sender.Bot;
  const isSystem = message.sender === Sender.System;

  let alignment = 'justify-start';
  let bgColor = 'bg-stone-200';
  let textColor = 'text-stone-800';
  let icon = <BotIcon className="w-8 h-8 text-stone-500" />;

  if (isUser) {
    alignment = 'justify-end';
    bgColor = 'bg-sky-600';
    textColor = 'text-white';
    icon = <UserIcon className="w-8 h-8 text-sky-200" />;
  } else if (isSystem) {
    // For system messages, we'll make them full width and centered.
    if (message.text.includes("Chave da API ElevenLabs configurada") || message.text.includes("Chave da API ElevenLabs removida")) {
        bgColor = 'bg-emerald-50'; // Lighter green for API key confirmation
        textColor = 'text-emerald-700';
    } else {
        bgColor = 'bg-amber-100';
        textColor = 'text-amber-700';
    }
    icon = <SystemIcon className="w-6 h-6 text-amber-600" />; // Icon might not be shown for full-width system messages
  }


  const formattedTime = message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (isSystem) {
    return (
      <div className={`w-full flex justify-center my-3 px-2`}>
          <div className={`px-4 py-2 rounded-lg shadow-sm ${bgColor} ${textColor} text-center text-xs italic max-w-md`}>
              {message.text}
          </div>
      </div>
    );
  }

  return (
    <div className={`flex ${alignment} mb-4 items-end gap-2 group`}>
      {!isUser && ( // Bot message icon
        <div className="flex-shrink-0 self-start mt-1">
          {icon}
        </div>
      )}
       <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
            className={`max-w-md md:max-w-lg lg:max-w-xl px-4 py-3 rounded-xl shadow-md ${bgColor} ${textColor} order-1 ${isUser ? 'rounded-br-none' : 'rounded-bl-none'}`}
        >
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
        </div>
        <time className={`text-xs text-stone-500 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isUser ? 'mr-1' : 'ml-1'}`}>
            {formattedTime} {isBot ? ' - Machado de Assis' : isUser ? ' - Você' : ''}
        </time>
      </div>
      {isUser && ( // User message icon
         <div className="flex-shrink-0 self-start mt-1">
          {icon}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;