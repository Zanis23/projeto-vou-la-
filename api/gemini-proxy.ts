import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute per user

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  userLimit.count++;
  return true;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from environment (server-side only)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Extract user ID from authorization header (Supabase JWT)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - Missing token' });
    }

    const token = authHeader.substring(7);
    
    // TODO: Verify Supabase JWT token here
    // For now, using a simple user ID extraction (MUST be improved in production)
    const userId = token.substring(0, 20); // Placeholder - use proper JWT verification

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      });
    }

    // Extract request parameters
    const { action, params } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Missing action parameter' });
    }

    // Initialize Gemini client
    const ai = new GoogleGenAI({ apiKey });

    let response;

    // Handle different actions
    switch (action) {
      case 'getRecommendation': {
        const { userQuery } = params;
        if (!userQuery) {
          return res.status(400).json({ error: 'Missing userQuery parameter' });
        }

        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userQuery,
          config: {
            tools: [{ googleSearch: {} }, { googleMaps: {} }],
            systemInstruction: "Você é um Concierge de balada jovem e descolado no Brasil. Use gírias atuais."
          }
        });

        response = {
          text: result.text || "Não achei nada agora, bora pro próximo!",
          groundingMetadata: result.candidates?.[0]?.groundingMetadata
        };
        break;
      }

      case 'getBusinessInsights': {
        const { placeName, stats } = params;
        if (!placeName || !stats) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }

        const result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Gere um insight estratégico curto (30 palavras) para o dono do ${placeName}. Dados: ${JSON.stringify(stats)}. Foco em aumentar lucro e vibe.`,
        });

        response = {
          text: result.text || "Continue o bom trabalho!"
        };
        break;
      }

      case 'generateIcebreaker': {
        const { targetName, placeName, targetTags } = params;
        if (!targetName || !placeName || !targetTags) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }

        const result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Gere um quebra-gelo curto (max 15 palavras) para eu mandar para ${targetName} no ${placeName}. Gosta de: ${targetTags.join(', ')}. Seja engraçado, ousado mas respeitoso. Use gírias de balada brasileira.`,
        });

        response = {
          text: result.text?.replace(/"/g, '') || "Bora dividir um drink?"
        };
        break;
      }

      case 'generateAIImage': {
        const { prompt, size = '1K' } = params;
        if (!prompt) {
          return res.status(400).json({ error: 'Missing prompt parameter' });
        }

        const result = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: { parts: [{ text: prompt }] },
          config: { imageConfig: { imageSize: size, aspectRatio: "1:1" } },
        });

        for (const part of result.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            response = {
              image: `data:image/png;base64,${part.inlineData.data}`
            };
            break;
          }
        }

        if (!response) {
          response = { image: null };
        }
        break;
      }

      case 'editAIImage': {
        const { base64Image, prompt } = params;
        if (!base64Image || !prompt) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }

        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
              { text: prompt },
            ],
          },
        });

        for (const part of result.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            response = {
              image: `data:image/png;base64,${part.inlineData.data}`
            };
            break;
          }
        }

        if (!response) {
          response = { image: null };
        }
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    // Log successful request (for monitoring)
    console.log(`Gemini API request: ${action} by user ${userId}`);

    return res.status(200).json(response);

  } catch (error: any) {
    console.error('Gemini API error:', error);
    
    // Don't expose internal errors to client
    return res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message || 'Unknown error'
    });
  }
};
