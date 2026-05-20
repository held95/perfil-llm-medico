import { NextResponse } from "next/server";
import { getAnalytics } from "@/lib/data";

export async function GET() {
  const analytics = getAnalytics();
  const specialties = Object.keys(analytics.income_evolution_by_specialty).sort();
  return NextResponse.json({
    specialties,
    doctors_list: analytics.doctors_list,
  });
}
