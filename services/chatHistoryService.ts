/**
 * Firestore persistence and personalization (Person 3).
 * Paths: users/{userId}/chats/{chatId}, messages, searchHistory (keyword docs).
 */

import {
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/** Default chips when guest or no search history (exactly 4). */
export const DEFAULT_SUGGESTION_CHIPS = [
  "gym outfits",
  "winter wear",
  "streetwear",
  "formal wear",
];

/** Phrases and terms to detect in user prompts (longer phrases first). */
const FASHION_PHRASES = [
  "gym outfits",
  "winter wear",
  "formal wear",
  "streetwear",
  "hoodies",
  "accessories",
  "shoes",
];

const FASHION_SINGLE_WORDS = new Set([
  "shoes",
  "hoodies",
  "accessories",
  "streetwear",
  "sneakers",
  "jeans",
  "dress",
  "dresses",
  "blazer",
  "coat",
  "boots",
  "jacket",
  "pants",
  "shirt",
  "skirt",
  "suit",
  "tie",
  "watch",
  "bag",
  "hat",
  "scarf",
  "gym",
  "formal",
  "casual",
]);

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "what",
  "when",
  "where",
  "how",
  "show",
  "get",
  "need",
  "want",
  "like",
  "some",
  "your",
  "please",
]);

/**
 * Simple fashion keyword extraction: known phrases + fashion lexicon tokens.
 */
export function extractFashionKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  const phrases = [...FASHION_PHRASES].sort((a, b) => b.length - a.length);
  for (const p of phrases) {
    if (lower.includes(p)) found.add(p);
  }
  const words = lower.match(/[a-z]+/g) ?? [];
  for (const w of words) {
    if (w.length < 3 || STOP_WORDS.has(w)) continue;
    if (FASHION_SINGLE_WORDS.has(w)) {
      const covered = [...found].some((f) => f.includes(w));
      if (!covered) found.add(w);
    }
  }
  return [...found];
}

/** @deprecated Use extractFashionKeywords — alias for older call sites. */
export function extractFashionTags(text: string): string[] {
  return extractFashionKeywords(text);
}

function slugifyKeyword(s: string): string {
  const slug = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
  return slug || "keyword";
}

function chatsCol(userId: string) {
  return collection(db, "users", userId, "chats");
}

function messagesCol(userId: string, chatId: string) {
  return collection(db, "users", userId, "chats", chatId, "messages");
}

function searchHistoryCol(userId: string) {
  return collection(db, "users", userId, "searchHistory");
}

function tsToMs(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "number") return v;
  return Date.now();
}

export async function ensureUserDoc(userId: string): Promise<void> {
  const ref = doc(db, "users", userId);
  await setDoc(ref, { updatedAt: serverTimestamp() }, { merge: true });
}

export type SaveChatInput = {
  chatId: string;
  userId: string;
  title: string;
  isNew?: boolean;
};

/**
 * Chat document: chatId, title, userId, createdAt, updatedAt (server timestamps).
 */
export async function saveChat(
  userId: string,
  chatId: string,
  input: SaveChatInput
): Promise<void> {
  const ref = doc(db, "users", userId, "chats", chatId);
  const payload: Record<string, unknown> = {
    chatId: input.chatId,
    userId: input.userId,
    title: input.title,
    updatedAt: serverTimestamp(),
  };
  if (input.isNew) {
    payload.createdAt = serverTimestamp();
  }
  await setDoc(ref, payload, { merge: true });
}

export type SaveMessageInput = {
  text: string;
  sender: "user" | "ai";
};

/**
 * Message document: id, text, sender, createdAt (server timestamp).
 */
export async function saveMessage(
  userId: string,
  chatId: string,
  messageId: string,
  input: SaveMessageInput
): Promise<void> {
  const ref = doc(db, "users", userId, "chats", chatId, "messages", messageId);
  await setDoc(ref, {
    id: messageId,
    text: input.text,
    sender: input.sender,
    createdAt: serverTimestamp(),
  });
}

