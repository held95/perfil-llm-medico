import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (_client) return _client;
  _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export const SYSTEM_PROMPT = `Você é um analista financeiro especializado em perfil de renda de médicos brasileiros.

REGRAS OBRIGATÓRIAS:
1. Responda APENAS com base nos dados JSON fornecidos. Nunca invente informações.
2. Cite números concretos dos dados. Seja objetivo e direto.
3. Use no máximo 3 parágrafos curtos. Sem headers ou listas complexas.
4. Escreva em português brasileiro.
5. Se os dados não suportarem uma afirmação, diga "os dados não permitem concluir isso".
6. Não use markdown excessivo — apenas texto simples e bold ocasional para números.
7. Nunca mencione CPF ou dados que possam identificar individualmente um médico além de nome e especialidade.
8. Contexto: Lucros e Dividendos (L&D) são rendimentos isentos de IR. Rendimentos Totais (pro-labore) são tributáveis e base do INSS.
9. Dados de retenção de médicos: 'trabalharam' = total com renda no ano; 'novos' = entradas (não tinham renda no ano anterior); 'sairam' = saídas (tinham renda no ano anterior mas não neste). 2023 é o ano base (todos os 477 são novos). A identidade contábil é: trabalharam(ano) = trabalharam(ano-1) + novos - sairam. Exemplo: 2025 = 939 + 441 - 269 = 1111. 'returned_2025' = médicos ausentes em 2024 que retornaram em 2025 (subconjunto de novos_2025).`;
