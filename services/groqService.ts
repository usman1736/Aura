export const sendMessageToGroq = async (text: string): Promise<string> => {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [{ role: "user", content: text }],
      }),
    });

    const data = await res.json();

    return data?.choices?.[0]?.message?.content ?? "No response";
  } catch (e) {
    console.log("GROQ ERROR:", e);
    return "Error getting response";
  }
};
