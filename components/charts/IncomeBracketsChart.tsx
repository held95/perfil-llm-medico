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
import { IncomeBracket } from "@/types";

const COLORS = [
  "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e3a8a",
];

export default function IncomeBracketsChart({ data }: { data: IncomeBracket[] }) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="bracket" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value, _name, props) => [
              `${Number(value).toLocaleString("pt-BR")} médicos (${(props.payload as IncomeBracket).pct}%)`,
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
