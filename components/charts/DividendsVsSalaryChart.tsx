"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DividendsVsSalary } from "@/types";

const COLORS = ["#1d4ed8", "#64748b"];

export default function DividendsVsSalaryChart({ data }: { data: DividendsVsSalary }) {
  const chartData = [
    { name: "Lucros & Dividendos", value: data.total_lucros_2025, pct: data.lucros_pct },
    { name: "Pro-labore", value: data.total_rend_2025, pct: data.rend_pct },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            label={(entry) => { const e = entry as unknown as typeof chartData[0]; return `${e.name}: ${e.pct}%`; }}
            labelLine={false}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [
              `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
              "Total 2025",
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
