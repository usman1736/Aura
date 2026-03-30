import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";
import { auth } from "../firebase";
import {
  ensureUserDoc,
  extractFashionKeywords,
  fetchChatMessages,
  fetchUserChatsMeta,
  saveChat,
  saveMessage,
  upsertKeywordFrequencies,
} from "../services/chatHistoryService";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  tags?: string[];
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

export type ChatSyncStatus = "idle" | "loading" | "ready" | "error";

interface ChatContextType {
  chats: Chat[];
  activeChatId: string | null;
  activeChat: Chat | null;
  createNewChat: () => string;
  switchChat: (chatId: string) => void;
  addMessage: (chatId: string, role: "user" | "assistant", content: string) => void;
  deleteChat: (chatId: string) => void;
  chatSyncStatus: ChatSyncStatus;
  chatSyncError: string | null;
  firestoreWriteVersion: number;
}

const ChatContext = createContext<ChatContextType | null>(null);

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function buildNewChat(isGuest: boolean, userId: string | null): Chat {
  const now = Date.now();
  return {
    chatId: generateId(),
    title: "New Chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
    userId,
    isGuest,
  };
}

/** When addMessage runs in the same tick as createNewChat, state may not include the new chat yet — use this shell. */
function buildChatShell(
  chatId: string,
  isGuest: boolean,
  userId: string | null
): Chat {
  const now = Date.now();
  return {
    chatId,
    title: "New Chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
    userId,
    isGuest,
  };
}

