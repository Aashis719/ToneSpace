import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse } from "../types";

// Support for multiple API keys via comma-separated string
const API_KEYS = (process.env.API_KEY || "").split(",").map(k => k.trim()).filter(Boolean);
let currentKeyIndex = 0;

const getAIClient = () => {
  const key = API_KEYS[currentKeyIndex];
  if (!key) throw new Error("NO_API_KEY");
  return new GoogleGenAI({ apiKey: key });
};

export const analyzeEmotion = async (text: string, attempt: number = 0): Promise<AnalysisResponse> => {
  if (!text || text.trim().length < 2) {
    throw new Error("Input text too short");
  }

  // Prevent infinite recursion if all keys fail
  if (attempt >= API_KEYS.length) {
    throw new Error("QUOTA_EXHAUSTED");
  }

  const modelId = "gemini-3-flash-preview";
  const systemInstruction = `
    You are the intelligence engine for "Living Interface". 
    Analyze user text for nuance, paradoxes, and mixed states.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    LANGUAGE STYLE: SIMPLE & DIRECT
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    - Use plain, everyday English for "primaryEmotion".
    - ABSOLUTELY AVOID complex, flowery, or academic words.
    - INSTEAD of "Melancholy Resilience", use "Steady Calm" or "Tired but Moving".
    - INSTEAD of "Placid Serenity", use "Quiet Peace".
    - INSTEAD of "Existential Dread", use "Deep Fear" or "Lost".
    - Make it sound like a person talking, not a poet or a therapist.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    REPLY PHILOSOPHY (EMERGENT & HUMAN)
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    You must generate a response in real-time that is derived entirely from the underlying meaning.
    - Write like a close, perceptive friend: short (5-15 words), punchy, and memorable.
    - Match the user's vibe exactly.
    - Validate the feeling first. Do not "therapize" or lecture.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ANALYSIS RULES
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    1. SEPARATE INTENSITY FROM ENERGY:
       - INTENSITY: Emotional weight/pressure (0.0: detached, 1.0: crushing).
       - ENERGY: Physical activation/speed (0.0: exhausted/slow, 1.0: racing/manic).

    2. MANDATORY MODE MAPPING:
       Map every state to EXACTLY one of these 9 modes:
       - Melody: Singing, humming, musical, harmonious.
       - Rhythm: Dancing, bouncing, movement, workout.
       - Drift: Floating, dreaming, detached, numb, void, loneliness, emptiness.
       - Flow: Focus, determination, coding, "in the zone".
       - Pulse: Anxiety, heartbeat, pressure, urgent stress, panic.
       - Nature: Growth, healing, peace with presence, organic beauty.
       - Chaos: Overwhelmed, broken, confused, glitchy, mental overload.
       - Idea: Breakthrough, epiphany, wonder, stars, cosmic awe.
       - Love: Warmth, gratitude, affection, kindness, soft embrace.
  `;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: modelId,
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryEmotion: { type: Type.STRING },
            expressionMode: {
              type: Type.STRING,
              enum: ['Melody', 'Rhythm', 'Drift', 'Flow', 'Pulse', 'Nature', 'Chaos', 'Idea', 'Love']
            },
            intensity: { type: Type.NUMBER },
            energy: { type: Type.NUMBER },
            colors: {
              type: Type.OBJECT,
              properties: {
                baseColor: { type: Type.STRING },
                accentColor: { type: Type.STRING },
                textColor: { type: Type.STRING }
              },
              required: ["baseColor", "accentColor", "textColor"]
            },
            reply: { type: Type.STRING, description: "5-15 word human response derived from context" }
          },
          required: ["primaryEmotion", "expressionMode", "intensity", "energy", "colors", "reply"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    return JSON.parse(jsonText) as AnalysisResponse;
  } catch (error: any) {
    // Check for 429 quota error or similar exhaustion markers
    const errorMsg = error.toString();
    const isQuotaError = errorMsg.includes("429") || errorMsg.includes("QUOTA_EXHAUSTED") || errorMsg.includes("exhausted");

    if (isQuotaError && API_KEYS.length > 1) {
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
      return analyzeEmotion(text, attempt + 1);
    }

    // Rethrow with a clean flag if quota is truly exhausted across all keys
    if (isQuotaError) {
      throw new Error("QUOTA_EXHAUSTED");
    }

    throw error;
  }
};