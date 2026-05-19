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
import { ContributionBySpecialty } from "@/types";

const COLORS = [
  "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd",
  "#1e40af", "#1e3a8a", "#172554", "#2d6a4f", "#1a5276",
];

export default function ContributionBySpecialtyChart({
  data,
}: {
  data: ContributionBySpecialty[];
}) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 8, right: 16, top: 4, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="specialty"
            tick={{ fontSize: 10, angle: -30, textAnchor: "end" }}
            interval={0}
          />
          <YAxis
            tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value, _name, props) => [
              `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} — ${(props.payload as ContributionBySpecialty).count} médicos`,
              "Contrib. Média 2025",
            ]}
          />
          <Bar dataKey="avg_contrib" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
