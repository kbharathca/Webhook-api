import { GoogleGenAI } from "@google/genai";
import { AISummary, WebhookRequest } from "../types";

// Initialize Gemini Client
// NOTE: In a real production app, you would proxy this through a backend.
// For this demo, we assume the environment variable is available or client-provided logic could be added.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const analyzePayload = async (request: WebhookRequest): Promise<string> => {
  if (!apiKey) return "API Key not configured in environment.";

  try {
    const prompt = `
      You are an expert backend engineer debugger. Analyze this webhook payload.
      
      Method: ${request.method}
      Content-Type: ${request.contentType}
      Body: ${JSON.stringify(request.body, null, 2)}
      
      Provide a concise 3-bullet point summary of what this event represents.
      If it looks like an error (e.g. payment_failed), highlight the cause.
      Keep it professional and technical.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to analyze payload. Ensure API key is valid.";
  }
};

export const generateSamplePayload = async (type: 'Stripe' | 'GitHub' | 'Slack' | 'Custom'): Promise<any> => {
  if (!apiKey) {
    // Fallback if no API key
    return { error: "No API Key", message: "Please configure API_KEY to use AI generation" };
  }

  try {
    const prompt = `Generate a realistic, valid JSON webhook payload for a ${type} event. 
    If Stripe, maybe a 'payment_intent.succeeded' or 'invoice.payment_failed'.
    If GitHub, maybe a 'push' or 'pull_request' event.
    If Slack, a 'message' event.
    Return ONLY the JSON object, no markdown code blocks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return { error: "Failed to generate", detail: "Check console" };
  }
};