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
import { AgeGroup } from "@/types";

const COLORS = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

export default function AgeDistributionChart({ data }: { data: AgeGroup[] }) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="age_range" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value, _name, props) => [
              `${Number(value).toLocaleString("pt-BR")} médicos (${(props.payload as AgeGroup).pct}%)`,
              "Quantidade",
            ]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
