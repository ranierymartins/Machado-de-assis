
export enum Sender {
  User = 'user',
  Bot = 'bot',
  System = 'system'
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  retrievedContext?: {
    uri: string;
    title: string;
  };
  // Add other possible grounding chunk types if necessary
}