import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, SYSTEM_PROMPT } from "@/lib/anthropic";
import { getAnalytics } from "@/lib/data";
import { QUESTIONS } from "@/lib/questions";
import { Analytics, IncomeEvolution, RetentionProbability, RetentionDoctor } from "@/types";

function gain(lucros: number | null, rend: number | null): number {
  return (lucros ?? 0) + (rend ?? 0);
}

/**
 * Q12 — Probabilidade de retenção de médicos para 2026/2027.
 * Computado em runtime a partir de doctors_data (o CSV não está disponível).
 * Define coortes de médicos presentes em 2024 E 2025 acima de R$30 mil e R$50 mil
 * e projeta a permanência usando a taxa histórica de retenção ano-a-ano.
 */
function buildRetentionProbability(analytics: Analytics): RetentionProbability {
  const docs = analytics.doctors_data;

  // Taxa de retenção histórica: dos que tinham renda em (ano), fração que manteve em (ano+1).
  const present = (g: number) => g > 0;
  let kept2324 = 0,
    base23 = 0,
    kept2425 = 0,
    base24 = 0;
  for (const d of docs) {
    const g23 = gain(d.lucros_2023, d.rend_2023);
    const g24 = gain(d.lucros_2024, d.rend_2024);
    const g25 = gain(d.lucros_2025, d.rend_2025);
    if (present(g23)) {
      base23++;
      if (present(g24)) kept2324++;
    }
    if (present(g24)) {
      base24++;
      if (present(g25)) kept2425++;
    }
  }
  const r2324 = base23 > 0 ? kept2324 / base23 : 0;
  const r2425 = base24 > 0 ? kept2425 / base24 : 0;
  const r = (r2324 + r2425) / 2; // taxa média de retenção ano-a-ano

  // Coortes: presentes em 2024 E 2025 acima do limite (somando lucros + pro-labore).
  const cohort30: RetentionDoctor[] = [];
  let count30 = 0;
  let count50 = 0;
  for (const d of docs) {
    const g24 = gain(d.lucros_2024, d.rend_2024);
    const g25 = gain(d.lucros_2025, d.rend_2025);
    if (g24 > 30000 && g25 > 30000) {
      count30++;
      const isPrev = g24 > 50000 && g25 > 50000;
      if (isPrev) count50++;
      cohort30.push({
        nome: d.nome,
        especialidade: d.specialty,
        ganho_2024: Math.round(g24),
        ganho_2025: Math.round(g25),
        tag: isPrev ? "Pagador de Previdência" : "Acima de R$30 mil",
      });
    }
  }
  cohort30.sort((a, b) => b.ganho_2025 - a.ganho_2025);

  const pct = (x: number) => Math.round(x * 1000) / 10; // 1 casa decimal
  const buildCohort = (count: number, label: string, threshold: number) => ({
    threshold_label: label,
    threshold,
    count_2024_2025: count,
    expected_2026: Math.round(count * r),
    expected_2027: Math.round(count * r * r),
    prob_2026_pct: pct(r),
    prob_2027_pct: pct(r * r),
  });

  return {
    retention_rate_pct: pct(r),
    cohorts: [
      buildCohort(count30, ">R$30 mil", 30000),
      buildCohort(count50, ">R$50 mil (Pagador de Previdência)", 50000),
    ],
    doctors: cohort30.slice(0, 30),
    total_cohort_30k: count30,
    total_cohort_50k: count50,
  };
}

