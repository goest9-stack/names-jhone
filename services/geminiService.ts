import { GoogleGenAI } from "@google/genai";
import { Attachment } from "../types";

// Initialize Gemini Client
// IMPORTANT: process.env.API_KEY is automatically injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-3-flash-preview";

export const generateContentStream = async (
  prompt: string,
  attachments: Attachment[],
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    const parts: any[] = [];

    // Add attachments if any
    if (attachments && attachments.length > 0) {
      attachments.forEach((att) => {
        // Strip the data URL prefix if present (e.g., "data:image/png;base64,")
        const base64Data = att.data.includes("base64,")
          ? att.data.split("base64,")[1]
          : att.data;

        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: base64Data,
          },
        });
      });
    }

    // Add text prompt
    parts.push({ text: prompt });

    // Use generateContentStream for fast response
    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: {
        role: "user",
        parts: parts,
      },
      config: {
        systemInstruction: "You are AI Coporties, a sophisticated, high-end AI assistant designed for professional use. Your responses should be mature, concise, precise, and elegant. You excel at analysis, coding, and creative writing. Always maintain a helpful and professional tone.",
        temperature: 0.7,
      }
    });

    let fullText = "";

    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onChunk(fullText);
      }
    }

    return fullText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Helper to convert File object to Base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};