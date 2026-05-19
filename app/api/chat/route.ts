import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, SYSTEM_PROMPT } from "@/lib/anthropic";
import { getAnalytics } from "@/lib/data";
import { QUESTIONS } from "@/lib/questions";
import { Analytics } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { question_id } = await req.json();

    if (!question_id || question_id < 1 || question_id > 7) {
      return NextResponse.json({ error: "question_id inválido (1–7)" }, { status: 400 });
    }

    const question = QUESTIONS.find((q) => q.id === question_id);
    if (!question) {
      return NextResponse.json({ error: "Pergunta não encontrada" }, { status: 404 });
    }

    const analytics = getAnalytics();
    const dataSlice = analytics[question.dataSliceKey as keyof Analytics];
    const summaryContext = {
      total_doctors: analytics.summary.total_doctors,
      avg_lucros_2025: analytics.summary.avg_lucros_2025,
      doctors_with_income_2025: analytics.summary.doctors_with_income_2025,
    };

    const userMessage = `PERGUNTA: ${question.text}

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
      chart_type: question.chartType,
      chart_data: dataSlice,
      question_text: question.text,
    });
  } catch (err) {
    console.error("[/api/chat] error:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar a pergunta." },
      { status: 500 }
    );
  }
}
