"use client";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  OverallForecast,
  SpecialtyForecastEntry,
  SpecialtyGrowthRanking,
  IncomeForecastSeries,
} from "@/types";

type Props =
  | { mode: "overall"; data: OverallForecast }
  | { mode: "specialty_growth"; data: SpecialtyGrowthRanking }
  | { mode: "specialty"; data: SpecialtyForecastEntry };

function fmtBRL(val: number) {
  if (val >= 1_000_000) return `R$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `R$${(val / 1_000).toFixed(0)}k`;
  return `R$${val.toFixed(0)}`;
}

interface ChartRow {
  year: number;
  actual?: number;
  forecast?: number;
  ci_low?: number;
  ci_band_width?: number;
}

function buildChartRows(series: IncomeForecastSeries): ChartRow[] {
  const rows: ChartRow[] = series.historical.map((h) => ({
    year: h.year,
    actual: h.actual,
  }));
  for (const f of series.forecasts) {
    rows.push({
      year: f.year,
      forecast: f.forecast,
      ci_low: f.ci_low,
      ci_band_width: f.ci_high - f.ci_low,
    });
  }
  return rows;
}

function ForecastLineChart({
  series,
  label,
  color,
}: {
  series: IncomeForecastSeries;
  label: string;
  color: string;
}) {
  const rows = buildChartRows(series);

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
        {label}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={fmtBRL} tick={{ fontSize: 10 }} width={56} />
          <Tooltip
            formatter={(value, name) => {
              if (name === "IC 95% (banda)" || name === "IC 95% (base)") return null;
              return [fmtBRL(Number(value)), String(name)];
            }}
            labelFormatter={(label) => `Ano: ${label}`}
          />
          <Legend
            formatter={(value) => {
              if (value === "IC 95% (banda)" || value === "IC 95% (base)") return null;
              return value;
            }}
          />
          <ReferenceLine x={2025} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "hoje", fontSize: 10, fill: "#94a3b8" }} />
          <Area
            type="monotone"
            dataKey="ci_low"
            stackId="ci"
            stroke="none"
            fill="transparent"
            name="IC 95% (base)"
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="ci_band_width"
            stackId="ci"
            stroke="none"
            fill={color}
            fillOpacity={0.18}
            name="IC 95% (banda)"
            legendType="none"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 4, fill: color }}
            name="Realizado"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke={color}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4, fill: color }}
            name="Previsão"
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function OverallForecastChart({ data }: { data: OverallForecast }) {
  return (
    <div>
      <ForecastLineChart series={data.lucros} label="Lucros & Dividendos (total)" color="#1d4ed8" />
      <ForecastLineChart series={data.rend} label="Pro-labore (total)" color="#0891b2" />
      <p className="text-xs text-gray-400 mt-1">
        Área sombreada = intervalo de confiança 95% · linha tracejada = previsão · modelo: regressão linear (3 pontos)
      </p>
    </div>
  );
}

function SpecialtyGrowthChart({ data }: { data: SpecialtyGrowthRanking }) {
  const combined = [
    ...data.top_growth.map((x) => ({ ...x, type: "top" as const })),
    ...data.bottom_growth
      .slice()
      .reverse()
      .map((x) => ({ ...x, type: "bottom" as const })),
  ];

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={combined}
          layout="vertical"
          margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            type="category"
            dataKey="specialty"
            tick={{ fontSize: 10 }}
            width={110}
          />
          <Tooltip
            formatter={(value) => [`${Number(value)}%`, "Crescimento L&D/ano"]}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="growth_pct_lucros" name="Crescimento L&D/ano" radius={[0, 4, 4, 0]}>
            {combined.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.type === "top" ? "#16a34a" : "#dc2626"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-1">
        Verde = maior crescimento · Vermelho = menor crescimento · Taxa anual de L&D vs base 2023
      </p>
    </div>
  );
}

function SpecialtyForecastChart({ data }: { data: SpecialtyForecastEntry }) {
  return (
    <div>
      <ForecastLineChart series={data.lucros} label="Lucros & Dividendos (média)" color="#1d4ed8" />
      <ForecastLineChart series={data.rend} label="Pro-labore (média)" color="#0891b2" />
      <p className="text-xs text-gray-400 mt-1">
        Área sombreada = IC 95% · linha tracejada = previsão · {data.doctor_count_2025} médicos em 2025
      </p>
    </div>
  );
}

export default function ForecastChart(props: Props) {
  if (props.mode === "overall") {
    return <OverallForecastChart data={props.data} />;
  }
  if (props.mode === "specialty_growth") {
    return <SpecialtyGrowthChart data={props.data} />;
  }
  return <SpecialtyForecastChart data={props.data} />;
}
