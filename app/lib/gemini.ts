import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = (process.env.GOOGLE_AI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel(
  { 
    model: "gemini-3-flash-preview",
    generationConfig: {
      maxOutputTokens: 1500, 
      temperature: 0.1,
      responseMimeType: "application/json",
      // DEFINISI SKEMA FORMAL
      responseSchema: {
        type: "object",
        properties: {
          readinessScore: { type: "number" },
          signals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["sleep", "recovery", "nutrition"] },
                status: { type: "string", enum: ["optimal", "warning", "critical"] },
                msg: { type: "string" }
              }
            }
          },
          recommendations: { type: "array", items: { type: "string" } },
          topInsight: { type: "string" },
          contextualTips: {
            type: "object",
            properties: {
              nutrition: { type: "array", items: { type: "string" } },
              planner: { type: "array", items: { type: "string" } },
              community: { type: "array", items: { type: "string" } },
              actions: {
                type: "object",
                properties: {
                  add_workout: { type: "string" },
                  search_recipe: { type: "string" },
                  log_water: { type: "string" }
                }
              }
            }
          }
        },
        required: ["readinessScore", "signals", "recommendations", "topInsight", "contextualTips"]
      }
    }
  }, 
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
    const cleanText = text.trim();
    // In application/json mode with responseSchema, 
    // the text should be a perfect JSON string already.
    return JSON.parse(cleanText);
  } catch (e) {
    // Fallback just in case some legacy wrapper is still there
    try {
        const startIdx = text.indexOf('{');
        const endIdx = text.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
            return JSON.parse(text.substring(startIdx, endIdx + 1));
        }
    } catch (innerE) {
        console.error("CRITICAL_JSON_PARSE_ERROR", innerE, "Raw text:", text);
    }
    return null;
  }
}
