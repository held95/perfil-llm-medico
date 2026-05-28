"use client";
import {
  Message,
  ChartType,
  SpecialtyIncome,
  IncomeEvolution,
  AgeGroup,
  TopEarner,
  DividendsVsSalary,
  ContributionBySpecialty,
  IncomeBracket,
  DoctorRetentionData,
  OverallForecast,
  SpecialtyGrowthRanking,
  SpecialtyForecastEntry,
} from "@/types";
import dynamic from "next/dynamic";

const SpecialtyIncomeChart = dynamic(
  () => import("./charts/SpecialtyIncomeChart"),
  { ssr: false }
);
const IncomeEvolutionChart = dynamic(
  () => import("./charts/IncomeEvolutionChart"),
  { ssr: false }
);
const AgeDistributionChart = dynamic(
  () => import("./charts/AgeDistributionChart"),
  { ssr: false }
);
const TopEarnersChart = dynamic(() => import("./charts/TopEarnersChart"), {
  ssr: false,
});
const DividendsVsSalaryChart = dynamic(
  () => import("./charts/DividendsVsSalaryChart"),
  { ssr: false }
);
const ContributionBySpecialtyChart = dynamic(
  () => import("./charts/ContributionBySpecialtyChart"),
  { ssr: false }
);
const IncomeBracketsChart = dynamic(
  () => import("./charts/IncomeBracketsChart"),
  { ssr: false }
);
const DoctorRetentionChart = dynamic(
  () => import("./charts/DoctorRetentionChart"),
  { ssr: false }
);
const ForecastChart = dynamic(() => import("./charts/ForecastChart"), {
  ssr: false,
});

function renderChart(chartType: ChartType, chartData: unknown) {
  switch (chartType) {
    case "specialty_income":
      return <SpecialtyIncomeChart data={chartData as SpecialtyIncome[]} />;
    case "income_evolution":
      return <IncomeEvolutionChart data={chartData as IncomeEvolution} />;
    case "age_distribution":
      return <AgeDistributionChart data={chartData as AgeGroup[]} />;
    case "top_earners":
      return <TopEarnersChart data={chartData as TopEarner[]} />;
    case "dividends_vs_salary":
      return <DividendsVsSalaryChart data={chartData as DividendsVsSalary} />;
    case "contribution_by_specialty":
      return (
        <ContributionBySpecialtyChart data={chartData as ContributionBySpecialty[]} />
      );
    case "income_brackets":
      return <IncomeBracketsChart data={chartData as IncomeBracket[]} />;
    case "doctor_retention":
      return <DoctorRetentionChart data={chartData as DoctorRetentionData} />;
    case "overall_forecast":
      return <ForecastChart mode="overall" data={chartData as OverallForecast} />;
    case "specialty_growth_ranking":
      return <ForecastChart mode="specialty_growth" data={chartData as SpecialtyGrowthRanking} />;
    case "specialty_forecast":
      return <ForecastChart mode="specialty" data={chartData as SpecialtyForecastEntry} />;
    default:
      return null;
  }
}

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] bg-blue-700 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[92%] w-full">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="text-xs text-gray-500 font-medium">Perfil Médico Analytics</span>
        </div>

        {message.isLoading ? (
          <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <div className="flex gap-1 items-center h-5">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm space-y-3">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
            {message.chartType && message.chartData != null && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                {renderChart(message.chartType, message.chartData)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
