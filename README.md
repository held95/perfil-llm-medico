# Perfil Médico Analytics

Chatbot de análise financeira para perfil de renda de médicos brasileiros (2023–2025). Powered by Claude AI (Anthropic).

## Funcionalidades

- 7 perguntas analíticas pré-definidas sobre dados financeiros médicos
- Gráficos interativos (Recharts) para cada resposta
- Análise com Claude Haiku: zero alucinações — responde apenas com dados reais
- Privacidade: CPF nunca é exposto em nenhuma saída do sistema

## Stack

| Componente | Tecnologia |
|---|---|
| Frontend | Next.js 16.2.4 App Router + TypeScript + Tailwind CSS v4 |
| Charts | Recharts 3 |
| LLM | Anthropic Claude (`claude-haiku-4-5-20251001`) |
| Data processing | Python 3 (sem dependências externas) |
| Deploy | Vercel |

## Configuração local

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/perfil-medico-llm
cd perfil-medico-llm

# 2. Instale as dependências
npm install

# 3. Configure a chave de API
cp .env.example .env.local
# Edite .env.local e substitua: ANTHROPIC_API_KEY=sk-ant-...

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse http://localhost:3000

## Deploy na Vercel

1. Suba o repositório no GitHub
2. Importe o projeto em [vercel.com](https://vercel.com)
3. Adicione a variável de ambiente `ANTHROPIC_API_KEY` no painel da Vercel
4. Deploy automático via push no branch `main`

## As 7 Perguntas

| # | Pergunta | Gráfico |
|---|---|---|
| 1 | Quais especialidades têm os maiores lucros e dividendos médios em 2025? | Barras horizontal |
| 2 | Como evoluíram os rendimentos dos médicos de 2023 a 2025? | Linhas |
| 3 | Qual a distribuição etária dos médicos nesta base? | Barras |
| 4 | Quais médicos têm os maiores lucros e dividendos em 2025? | Barras horizontal |
| 5 | Qual a proporção entre Lucros/Dividendos e Pro-labore? | Pizza |
| 6 | Qual especialidade tem maior contribuição previdenciária média? | Barras |
| 7 | Como os médicos se distribuem por faixa de rendimento em 2025? | Barras |

## Regenerar analytics.json

O arquivo `public/analytics.json` está incluído no repositório. Para regenerar a partir do CSV:

```bash
# Coloque o CSV na pasta raiz do projeto (um nível acima de perfil-medico-llm/)
# Arquivo esperado: ../TESTE PERFIL 2023 A 2025.csv

cd data
python3 process_csv.py
```

Saída esperada:
```
Reading: .../TESTE PERFIL 2023 A 2025.csv
Loaded 1498 valid records
Written: .../public/analytics.json
Total doctors: 1498
Avg lucros 2025: R$65,387.02
```

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `ANTHROPIC_API_KEY` | Sim | Chave da API Anthropic — obtenha em console.anthropic.com |

## Arquitetura

```
CSV (1498 médicos, 2023-2025)
        ↓ data/process_csv.py
public/analytics.json (pré-computado)
        ↓ lib/data.ts (singleton loader)
app/api/chat/route.ts (POST /api/chat)
        ↓ injeta slice JSON como contexto
Claude Haiku (max_tokens=450, temperature=0.1)
        ↓
{ answer, chart_type, chart_data }
        ↓
MessageBubble.tsx → Recharts chart
```

## Privacidade

- CPF nunca é lido pelo sistema JavaScript/TypeScript
- Nomes de médicos aparecem apenas no top-10 de maiores rendimentos
- O system prompt instrui Claude a nunca reproduzir dados pessoais individuais
- Dados agregados por especialidade não permitem identificação individual

## Troubleshooting

**"Erro interno ao processar a pergunta"**
→ Verifique se `ANTHROPIC_API_KEY` está configurada em `.env.local`

**Página não carrega**
→ Verifique se `public/analytics.json` existe. Se não, rode `python3 data/process_csv.py`

**Gráfico não renderiza**
→ Os charts usam `dynamic()` com `ssr: false` — são carregados client-side. Aguarde o carregamento completo.

**`npm run build` falha**
→ Execute `npx tsc --noEmit` para ver erros TypeScript detalhados
