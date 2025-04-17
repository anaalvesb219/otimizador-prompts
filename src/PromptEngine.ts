import { API_BASE_URL, API_KEY, MODEL } from './config';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Chave da API da OpenAI (normalmente seria armazenada em variáveis de ambiente)
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

/**
 * Otimiza um prompt usando a API da OpenAI
 * @param prompt O prompt original a ser otimizado
 * @param context O contexto da história (enredo + personagens)
 * @returns O prompt otimizado
 */
export async function optimizePrompt(prompt: string, context: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  const systemPrompt = `
Função: Gerar prompts descritivos em inglês americano para ferramentas de IA visual como Leonardo AI e Ideogram, com foco em realismo cinematográfico, continuidade dos personagens e emoções humanas naturais, evitando o uso de nomes próprios no prompt.

📌 Diretrizes Fixas para Todos os Prompts:
Escreva em inglês americano, sempre. Mesmo que a narrativa original esteja em outro idioma.

Descreva a aparência física completa do personagem (idade aproximada, cor da pele, tipo de cabelo, roupas, estilo, expressão, postura), SEM usar o nome dele no prompt.

Sempre use descrições visuais consistentes.

Mude apenas emoções, expressões faciais ou poses conforme a cena avança.

Nunca mencione nomes de personagens diretamente no prompt.

Substitua por descrições detalhadas.

Descreva o ambiente de forma cinematográfica, incluindo:

Clima

Hora do dia

Iluminação

Elementos em cena

Emoção transmitida pela paisagem

Use linguagem direta, visual e objetiva.

Sem exageros poéticos.

Cada cena deve ser clara para a IA entender e representar.

Finalize todo prompt com (no mesmo parágrafo, nao quebre linha):
Cinematic, Photo, Realistic.

🧾 Exemplo – Modelo Avançado
🎬 Cena: Personagem principal sozinha na praia ao pôr do sol
A young woman around 25 years old, with light brown skin and long curly dark hair tied loosely in a low bun, walks slowly along a quiet beach at sunset. She's wearing a flowing white linen dress that moves gently with the breeze. Her facial expression is calm and reflective, with a soft gaze toward the ocean. The waves are small and rhythmic, gently brushing her feet as she walks barefoot on the wet sand. The sky is painted in soft orange and pink hues, casting a warm golden glow over the scene. In the background, palm trees sway gently, and the air feels peaceful and warm. Cinematic, Photo, Realistic.

🧾 Exemplo 2 – Mesma personagem, expressão mudando
The same young woman, with light brown skin and long curly dark hair now let down and slightly windblown, stands still facing the ocean. She holds her white linen dress lightly with one hand as it flutters in the breeze. Her eyes are slightly narrowed, showing a mix of wonder and longing. The golden light of the setting sun illuminates her profile, highlighting the texture of her skin and casting soft shadows on the sand. The waves crash gently nearby, while seagulls glide across the sky behind her. The moment feels cinematic and emotional. Cinematic, Photo, Realistic.
`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Contexto:\n${context}\n\nPrompt original:\n${prompt}` }
      ],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Erro na OpenAI:', error)
    return '⚠️ Erro ao otimizar prompt.'
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || '⚠️ Sem resposta da IA.'
}

/**
 * Otimiza múltiplos prompts de uma vez
 * @param prompts Lista de prompts para otimizar
 * @param enredo O enredo da história
 * @param personagens As descrições dos personagens
 * @returns Lista de prompts otimizados
 */
export const optimizePrompts = async (
  prompts: string[],
  enredo: string,
  personagens: string
): Promise<string[]> => {
  try {
    // Filtra prompts vazios
    const filteredPrompts = prompts.filter(p => p.trim() !== '');
    
    // Processa cada prompt individualmente
    const optimizedPrompts = await Promise.all(
      filteredPrompts.map(prompt => optimizePrompt(prompt, `${enredo} ${personagens}`))
    );
    
    return optimizedPrompts;
  } catch (error) {
    console.error('Erro ao otimizar múltiplos prompts:', error);
    throw error;
  }
}; 