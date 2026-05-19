"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { IncomeEvolution } from "@/types";

export default function IncomeEvolutionChart({ data }: { data: IncomeEvolution }) {
  const chartData = (["2023", "2024", "2025"] as const).map((year) => ({
    year,
    lucros: data[year].total_lucros,
    prolabore: data[year].total_rend,
    medicos: data[year].count,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis
            tickFormatter={(v) => `R$${(v / 1_000_000).toFixed(1)}M`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value, name) => {
              const label = name === "lucros" ? "L&D Total" : "Pro-labore Total";
              return [
                `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                label,
              ];
            }}
          />
          <Legend formatter={(v) => (v === "lucros" ? "Lucros & Dividendos" : "Pro-labore")} />
          <Line
            type="monotone"
            dataKey="lucros"
            stroke="#1d4ed8"
            strokeWidth={2}
            dot={{ r: 5, fill: "#1d4ed8" }}
          />
          <Line
            type="monotone"
            dataKey="prolabore"
            stroke="#64748b"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 5, fill: "#64748b" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
