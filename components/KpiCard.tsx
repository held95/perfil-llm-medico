"use client";
import { ReactNode } from "react";

interface Props {
  label: string;
  value: ReactNode;
  caption?: string;
  icon?: string;
  accent?: "blue" | "emerald" | "amber" | "gray";
  highlight?: boolean;
}

const ACCENTS: Record<NonNullable<Props["accent"]>, string> = {
  blue: "text-blue-700",
  emerald: "text-emerald-700",
  amber: "text-amber-600",
  gray: "text-gray-700",
};

export default function KpiCard({ label, value, caption, icon, accent = "blue", highlight }: Props) {
  return (
    <div
      className={`rounded-2xl p-4 border shadow-sm transition-all hover:shadow-md ${
        highlight
          ? "bg-gradient-to-br from-blue-700 to-blue-800 border-blue-800 text-white"
          : "bg-white border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <p className={`text-[11px] font-medium uppercase tracking-wide ${highlight ? "text-blue-100" : "text-gray-400"}`}>
          {label}
        </p>
        {icon && <span className="text-base leading-none">{icon}</span>}
      </div>
      <p className={`text-2xl font-bold leading-tight ${highlight ? "text-white" : ACCENTS[accent]}`}>
        {value}
      </p>
      {caption && (
        <p className={`text-[11px] mt-1 leading-snug ${highlight ? "text-blue-100" : "text-gray-400"}`}>
          {caption}
        </p>
      )}
    </div>
  );
}
