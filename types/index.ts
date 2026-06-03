export interface Summary {
  total_doctors: number;
  total_specialties: number;
  avg_age: number | null;
  age_min: number | null;
  age_max: number | null;
  doctors_with_income_2025: number;
  total_lucros_2025: number;
  avg_lucros_2025: number;
  total_rend_2025: number;
  avg_rend_2025: number;
}

export interface SpecialtyIncome {
  specialty: string;
  avg_lucros: number;
  count: number;
  total: number;
}

export interface YearData {
  total_lucros: number;
  total_rend: number;
  count: number;
}

export interface IncomeEvolution {
  "2023": YearData;
  "2024": YearData;
  "2025": YearData;
}

export interface AgeGroup {
  age_range: string;
  count: number;
  pct: number;
}

export interface TopEarner {
  nome: string;
  especialidade: string;
  lucros_2025: number;
  rend_2025: number;
}

export interface DividendsVsSalary {
  total_lucros_2025: number;
  total_rend_2025: number;
  lucros_pct: number;
  rend_pct: number;
}

export interface ContributionBySpecialty {
  specialty: string;
  avg_contrib: number;
  total_contrib: number;
  count: number;
}

export interface IncomeBracket {
  bracket: string;
  count: number;
  pct: number;
}

export interface DoctorRetentionYear {
  year: string;
  trabalharam: number;
  sairam: number;
  novos: number;
}

export interface DoctorRetentionData {
  years: DoctorRetentionYear[];
  returned_2025: number;
}

export interface DoctorListItem {
  crm: string;
  nome: string;
  specialty: string;
}

export interface DoctorRecord {
  crm: string;
  nome: string;
  specialty: string;
  lucros_2023: number | null;
  rend_2023: number | null;
  lucros_2024: number | null;
  rend_2024: number | null;
  lucros_2025: number | null;
  rend_2025: number | null;
}

export interface Analytics {
  summary: Summary;
  specialty_income: SpecialtyIncome[];
  income_evolution: IncomeEvolution;
  age_distribution: AgeGroup[];
  top_earners: TopEarner[];
  dividends_vs_salary: DividendsVsSalary;
  contribution_by_specialty: ContributionBySpecialty[];
  income_brackets: IncomeBracket[];
  doctor_retention: DoctorRetentionData;
  income_evolution_by_specialty: Record<string, IncomeEvolution>;
  doctors_list: DoctorListItem[];
  doctors_data: DoctorRecord[];
  forecasts: Forecasts;
}

export interface ForecastPoint {
  year: number;
  forecast: number;
  ci_low: number;
  ci_high: number;
}

export interface HistoricalPoint {
  year: number;
  actual: number;
}

export interface IncomeForecastSeries {
  historical: HistoricalPoint[];
  forecasts: ForecastPoint[];
  slope_per_year: number;
}

export interface OverallForecast {
  lucros: IncomeForecastSeries;
  rend: IncomeForecastSeries;
}

export interface SpecialtyForecastEntry {
  lucros: IncomeForecastSeries;
  rend: IncomeForecastSeries;
  growth_pct_lucros: number;
  doctor_count_2025: number;
}

export interface SpecialtyGrowthItem {
  specialty: string;
  growth_pct_lucros: number;
  slope_per_year: number;
  avg_lucros_2025: number;
  doctor_count_2025: number;
}

export interface SpecialtyGrowthRanking {
  top_growth: SpecialtyGrowthItem[];
  bottom_growth: SpecialtyGrowthItem[];
  all_ranked: SpecialtyGrowthItem[];
}

export interface Forecasts {
  overall_forecast: OverallForecast;
  specialty_forecasts: Record<string, SpecialtyForecastEntry>;
  specialty_growth_ranking: SpecialtyGrowthRanking;
}

// --- Q12: probabilidade de retenção de médicos (2026/2027) ---
export interface RetentionCohort {
  threshold_label: string; // ">R$30 mil" | ">R$50 mil (Pagador de Previdência)"
  threshold: number;
  count_2024_2025: number; // presentes em 2024 E 2025 acima do limite
  expected_2026: number;
  expected_2027: number;
  prob_2026_pct: number;
  prob_2027_pct: number;
}

export interface RetentionDoctor {
  nome: string;
  especialidade: string;
  ganho_2024: number;
  ganho_2025: number;
  tag: "Pagador de Previdência" | "Acima de R$30 mil";
}

export interface RetentionProbability {
  retention_rate_pct: number; // taxa média histórica de retenção ano-a-ano
  cohorts: RetentionCohort[];
  doctors: RetentionDoctor[]; // coorte >30k (inclui os >50k), limitada
  total_cohort_30k: number;
  total_cohort_50k: number;
}

// --- People Analytics: dashboard por médico ---
export interface DoctorKpis {
  total_2025: number;
  total_2024: number;
  total_2023: number;
  growth_pct_2023_2025: number | null;
  lucros_pct_2025: number | null;
  rend_pct_2025: number | null;
  rank_2025: number | null;
  total_ranked: number;
  percentile_2025: number | null;
  is_previdencia: boolean;
  projection_2026: number | null;
  projection_2027: number | null;
}

export interface DoctorYearPoint {
  year: string;
  lucros: number;
  rend: number;
  total: number;
}

export interface DoctorAnalytics {
  doctor: DoctorListItem;
  kpis: DoctorKpis;
  series: DoctorYearPoint[];
  insight: string;
}

export type ChartType =
  | "specialty_income"
  | "income_evolution"
  | "age_distribution"
  | "top_earners"
  | "dividends_vs_salary"
  | "contribution_by_specialty"
  | "income_brackets"
  | "doctor_retention"
  | "overall_forecast"
  | "specialty_growth_ranking"
  | "specialty_forecast"
  | "retention_probability";

export interface QuestionConfig {
  id: number;
  text: string;
  chartType: ChartType;
  dataSliceKey: keyof Analytics;
  description: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  chartType?: ChartType;
  chartData?: unknown;
  isLoading?: boolean;
  awaitingFilter?: boolean;
  questionId?: number;
}
