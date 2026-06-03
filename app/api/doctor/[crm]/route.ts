import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";
import { getAnalytics } from "@/lib/data";
import { DoctorAnalytics, DoctorKpis, DoctorRecord, DoctorYearPoint } from "@/types";

function gain(lucros: number | null, rend: number | null): number {
  return (lucros ?? 0) + (rend ?? 0);
}

/** Regressão linear simples (OLS) sobre os pontos disponíveis do médico. */
function projectLinear(points: { x: number; y: number }[], targetYear: number): number | null {
  if (points.length < 2) return null;
  const n = points.length;
  const sx = points.reduce((s, p) => s + p.x, 0);
  const sy = points.reduce((s, p) => s + p.y, 0);
  const sxx = points.reduce((s, p) => s + p.x * p.x, 0);
  const sxy = points.reduce((s, p) => s + p.x * p.y, 0);
  const denom = n * sxx - sx * sx;
  if (denom === 0) return null;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  const v = slope * targetYear + intercept;
  return Math.max(0, Math.round(v));
}

function buildKpis(doctor: DoctorRecord, allDocs: DoctorRecord[]): { kpis: DoctorKpis; series: DoctorYearPoint[] } {
  const series: DoctorYearPoint[] = [
    {
      year: "2023",
      lucros: doctor.lucros_2023 ?? 0,
      rend: doctor.rend_2023 ?? 0,
      total: gain(doctor.lucros_2023, doctor.rend_2023),
    },
    {
      year: "2024",
      lucros: doctor.lucros_2024 ?? 0,
      rend: doctor.rend_2024 ?? 0,
      total: gain(doctor.lucros_2024, doctor.rend_2024),
    },
    {
      year: "2025",
      lucros: doctor.lucros_2025 ?? 0,
      rend: doctor.rend_2025 ?? 0,
      total: gain(doctor.lucros_2025, doctor.rend_2025),
    },
  ];

  const total_2023 = series[0].total;
  const total_2024 = series[1].total;
  const total_2025 = series[2].total;

  const growth_pct_2023_2025 =
    total_2023 > 0 ? Math.round(((total_2025 - total_2023) / total_2023) * 1000) / 10 : null;

  const lucros_2025 = doctor.lucros_2025 ?? 0;
  const rend_2025 = doctor.rend_2025 ?? 0;
  const lucros_pct_2025 = total_2025 > 0 ? Math.round((lucros_2025 / total_2025) * 1000) / 10 : null;
  const rend_pct_2025 = total_2025 > 0 ? Math.round((rend_2025 / total_2025) * 1000) / 10 : null;

  // Ranking de 2025 entre médicos com renda no ano.
  const earners2025 = allDocs
    .map((d) => gain(d.lucros_2025, d.rend_2025))
    .filter((g) => g > 0)
    .sort((a, b) => b - a);
  const total_ranked = earners2025.length;
  let rank_2025: number | null = null;
  let percentile_2025: number | null = null;
  if (total_2025 > 0 && total_ranked > 0) {
    rank_2025 = earners2025.findIndex((g) => g <= total_2025) + 1;
    if (rank_2025 <= 0) rank_2025 = total_ranked;
    percentile_2025 = Math.round(((total_ranked - rank_2025 + 1) / total_ranked) * 1000) / 10;
  }

  // Projeção por regressão sobre os anos com renda > 0.
  const pts: { x: number; y: number }[] = series
    .filter((s) => s.total > 0)
    .map((s) => ({ x: Number(s.year), y: s.total }));
  const projection_2026 = projectLinear(pts, 2026);
  const projection_2027 = projectLinear(pts, 2027);

  const kpis: DoctorKpis = {
    total_2025,
    total_2024,
    total_2023,
    growth_pct_2023_2025,
    lucros_pct_2025,
    rend_pct_2025,
    rank_2025,
    total_ranked,
    percentile_2025,
    is_previdencia: total_2025 > 50000,
    projection_2026,
    projection_2027,
  };

  return { kpis, series };
}

async function buildInsight(doctor: DoctorRecord, kpis: DoctorKpis): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) return "";
  try {
    const client = getAnthropicClient();
    const brl = (v: number | null) =>
      v == null ? "—" : `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    const data = {
      nome: doctor.nome,
      especialidade: doctor.specialty,
      renda_total_2023: brl(kpis.total_2023),
      renda_total_2024: brl(kpis.total_2024),
      renda_total_2025: brl(kpis.total_2025),
      crescimento_2023_2025_pct: kpis.growth_pct_2023_2025,
      participacao_lucros_2025_pct: kpis.lucros_pct_2025,
      participacao_prolabore_2025_pct: kpis.rend_pct_2025,
      ranking_2025: kpis.rank_2025,
      total_medicos_com_renda_2025: kpis.total_ranked,
      percentil_2025: kpis.percentile_2025,
      pagador_de_previdencia: kpis.is_previdencia,
      projecao_2026: brl(kpis.projection_2026),
      projecao_2027: brl(kpis.projection_2027),
    };
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 220,
      temperature: 0.1,
      system:
        "Você é um analista financeiro. Resuma o perfil de renda de um único médico brasileiro em 2 a 3 frases curtas, em português, citando números concretos (renda 2025, crescimento, posição no ranking e projeção). Se 'pagador_de_previdencia' for true, mencione que ele é classificado como 'Pagador de Previdência'. Não invente dados além dos fornecidos. Texto simples, sem markdown.",
      messages: [{ role: "user", content: `DADOS DO MÉDICO:\n${JSON.stringify(data, null, 2)}` }],
    });
    return response.content[0].type === "text" ? response.content[0].text : "";
  } catch (err) {
    console.error("[/api/doctor] insight error:", err);
    return "";
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ crm: string }> }) {
  try {
    const { crm } = await params;
    const analytics = getAnalytics();
    const doctor = analytics.doctors_data.find((d) => d.crm === crm);
    if (!doctor) {
      return NextResponse.json({ error: "Médico não encontrado" }, { status: 404 });
    }

    const { kpis, series } = buildKpis(doctor, analytics.doctors_data);
    const insight = await buildInsight(doctor, kpis);

    const payload: DoctorAnalytics = {
      doctor: { crm: doctor.crm, nome: doctor.nome, specialty: doctor.specialty },
      kpis,
      series,
      insight,
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[/api/doctor] error:", err);
    return NextResponse.json({ error: "Erro interno ao buscar o médico." }, { status: 500 });
  }
}
