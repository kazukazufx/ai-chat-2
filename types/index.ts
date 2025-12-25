export interface MessageImage {
  id: string;
  url: string;
  type: string;
  createdAt: Date;
  messageId: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  conversationId: string;
  images?: MessageImage[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}
