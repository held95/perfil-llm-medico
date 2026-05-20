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
  // Novas
  doctor_retention: DoctorRetentionData;
  income_evolution_by_specialty: Record<string, IncomeEvolution>;
  doctors_list: DoctorListItem[];
  doctors_data: DoctorRecord[];
}

export type ChartType =
  | "specialty_income"
  | "income_evolution"
  | "age_distribution"
  | "top_earners"
  | "dividends_vs_salary"
  | "contribution_by_specialty"
  | "income_brackets"
  | "doctor_retention";

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
}
