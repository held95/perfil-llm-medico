"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RetentionProbability } from "@/types";

const brl = (v: number) =>
  `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function RetentionProbabilityChart({ data }: { data: RetentionProbability }) {
  const chartData = data.cohorts.map((c) => ({
    name: c.threshold_label.replace(" (Pagador de Previdência)", "\n(Prev.)"),
    "2024 e 2025": c.count_2024_2025,
    "Esperado 2026": c.expected_2026,
    "Esperado 2027": c.expected_2027,
  }));

  return (
    <div className="w-full space-y-4">
      {/* KPIs de probabilidade */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="rounded-xl bg-gradient-to-br from-blue-700 to-blue-800 text-white p-3 shadow-sm">
          <p className="text-[11px] text-blue-100 leading-tight">Taxa histórica de retenção</p>
          <p className="text-xl font-bold leading-tight">{data.retention_rate_pct}%</p>
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
          <p className="text-[11px] text-blue-700 leading-tight">Acima de R$30 mil (24 e 25)</p>
          <p className="text-xl font-bold text-blue-900 leading-tight">{data.total_cohort_30k}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
          <p className="text-[11px] text-emerald-700 leading-tight">Pagadores de Previdência (&gt;R$50 mil)</p>
          <p className="text-xl font-bold text-emerald-900 leading-tight">{data.total_cohort_50k}</p>
        </div>
      </div>

      {/* Gráfico de coortes */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip formatter={(v) => [`${v} médicos`, ""]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="2024 e 2025" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Esperado 2026" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Esperado 2027" fill="#93c5fd" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-gray-400 leading-snug">
        Probabilidade estimada de permanência: <strong>{data.cohorts[0]?.prob_2026_pct}%</strong> em 2026 e{" "}
        <strong>{data.cohorts[0]?.prob_2027_pct}%</strong> em 2027 — projeção baseada na taxa histórica de
        retenção (não é garantia).
      </p>

      {/* Tabela de médicos da coorte */}
      {data.doctors.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left font-medium px-3 py-2">Médico</th>
                <th className="text-left font-medium px-3 py-2 hidden sm:table-cell">Especialidade</th>
                <th className="text-right font-medium px-3 py-2">Ganho 2025</th>
                <th className="text-left font-medium px-3 py-2">Classificação</th>
              </tr>
            </thead>
            <tbody>
              {data.doctors.map((d, i) => (
                <tr key={`${d.nome}-${i}`} className="border-t border-gray-100">
                  <td className="px-3 py-1.5 text-gray-800">{d.nome}</td>
                  <td className="px-3 py-1.5 text-gray-500 hidden sm:table-cell">{d.especialidade}</td>
                  <td className="px-3 py-1.5 text-right text-gray-800 tabular-nums">{brl(d.ganho_2025)}</td>
                  <td className="px-3 py-1.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        d.tag === "Pagador de Previdência"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {d.tag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.total_cohort_30k > data.doctors.length && (
            <p className="text-[10px] text-gray-400 px-3 py-2 bg-gray-50">
              Mostrando os {data.doctors.length} maiores de {data.total_cohort_30k} médicos da coorte.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
