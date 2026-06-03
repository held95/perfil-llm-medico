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
import { DoctorYearPoint } from "@/types";

export default function DoctorIncomeChart({ data }: { data: DoctorYearPoint[] }) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value, name) => [
              `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
              name === "lucros" ? "Lucros & Dividendos" : "Pro-labore",
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(v) => (v === "lucros" ? "Lucros & Dividendos" : "Pro-labore")}
          />
          <Bar dataKey="lucros" stackId="a" fill="#1d4ed8" radius={[0, 0, 0, 0]} />
          <Bar dataKey="rend" stackId="a" fill="#60a5fa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
