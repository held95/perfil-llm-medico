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
import { DoctorRetentionData } from "@/types";

export default function DoctorRetentionChart({
  data,
}: {
  data: DoctorRetentionData;
}) {
  return (
    <div className="w-full space-y-3">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.years}
            margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="trabalharam"
              name="Trabalharam"
              fill="#1d4ed8"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="sairam"
              name="Saíram"
              fill="#dc2626"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="novos"
              name="Novos"
              fill="#16a34a"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {data.returned_2025 > 0 && (
        <p className="text-xs text-center bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
          <strong>
            {data.returned_2025} médico{data.returned_2025 !== 1 ? "s" : ""}
          </strong>{" "}
          que estavam ausentes em 2024 voltaram a trabalhar em 2025
        </p>
      )}
    </div>
  );
}
