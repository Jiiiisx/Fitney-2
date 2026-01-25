import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = (process.env.GOOGLE_AI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel(
  { model: "gemini-3-flash-preview" }, 
  { apiVersion: "v1beta" }
);

/**
 * Enhanced AI call with automatic retry logic
 */
export async function safeGenerateContent(prompt: string, retries = 2): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    // If overloaded (503) or rate limited (429), try again after a short delay
    if ((error.message?.includes("503") || error.message?.includes("429")) && retries > 0) {
      console.log(`AI busy, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      return safeGenerateContent(prompt, retries - 1);
    }
    throw error;
  }
}

/**
 * Robust JSON extractor from AI text
 * Handles Markdown code blocks (```json ... ```) and raw text
 */
export function extractJSON(text: string) {
  try {
    // 1. Remove Markdown code blocks if present
    let cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    
    // 2. If cleanText is still empty or weird, try regex match for { ... }
    const jsonMatch = cleanText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
        cleanText = jsonMatch[0];
    }

    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON_PARSE_ERROR", e);
    return null;
  }
}
