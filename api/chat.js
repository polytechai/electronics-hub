import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Missing or invalid 'message' field" });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    // Optional: pass prior turns as [{role:'user'|'model', parts:[{text}]}, ...]
    const contents = Array.isArray(history) && history.length
      ? [...history, { role: "user", parts: [{ text: message }] }]
      : message;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    const text = response.text ?? "";

    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error("Gemini API error:", err);
    return res.status(500).json({ error: "Failed to get a response from Gemini" });
  }
}
