import 'server-only';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
// Fast, low-cost model verified working on Google Developer v1beta API with free tier: gemini-2.5-flash
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const timeoutMs = parseInt(process.env.GEMINI_TIMEOUT_MS || '20000', 10);

let client: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!apiKey || apiKey.trim().length === 0) return null;
  if (!client) {
    client = new GoogleGenAI({ apiKey: apiKey.trim() });
  }
  return client;
}

export function isGeminiConfigured(): boolean {
  return Boolean(apiKey && apiKey.trim().length > 0);
}

export interface GenerateJsonOptions {
  systemInstruction: string;
  contents: string;
  responseJsonSchema?: Record<string, unknown>;
  maxOutputTokens?: number;
  temperature?: number;
  thinkingBudget?: number;
}

export async function generateJson<T>(options: GenerateJsonOptions): Promise<{ data: T; model: string }> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const {
    systemInstruction,
    contents,
    responseJsonSchema,
    maxOutputTokens = 4096,
    temperature = 0.3,
    thinkingBudget = 0,
  } = options;

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < 2) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          ...(responseJsonSchema ? { responseSchema: responseJsonSchema } : {}),
          temperature,
          maxOutputTokens,
          thinkingConfig: {
            thinkingBudget,
          },
        },
      });

      clearTimeout(timer);

      const text = response.text;
      if (!text) {
        throw new Error('Empty response received from Gemini model');
      }

      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
      }

      const parsed = JSON.parse(cleanText) as T;
      return { data: parsed, model: modelName };
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;
      if (err.name === 'AbortError') {
        throw new Error(`Gemini request timed out after ${timeoutMs}ms`);
      }
      // If parsing failed or network blip, retry once
    }
  }

  throw lastError || new Error('Failed to generate response after retries');
}

export interface GenerateTextOptions {
  systemInstruction?: string;
  contents: string | Array<{ role: string; parts: Array<{ text: string }> }>;
  maxOutputTokens?: number;
  temperature?: number;
  thinkingBudget?: number;
}

export async function generateText(options: GenerateTextOptions): Promise<{ text: string; model: string }> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const {
    systemInstruction,
    contents,
    maxOutputTokens = 2500,
    temperature = 0.5,
    thinkingBudget = 0,
  } = options;

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < 2) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          ...(systemInstruction ? { systemInstruction } : {}),
          temperature,
          maxOutputTokens,
          thinkingConfig: {
            thinkingBudget,
          },
        },
      });

      clearTimeout(timer);

      const text = response.text;
      if (!text) {
        throw new Error('Empty response received from Gemini model');
      }

      return { text: text.trim(), model: modelName };
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;
      if (err.name === 'AbortError') {
        throw new Error(`Gemini request timed out after ${timeoutMs}ms`);
      }
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini');
}
