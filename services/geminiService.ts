
import { supabase } from './supabase';

export interface AIRecommendation {
  text: string;
  groundingMetadata?: any;
}

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Helper function to call Gemini proxy
async function callGeminiProxy(action: string, params: any): Promise<any> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch('/api/gemini-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ action, params })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to call Gemini API');
  }

  return response.json();
}

export const getGeminiRecommendation = async (userQuery: string): Promise<AIRecommendation | null> => {
  try {
    const result = await callGeminiProxy('getRecommendation', { userQuery });
    return {
      text: result.text,
      groundingMetadata: result.groundingMetadata
    };
  } catch (error) {
    console.error('Error getting recommendation:', error);
    return null;
  }
};

export const getBusinessInsights = async (placeName: string, stats: any): Promise<string> => {
  try {
    const result = await callGeminiProxy('getBusinessInsights', { placeName, stats });
    return result.text;
  } catch (error) {
    console.error('Error getting business insights:', error);
    return "Analise seu público para otimizar as vendas.";
  }
};

export const generateIcebreaker = async (targetName: string, placeName: string, targetTags: string[]): Promise<string> => {
  try {
    const result = await callGeminiProxy('generateIcebreaker', { targetName, placeName, targetTags });
    return result.text;
  } catch (error) {
    console.error('Error generating icebreaker:', error);
    return "Oie! Qual a boa de hoje?";
  }
};

export const generateAIImage = async (prompt: string, size: '1K' | '2K' | '4K' = '1K'): Promise<string | null> => {
  try {
    const result = await callGeminiProxy('generateAIImage', { prompt, size });
    return result.image;
  } catch (error) {
    console.error('Error generating AI image:', error);
    return null;
  }
};

export const editAIImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  try {
    const result = await callGeminiProxy('editAIImage', { base64Image, prompt });
    return result.image;
  } catch (error) {
    console.error('Error editing AI image:', error);
    return null;
  }
};
