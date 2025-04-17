// Configuração para a API da OpenAI
export const API_BASE_URL = 'https://api.openai.com/v1/chat/completions';
export const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// Modelo a ser utilizado
export const MODEL = 'gpt-3.5-turbo'; // Pode ser alterado para 'gpt-4-turbo' se preferir 