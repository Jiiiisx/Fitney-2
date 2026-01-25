import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = (process.env.GOOGLE_AI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Menggunakan model GENERASI KETIGA (Terbaru per Januari 2026)
 * Sesuai changelog: gemini-3-flash-preview
 */
export const model = genAI.getGenerativeModel(
  { model: "gemini-3-flash-preview" }, 
  { apiVersion: "v1beta" }
);

export async function generateHealthAdvice(prompt: string, context: string = "") {
  if (!apiKey) return "API Key is missing.";

  try {
    const result = await model.generateContent(prompt + "\nContext: " + context);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("GEMINI_CORE_ERROR:", error);
    
    if (error.message?.includes("429")) {
        return "AI Brain is currently at capacity (Gemini 3 Rate Limit). Please wait 1-2 minutes.";
    }
    
    return `Neural Link Error: ${error.message}.`;
  }
}