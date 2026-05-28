import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, SYSTEM_PROMPT } from "@/lib/anthropic";
import { getAnalytics } from "@/lib/data";
import { QUESTIONS } from "@/lib/questions";
import { Analytics, Forecasts, IncomeEvolution, SpecialtyForecastEntry, SpecialtyGrowthRanking, OverallForecast } from "@/types";

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

    if (!question_id || question_id < 1 || question_id > 11) {
      return NextResponse.json({ error: "question_id inválido (1–11)" }, { status: 400 });
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
