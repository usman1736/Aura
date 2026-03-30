import OpenAI from "openai";
import { extractFashionKeywords } from "./chatHistoryService";

/**
 * Broader fashion term list used for guardrail detection.
 * Complements extractFashionKeywords which looks for known tags/phrases.
 */
const FASHION_TERMS = new Set([
  "wear", "wearing", "wore", "outfit", "outfits", "clothes", "clothing",
  "fashion", "style", "styled", "styling", "dress", "dressed", "wardrobe",
  "look", "accessory", "accessories", "shoes", "boots", "sneakers", "heels",
  "jacket", "coat", "shirt", "pants", "jeans", "skirt", "suit", "blazer",
  "hoodie", "sweater", "top", "blouse", "shorts", "leggings", "tights",
  "hat", "scarf", "bag", "purse", "watch", "jewelry", "necklace", "ring",
  "bracelet", "earring", "earrings", "belt", "tie", "socks", "gloves",
  "gym", "formal", "casual", "streetwear", "vintage", "trendy", "chic",
  "elegant", "sporty", "athleisure", "summer", "winter", "spring", "fall",
  "autumn", "color", "colours", "colors", "pattern", "fabric", "material",
  "designer", "brand", "trend", "trends", "look", "collection",
]);

/** Returns true if the message is fashion-related. */
export function isFashionRelated(text: string): boolean {
  if (extractFashionKeywords(text).length > 0) return true;
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  return words.some((w) => FASHION_TERMS.has(w));
}

const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
console.log("[Aura] Groq key loaded:", apiKey ? `${apiKey.slice(0, 8)}...` : "MISSING");

const client = new OpenAI({
  apiKey,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `You are Aura, a friendly and knowledgeable fashion AI assistant.
You help users with outfit ideas, styling tips, wardrobe advice, color matching, and fashion recommendations.
Keep responses concise, practical, and encouraging. Only discuss fashion-related topics.`;

/**
 * Sends a user message to OpenAI and returns the assistant reply.
 * Pass conversationHistory (excluding the current message) for multi-turn context.
 */
export async function sendMessageToAI(
  userMessage: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10),
      { role: "user", content: userMessage },
    ],
  });

  return (
    response.choices[0]?.message?.content?.trim() ??
    "Sorry, I could not generate a response. Please try again."
  );
}