function buildDoctorEvolution(analytics: Analytics, doctorCrm: string): IncomeEvolution | null {
  const doctor = analytics.doctors_data.find((d) => d.crm === doctorCrm);
  if (!doctor) return null;
  return {
    "2023": {
      total_lucros: doctor.lucros_2023 ?? 0,
      total_rend: doctor.rend_2023 ?? 0,
      count: doctor.lucros_2023 || doctor.rend_2023 ? 1 : 0,
    },
    "2024": {
      total_lucros: doctor.lucros_2024 ?? 0,
      total_rend: doctor.rend_2024 ?? 0,
      count: doctor.lucros_2024 || doctor.rend_2024 ? 1 : 0,
    },
    "2025": {
      total_lucros: doctor.lucros_2025 ?? 0,
      total_rend: doctor.rend_2025 ?? 0,
      count: doctor.lucros_2025 || doctor.rend_2025 ? 1 : 0,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question_id, specialty_filter, doctor_crm } = body as {
      question_id: number;
      specialty_filter?: string;
      doctor_crm?: string;
    };

    if (!question_id || question_id < 1 || question_id > 12) {
      return NextResponse.json({ error: "question_id inválido (1–12)" }, { status: 400 });
    }

    const question = QUESTIONS.find((q) => q.id === question_id);
    if (!question) {
      return NextResponse.json({ error: "Pergunta não encontrada" }, { status: 404 });
    }

    const analytics = getAnalytics();
    const summaryContext = {
      total_doctors: analytics.summary.total_doctors,
      avg_lucros_2025: analytics.summary.avg_lucros_2025,
      doctors_with_income_2025: analytics.summary.doctors_with_income_2025,
      ...(question_id >= 9 && {
        forecast_note: "Previsões baseadas em regressão linear de 3 pontos (2023-2025). ICs de 95% são estatisticamente corretos mas amplos com apenas 3 observações.",
      }),
    };

    let dataSlice: unknown;
    let effectiveChartType = question.chartType;
    let questionText = question.text;

    if (question_id === 2 && doctor_crm) {
      const evolution = buildDoctorEvolution(analytics, doctor_crm);
      if (!evolution) {
        return NextResponse.json({ error: "Médico não encontrado" }, { status: 404 });
      }
      const doctor = analytics.doctors_list.find((d) => d.crm === doctor_crm);
      dataSlice = evolution;
      questionText = `${question.text} (filtrado: médico ${doctor?.nome ?? doctor_crm}, ${doctor?.specialty ?? ""})`;
    } else if (question_id === 2 && specialty_filter) {
      const evolution = analytics.income_evolution_by_specialty[specialty_filter];
      if (!evolution) {
        return NextResponse.json({ error: "Especialidade não encontrada" }, { status: 404 });
      }
      dataSlice = evolution;
      questionText = `${question.text} (filtrado: especialidade ${specialty_filter})`;
    } else if (question_id === 9) {
      dataSlice = analytics.forecasts.overall_forecast;
    } else if (question_id === 10) {
      dataSlice = analytics.forecasts.specialty_growth_ranking;
    } else if (question_id === 11 && specialty_filter) {
      const specForecast = analytics.forecasts.specialty_forecasts[specialty_filter];
      if (!specForecast) {
        return NextResponse.json(
          { error: "Especialidade não encontrada ou dados insuficientes para previsão" },
          { status: 404 }
        );
      }
      dataSlice = specForecast;
      questionText = `${question.text} (filtrado: especialidade ${specialty_filter})`;
    } else if (question_id === 11) {
      dataSlice = analytics.forecasts.specialty_growth_ranking;
      effectiveChartType = "specialty_growth_ranking";
    } else if (question_id === 12) {
      dataSlice = buildRetentionProbability(analytics);
      effectiveChartType = "retention_probability";
    } else {
      dataSlice = analytics[question.dataSliceKey as keyof Analytics];
    }

    const userMessage = `PERGUNTA: ${questionText}

CONTEXTO GERAL DA BASE:
${JSON.stringify(summaryContext, null, 2)}

DADOS RELEVANTES:
${JSON.stringify(dataSlice, null, 2)}`;

    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 450,
      temperature: 0.1,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const answer =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({
      answer,
      chart_type: effectiveChartType,
      chart_data: dataSlice,
      question_text: questionText,
    });
  } catch (err) {
    console.error("[/api/chat] error:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar a pergunta." },
      { status: 500 }
    );
  }
}
