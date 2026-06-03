import { QuestionConfig } from "@/types";

export const QUESTIONS: QuestionConfig[] = [
  {
    id: 1,
    text: "Quais especialidades têm os maiores lucros e dividendos médios em 2025?",
    chartType: "specialty_income",
    dataSliceKey: "specialty_income",
    description: "Top 10 especialidades por média de L&D em 2025 (mín. 3 médicos)",
  },
  {
    id: 2,
    text: "Como evoluíram os rendimentos dos médicos de 2023 a 2025?",
    chartType: "income_evolution",
    dataSliceKey: "income_evolution",
    description: "Evolução do total de Lucros/Dividendos e Pro-labore por ano",
  },
  {
    id: 3,
    text: "Qual a distribuição etária dos médicos nesta base?",
    chartType: "age_distribution",
    dataSliceKey: "age_distribution",
    description: "Distribuição por faixa etária: 20-29, 30-39, 40-49, 50-59, 60+",
  },
  {
    id: 4,
    text: "Quais médicos têm os maiores lucros e dividendos em 2025?",
    chartType: "top_earners",
    dataSliceKey: "top_earners",
    description: "Top 10 médicos por L&D em 2025",
  },
  {
    id: 5,
    text: "Qual a proporção entre Lucros/Dividendos e Rendimentos de Pro-labore?",
    chartType: "dividends_vs_salary",
    dataSliceKey: "dividends_vs_salary",
    description: "Participação percentual de L&D vs pro-labore no rendimento total 2025",
  },
  {
    id: 6,
    text: "Qual especialidade tem maior contribuição previdenciária média?",
    chartType: "contribution_by_specialty",
    dataSliceKey: "contribution_by_specialty",
    description: "Média de CONTRIB. PREVID. OFICIAL por especialidade em 2025",
  },
  {
    id: 7,
    text: "Como os médicos se distribuem por faixa de rendimento em 2025?",
    chartType: "income_brackets",
    dataSliceKey: "income_brackets",
    description: "Contagem de médicos por faixa de L&D em 2025",
  },
  {
    id: 8,
    text: "Quantos médicos trabalharam em 2023, 2024 e 2025 e quantos saíram nesses anos, e quantos médicos saíram em 2024 e voltaram a trabalhar em 2025?",
    chartType: "doctor_retention",
    dataSliceKey: "doctor_retention",
    description: "Retenção de médicos por ano: trabalharam, saíram e novos ingressantes",
  },
  {
    id: 9,
    text: "Qual a previsão de rendimentos para 2026, 2027 e 2028?",
    chartType: "overall_forecast",
    dataSliceKey: "forecasts",
    description: "Projeção de L&D e Pro-labore até 2028 com intervalo de confiança de 95%",
  },
  {
    id: 10,
    text: "Quais especialidades têm maior tendência de crescimento?",
    chartType: "specialty_growth_ranking",
    dataSliceKey: "forecasts",
    description: "Ranking das especialidades com maior e menor taxa de crescimento de L&D (2023–2025)",
  },
  {
    id: 11,
    text: "Qual é a previsão de rendimentos para uma especialidade específica?",
    chartType: "specialty_forecast",
    dataSliceKey: "forecasts",
    description: "Projeção de L&D e Pro-labore de uma especialidade com IC 95% até 2028",
  },
  {
    id: 12,
    text: "Qual a probabilidade de fechar com a quantidade de médicos visando 2026 e 2027?",
    chartType: "retention_probability",
    dataSliceKey: "doctor_retention",
    description:
      "Médicos presentes em 2024 e 2025 acima de R$30 mil e R$50 mil e a probabilidade de permanecerem em 2026/2027 (>R$50 mil = Pagador de Previdência)",
  },
];
