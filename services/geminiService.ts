
import { GoogleGenAI } from "@google/genai";

export interface AIRecommendation {
  text: string;
  groundingMetadata?: any;
}

export const getGeminiRecommendation = async (userQuery: string): Promise<AIRecommendation | null> => {
  // Always initialize GoogleGenAI with a named parameter for the API Key as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Maps grounding is only supported in Gemini 2.5 series models.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        systemInstruction: "Você é um Concierge de balada jovem e descolado no Brasil. Use gírias atuais."
      }
    });
    return {
      text: response.text || "Não achei nada agora, bora pro próximo!",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  } catch (error) {
    return null;
  }
};

export const getBusinessInsights = async (placeName: string, stats: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um insight estratégico curto (30 palavras) para o dono do ${placeName}. Dados: ${JSON.stringify(stats)}. Foco em aumentar lucro e vibe.`,
    });
    return response.text || "Continue o bom trabalho!";
  } catch (e) {
    return "Analise seu público para otimizar as vendas.";
  }
};

export const generateIcebreaker = async (targetName: string, placeName: string, targetTags: string[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um quebra-gelo curto (max 15 palavras) para eu mandar para ${targetName} no ${placeName}. Gosta de: ${targetTags.join(', ')}. Seja engraçado, ousado mas respeitoso. Use gírias de balada brasileira.`,
    });
    return response.text?.replace(/"/g, '') || "Bora dividir um drink?";
  } catch (e) {
    return "Oie! Qual a boa de hoje?";
  }
};

export const generateAIImage = async (prompt: string, size: '1K' | '2K' | '4K' = '1K'): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { imageSize: size, aspectRatio: "1:1" } },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      // Find the image part and return base64
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
};

export const editAIImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
          { text: prompt },
        ],
      },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
};
