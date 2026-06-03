import { NextResponse } from "next/server";
import { getAnalytics } from "@/lib/data";

export async function GET() {
  const analytics = getAnalytics();
  const specialties = Object.keys(analytics.income_evolution_by_specialty).sort();
  // Apenas especialidades que possuem previsão (≥3 médicos/ano) — usadas na Q11
  // para evitar 404 ao selecionar especialidades sem dados de forecast.
  const forecast_specialties = Object.keys(analytics.forecasts.specialty_forecasts).sort();
  return NextResponse.json({
    specialties,
    forecast_specialties,
    doctors_list: analytics.doctors_list,
  });
}
