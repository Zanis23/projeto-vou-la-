import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Permitir apenas método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    console.error('GEMINI_API_KEY not configured on server');
    return res.status(500).json({ error: 'AI service not configured' });
  }

  try {
    const { action, params } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    let prompt = '';

    // Mapear ações para prompts específicos ou lógica
    switch (action) {
      case 'getRecommendation':
        prompt = `Com base na busca do usuário: "${params.userQuery}", recomende os melhores lugares em Dourados-MS. Responda em formato JSON com um campo "text" contendo a recomendação amigável.`;
        break;
      case 'getBusinessInsights':
        prompt = `Analise os seguintes dados para o lugar "${params.placeName}": ${JSON.stringify(params.stats)}. Forneça insights estratégicos para o dono do negócio em formato JSON com campo "text".`;
        break;
      case 'generateIcebreaker':
        prompt = `Gere um "quebra-gelo" criativo para iniciar uma conversa com ${params.targetName} no lugar ${params.placeName}. Interesses: ${params.targetTags.join(', ')}. Responda em JSON com campo "text".`;
        break;
      default:
        prompt = params.prompt || '';
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Could not determine prompt from action/params' });
    }

    // Chamada para a API do Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: prompt }] }
        ],
        generationConfig: {
          response_mime_type: "application/json",
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(response.status).json(data);
    }

    // Extrair o conteúdo JSON da resposta do Gemini
    const aiResponseText = data.candidates[0].content.parts[0].text;
    const aiResponseJson = JSON.parse(aiResponseText);

    return res.status(200).json(aiResponseJson);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
