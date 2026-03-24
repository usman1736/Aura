import React, { createContext, useContext, useState } from "react";
import { getAuth } from "firebase/auth";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface Chat {
  chatId: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  userId: string | null;
  isGuest: boolean;
}

interface ChatContextType {
  chats: Chat[];
  activeChatId: string | null;
  activeChat: Chat | null;
  createNewChat: () => string;
  switchChat: (chatId: string) => void;
  addMessage: (chatId: string, role: "user" | "assistant", content: string) => void;
  deleteChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function buildNewChat(): Chat {
  const user = getAuth().currentUser;
  const now = Date.now();
  return {
    chatId: generateId(),
    title: "New Chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
    userId: user?.uid ?? null,
    isGuest: !user,
  };
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const activeChat = chats.find((c) => c.chatId === activeChatId) ?? null;

  const createNewChat = (): string => {
    const chat = buildNewChat();
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.chatId);
    return chat.chatId;
  };

  const switchChat = (chatId: string) => setActiveChatId(chatId);

  const addMessage = (chatId: string, role: "user" | "assistant", content: string) => {
    const msg: Message = { id: generateId(), role, content, createdAt: Date.now() };
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.chatId !== chatId) return chat;
        const isFirstUserMsg = chat.messages.length === 0 && role === "user";
        return {
          ...chat,
          messages: [...chat.messages, msg],
          title: isFirstUserMsg ? content.slice(0, 38) : chat.title,
          updatedAt: Date.now(),
        };
      })
    );
  };

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.chatId !== chatId));
    setActiveChatId((prev) => (prev === chatId ? null : prev));
  };

  return (
    <ChatContext.Provider value={{ chats, activeChatId, activeChat, createNewChat, switchChat, addMessage, deleteChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
