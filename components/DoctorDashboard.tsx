"use client";
import dynamic from "next/dynamic";
import { DoctorAnalytics } from "@/types";
import KpiCard from "./KpiCard";

const DoctorIncomeChart = dynamic(() => import("./charts/DoctorIncomeChart"), { ssr: false });

const brl = (v: number | null) =>
  v == null ? "—" : `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function DoctorDashboard({ data }: { data: DoctorAnalytics }) {
  const { doctor, kpis, series, insight } = data;

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow shrink-0">
            <span className="text-white font-bold">
              {doctor.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight truncate">{doctor.nome}</h2>
            <p className="text-xs text-gray-500">
              {doctor.specialty} · CRM {doctor.crm}
            </p>
          </div>
        </div>
        {kpis.is_previdencia && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            🏛️ Pagador de Previdência
          </span>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Renda total 2025"
          value={brl(kpis.total_2025)}
          icon="💰"
          highlight
          caption="Lucros & Dividendos + pro-labore"
        />
        <KpiCard
          label="Crescimento 23→25"
          value={kpis.growth_pct_2023_2025 == null ? "—" : `${kpis.growth_pct_2023_2025}%`}
          icon="📈"
          accent={kpis.growth_pct_2023_2025 != null && kpis.growth_pct_2023_2025 >= 0 ? "emerald" : "amber"}
          caption={`De ${brl(kpis.total_2023)} para ${brl(kpis.total_2025)}`}
        />
        <KpiCard
          label="Ranking 2025"
          value={kpis.rank_2025 == null ? "—" : `#${kpis.rank_2025}`}
          icon="🏅"
          caption={
            kpis.percentile_2025 != null
              ? `Top ${(100 - kpis.percentile_2025).toFixed(1)}% de ${kpis.total_ranked} médicos`
              : `de ${kpis.total_ranked} médicos`
          }
        />
        <KpiCard
          label="Composição 2025"
          value={kpis.lucros_pct_2025 == null ? "—" : `${kpis.lucros_pct_2025}% L&D`}
          icon="⚖️"
          caption={kpis.rend_pct_2025 == null ? undefined : `${kpis.rend_pct_2025}% pro-labore`}
        />
        <KpiCard label="Projeção 2026" value={brl(kpis.projection_2026)} icon="🔮" accent="gray" caption="Tendência linear (estimativa)" />
        <KpiCard label="Projeção 2027" value={brl(kpis.projection_2027)} icon="🚀" accent="gray" caption="Tendência linear (estimativa)" />
        <KpiCard label="Renda 2024" value={brl(kpis.total_2024)} icon="📊" accent="gray" />
        <KpiCard label="Renda 2023" value={brl(kpis.total_2023)} icon="📅" accent="gray" />
      </div>

      {/* Insight do LLM */}
      {insight && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Resumo da análise</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{insight}</p>
        </div>
      )}

      {/* Gráfico */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">Evolução da renda (2023–2025)</p>
        <DoctorIncomeChart data={series} />
      </div>
    </div>
  );
}
