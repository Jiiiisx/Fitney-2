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
  if (!text) return null;
  try {
    // 1. Try a direct parse first (cleanest case)
    try {
        return JSON.parse(text.trim());
    } catch (e) {
        // Continue to extraction logic
    }

    // 2. Remove Markdown code blocks and any surrounding whitespace
    let cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    
    // 3. Regex match for the first JSON object or array
    const jsonMatch = cleanText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (e) {
    console.error("JSON_PARSE_ERROR", e);
    return null;
  }
}