function logAuthSnapshot(label: string, ctxUser: typeof auth.currentUser) {
  if (!__DEV__) return;
  console.log(`[Aura][auth] ${label}`, {
    "AuthContext user uid": ctxUser?.uid ?? null,
    "auth.currentUser uid": auth.currentUser?.uid ?? null,
  });
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const authCtx = useContext(AuthContext);
  const ctxUser = authCtx?.user ?? null;

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatSyncStatus, setChatSyncStatus] = useState<ChatSyncStatus>("idle");
  const [chatSyncError, setChatSyncError] = useState<string | null>(null);
  const [firestoreWriteVersion, setFirestoreWriteVersion] = useState(0);

  const activeChat = chats.find((c) => c.chatId === activeChatId) ?? null;

  const messagesLoadedRef = useRef<Set<string>>(new Set());
  const ensuredUserRef = useRef<string | null>(null);
  /** Mirrors `chats` so addMessage sees createNewChat in the same event tick. */
  const chatsRef = useRef<Chat[]>([]);

  const uid = ctxUser?.uid ?? null;

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    messagesLoadedRef.current = new Set();
    ensuredUserRef.current = null;

    if (!uid) {
      chatsRef.current = [];
      setChats([]);
      setActiveChatId(null);
      setChatSyncStatus("idle");
      setChatSyncError(null);
      return;
    }

    let cancelled = false;
    setChatSyncStatus("loading");
    setChatSyncError(null);

    (async () => {
      try {
        const meta = await fetchUserChatsMeta(uid);
        if (cancelled) return;

        const remoteChats: Chat[] = meta.map((m) => ({
          chatId: m.chatId,
          title: m.title,
          messages: [],
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
          userId: uid,
          isGuest: false,
        }));

        chatsRef.current = remoteChats;
        setChats(remoteChats);
        setActiveChatId((prev) => {
          if (prev && remoteChats.some((c) => c.chatId === prev)) return prev;
          return remoteChats[0]?.chatId ?? null;
        });
        setChatSyncStatus("ready");
      } catch (e: unknown) {
        if (cancelled) return;
        console.error("[Aura] fetchUserChatsMeta failed:", e);
        const msg = e instanceof Error ? e.message : "Could not load chats";
        setChatSyncError(msg);
        setChatSyncStatus("error");
        chatsRef.current = [];
        setChats([]);
        setActiveChatId(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const loadMessagesForChat = useCallback(
    async (chatId: string) => {
      if (!uid || messagesLoadedRef.current.has(chatId)) return;
      messagesLoadedRef.current.add(chatId);
      try {
        const rows = await fetchChatMessages(uid, chatId);
        setChats((prev) =>
          prev.map((c) =>
            c.chatId === chatId ? { ...c, messages: rows } : c
          )
        );
      } catch (e) {
        console.error("[Aura] fetchChatMessages failed:", e);
        messagesLoadedRef.current.delete(chatId);
        const detail = e instanceof Error ? e.message : String(e);
        setChatSyncError(`Could not load messages for this chat: ${detail}`);
      }
    },
    [uid]
  );

  const createNewChat = (): string => {
    const writingUid = ctxUser?.uid ?? auth.currentUser?.uid ?? null;
    const isGuest = !writingUid;
    logAuthSnapshot("createNewChat", ctxUser);
    const chat = buildNewChat(isGuest, writingUid);
    setChats((prev) => {
      const next = [chat, ...prev];
      chatsRef.current = next;
      return next;
    });
    setActiveChatId(chat.chatId);
    messagesLoadedRef.current.add(chat.chatId);
    return chat.chatId;
  };

  const switchChat = (chatId: string) => {
    setActiveChatId(chatId);
    if (uid) void loadMessagesForChat(chatId);
  };

  useEffect(() => {
    if (!uid || !activeChatId || chatSyncStatus !== "ready") return;
    void loadMessagesForChat(activeChatId);
  }, [uid, activeChatId, chatSyncStatus, loadMessagesForChat]);

  const persistRemoteMessage = async (
    userId: string,
    chatId: string,
    messageId: string,
    role: "user" | "assistant",
    content: string,
    meta: { isFirstUserMessage: boolean; title: string }
  ) => {
    try {
      setChatSyncError(null);

      if (ensuredUserRef.current !== userId) {
        await ensureUserDoc(userId);
        ensuredUserRef.current = userId;
      }

      const sender = role === "assistant" ? "ai" : "user";

      await saveMessage(userId, chatId, messageId, {
        text: content,
        sender,
      });

      if (role === "user") {
        const keywords = extractFashionKeywords(content);
        if (keywords.length > 0) {
          await upsertKeywordFrequencies(userId, keywords);
          console.log("[Aura] history updated");
          setFirestoreWriteVersion((v) => v + 1);
        }
      }

      await saveChat(userId, chatId, {
        chatId,
        userId,
        title: meta.title,
        isNew: meta.isFirstUserMessage,
      });

      console.log("[Aura] chat saved");
    } catch (e: unknown) {
      const code =
        e && typeof e === "object" && "code" in e
          ? String((e as { code: string }).code)
          : "";
      const message =
        e instanceof Error ? e.message : e ? String(e) : "unknown error";
      console.error("[Aura] Firestore persist failed:", { code, message, e });
      setChatSyncError(
        code ? `${code}: ${message}` : message || "Could not save to the cloud."
      );
    }
  };

  const addMessage = (
    chatId: string,
    role: "user" | "assistant",
    content: string
  ) => {
    const writingUid = ctxUser?.uid ?? auth.currentUser?.uid ?? null;
    logAuthSnapshot("addMessage", ctxUser);

    const msgId = generateId();
    const tags =
      role === "user" ? extractFashionKeywords(content) : undefined;
    const msg: Message = {
      id: msgId,
      role,
      content,
      createdAt: Date.now(),
      ...(tags?.length ? { tags } : {}),
    };

    let base = chatsRef.current;
    if (!base.some((c) => c.chatId === chatId)) {
      messagesLoadedRef.current.add(chatId);
      const shell = buildChatShell(chatId, !writingUid, writingUid);
      base = [shell, ...base];
      if (__DEV__) {
        console.log("[Aura] addMessage: injected chat shell (same-tick create)", chatId);
      }
    }

    const existing = base.find((c) => c.chatId === chatId);
    if (!existing) {
      console.error("[Aura] addMessage: chat not found after shell inject", chatId);
      return;
    }

    const isFirstUserMessage =
      existing.messages.length === 0 && role === "user";
    const title = isFirstUserMessage
      ? content.slice(0, 38)
      : existing.title;
    const persistMeta = { isFirstUserMessage, title };

    const next = base.map((chat) => {
      if (chat.chatId !== chatId) return chat;
      return {
        ...chat,
        messages: [...chat.messages, msg],
        title,
        updatedAt: Date.now(),
      };
    });

    chatsRef.current = next;
    setChats(next);

    if (writingUid) {
      void persistRemoteMessage(
        writingUid,
        chatId,
        msgId,
        role,
        content,
        persistMeta
      );
    } else {
      console.error(
        "[Aura] Firestore persist skipped: no uid — AuthContext.user and auth.currentUser are both null",
        {
          hasAuthContext: authCtx != null,
          ctxUserUid: ctxUser?.uid ?? null,
          authCurrentUid: auth.currentUser?.uid ?? null,
        }
      );
    }
  };

  const deleteChat = (chatId: string) => {
    messagesLoadedRef.current.delete(chatId);
    setChats((prev) => {
      const next = prev.filter((c) => c.chatId !== chatId);
      chatsRef.current = next;
      return next;
    });
    setActiveChatId((prev) => (prev === chatId ? null : prev));
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        activeChat,
        createNewChat,
        switchChat,
        addMessage,
        deleteChat,
        chatSyncStatus,
        chatSyncError,
        firestoreWriteVersion,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
