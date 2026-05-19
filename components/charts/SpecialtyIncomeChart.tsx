"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { SpecialtyIncome } from "@/types";

const COLORS = [
  "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd",
  "#1e40af", "#1e3a8a", "#172554", "#2d6a4f", "#1a5276",
];

export default function SpecialtyIncomeChart({ data }: { data: SpecialtyIncome[] }) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="specialty"
            width={160}
            tick={{ fontSize: 10 }}
          />
          <Tooltip
            formatter={(value, _name, props) => [
              `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} — ${(props.payload as SpecialtyIncome).count} médicos`,
              "Média L&D 2025",
            ]}
          />
          <Bar dataKey="avg_lucros" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
