
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchVideoData(url: string): Promise<{ data: GeminiResponse; sources: any[] }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Find the exact video title and the complete, full transcription for this YouTube video: ${url}. 
      Use Google Search to locate the transcript if necessary. If the video is long, ensure you retrieve as much text as possible to provide a full transcription.
      Return the response in JSON format.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The full title of the YouTube video.",
            },
            fullTranscription: {
              type: Type.STRING,
              description: "The 100% full transcription text of the video.",
            },
          },
          required: ["title", "fullTranscription"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const json = JSON.parse(text) as GeminiResponse;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || '#'
    })) || [];

    return { data: json, sources };
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
}
