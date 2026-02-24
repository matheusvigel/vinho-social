const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string

// Modelos Gemini para tentar em ordem
const GEMINI_MODELS = [
  'gemini-1.5-pro',
  'gemini-1.0-pro-vision-latest',
  'gemini-pro-vision',
]

export interface WineLabelData {
  name: string | null
  producer: string | null
  country: string | null
  region: string | null
  vintage: number | null
  grape_varieties: string[]
  wine_type: 'tinto' | 'branco' | 'rose' | 'espumante' | 'sobremesa' | 'fortificado' | null
  alcohol_pct: number | null
  description: string | null
}

export async function scanWineLabel(imageBase64: string, mimeType: string): Promise<WineLabelData> {
  const prompt = `Você é um especialista em vinhos. Analise a imagem deste rótulo de vinho e extraia as informações abaixo em formato JSON.

Retorne APENAS o JSON, sem nenhum texto adicional, sem markdown, sem \`\`\`.

{
  "name": "nome completo do vinho",
  "producer": "nome da vinícola/produtor",
  "country": "país de origem em português (ex: Brasil, França, Itália, Portugal, Argentina, Chile, Espanha)",
  "region": "região vitivinícola",
  "vintage": ano como número inteiro ou null se não encontrado,
  "grape_varieties": ["lista", "de", "uvas"],
  "wine_type": "tinto" | "branco" | "rose" | "espumante" | "sobremesa" | "fortificado",
  "alcohol_pct": teor alcoólico como número decimal ou null,
  "description": "breve descrição do vinho baseada no rótulo"
}

Se alguma informação não estiver visível no rótulo, use null para strings/números e [] para arrays.`

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    }),
  })

  if (response.ok) {
    const data = await response.json()
    const text = data.content?.[0]?.text
    if (text) {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      return JSON.parse(cleaned) as WineLabelData
    }
  }

  console.warn('Anthropic falhou, tentando Gemini...')

  // Fallback: tentar modelos Gemini disponíveis
  for (const model of GEMINI_MODELS) {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
      }),
    })

    if (geminiResponse.ok) {
      const geminiData = await geminiResponse.json()
      const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
      if (geminiText) {
        const cleaned = geminiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        return JSON.parse(cleaned) as WineLabelData
      }
    }
    console.warn(`Modelo ${model} falhou, tentando próximo...`)
  }

  throw new Error('Nenhuma API disponível. Verifique seus créditos.')
}