/**
 * One Firestore doc per keyword (id = slug). Increments frequency or creates row.
 */
export async function upsertKeywordFrequencies(
  userId: string,
  keywords: string[]
): Promise<void> {
  for (const kw of keywords) {
    const normalized = kw.toLowerCase().trim();
    if (!normalized) continue;
    const slug = slugifyKeyword(normalized);
    const ref = doc(db, "users", userId, "searchHistory", slug);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) {
        tx.set(ref, {
          keyword: normalized,
          createdAt: serverTimestamp(),
          frequency: 1,
        });
      } else {
        tx.update(ref, { frequency: increment(1) });
      }
    });
  }
}

export type FirestoreChatMeta = {
  chatId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};

export async function fetchUserChatsMeta(
  userId: string
): Promise<FirestoreChatMeta[]> {
  const q = query(chatsCol(userId), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      chatId: d.id,
      title: typeof data.title === "string" ? data.title : "Chat",
      createdAt: tsToMs(data.createdAt),
      updatedAt: tsToMs(data.updatedAt),
    };
  });
}

export type FetchedMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  tags?: string[];
};

/**
 * Loads messages; supports Person 3 schema (text, sender) and legacy (role, content).
 */
export async function fetchChatMessages(
  userId: string,
  chatId: string
): Promise<FetchedMessage[]> {
  const q = query(messagesCol(userId, chatId), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => {
    const data = d.data();
    const sender = data.sender;
    let role: "user" | "assistant" = "user";
    let content = "";
    if (sender === "ai" || sender === "assistant") {
      role = "assistant";
      content = String(data.text ?? data.content ?? "");
    } else if (sender === "user") {
      role = "user";
      content = String(data.text ?? data.content ?? "");
    } else if (data.role === "assistant") {
      role = "assistant";
      content = String(data.content ?? data.text ?? "");
    } else {
      role = "user";
      content = String(data.content ?? data.text ?? "");
    }
    return {
      id: d.id,
      role,
      content,
      createdAt: tsToMs(data.createdAt),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    };
  });
  rows.sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
  return rows;
}

type HistoryRow = { keyword: string; frequency: number };

function parseSearchHistoryDoc(data: Record<string, unknown>): HistoryRow | null {
  if (typeof data.keyword === "string" && data.keyword.trim()) {
    return {
      keyword: data.keyword.trim(),
      frequency:
        typeof data.frequency === "number" && !Number.isNaN(data.frequency)
          ? data.frequency
          : 1,
    };
  }
  return null;
}

/**
 * Top 4 keywords by frequency; pad with defaults to length 4.
 */
export async function getPersonalizedSuggestions(
  userId: string
): Promise<string[]> {
  try {
    const snap = await getDocs(searchHistoryCol(userId));
    const rows: HistoryRow[] = [];
    for (const d of snap.docs) {
      const parsed = parseSearchHistoryDoc(d.data() as Record<string, unknown>);
      if (parsed) rows.push(parsed);
    }
    rows.sort((a, b) => b.frequency - a.frequency);
    const personalized = rows.slice(0, 4).map((r) => r.keyword);

    const out: string[] = [...personalized];
    const seen = new Set(out.map((s) => s.toLowerCase()));
    for (const d of DEFAULT_SUGGESTION_CHIPS) {
      if (out.length >= 4) break;
      if (seen.has(d.toLowerCase())) continue;
      seen.add(d.toLowerCase());
      out.push(d);
    }

    const chips = out.slice(0, 4);
    console.log("[Aura] chips loaded", chips);
    return chips;
  } catch (e) {
    console.error("[Aura] getPersonalizedSuggestions failed:", e);
    const fallback = [...DEFAULT_SUGGESTION_CHIPS];
    console.log("[Aura] chips loaded", fallback);
    return fallback;
  }
}
