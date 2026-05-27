"""
Reads TESTE PERFIL 2023 A 2025.csv and generates public/analytics.json.
Run from perfil-medico-llm/data/:
  python3 process_csv.py
"""
import json
import re
import datetime
from pathlib import Path
from collections import defaultdict

CSV_PATH = Path(__file__).parent.parent.parent / "TESTE PERFIL 2023 A 2025.csv"
OUT_PATH = Path(__file__).parent.parent / "public" / "analytics.json"


def parse_brl(val: str):
    v = val.strip()
    if not v or v == "   " or "R$-" in v:
        return None
    v = re.sub(r"\s+", "", v).replace("R$", "").replace(".", "").replace(",", ".")
    try:
        f = float(v)
        return f if f > 0 else None
    except ValueError:
        return None


def normalize_specialty(s: str) -> str:
    return s.strip().upper() if s.strip() else "NAO INFORMADA"


def parse_age(dob_str: str):
    try:
        dob = datetime.datetime.strptime(dob_str.strip(), "%d/%m/%Y")
        return (datetime.datetime(2025, 1, 1) - dob).days // 365
    except Exception:
        return None


def age_bracket(age: int) -> str:
    if age < 30:
        return "20-29"
    if age < 40:
        return "30-39"
    if age < 50:
        return "40-49"
    if age < 60:
        return "50-59"
    return "60+"


def income_bracket(val: float) -> str:
    if val < 20_000:
        return "< R$20k"
    if val < 50_000:
        return "R$20k-50k"
    if val < 100_000:
        return "R$50k-100k"
    if val < 200_000:
        return "R$100k-200k"
    if val < 500_000:
        return "R$200k-500k"
    return "> R$500k"


INCOME_BRACKET_ORDER = [
    "< R$20k",
    "R$20k-50k",
    "R$50k-100k",
    "R$100k-200k",
    "R$200k-500k",
    "> R$500k",
]


def load_data():
    with open(CSV_PATH, encoding="latin-1", errors="replace") as f:
        lines = f.readlines()
    # Line 0: blank (;;;;;;;;;;;;;;), Line 1: header, Lines 2+: data
    records = []
    for line in lines[2:]:
        parts = line.strip().split(";")
        if not parts[0].strip():
            continue  # skip empty rows
        rec = {
            "crm": parts[0].strip(),
            "nome": parts[1].strip() if len(parts) > 1 else "",
            # CPF intentionally excluded (index 2)
            "dob": parts[3].strip() if len(parts) > 3 else "",
            "specialty": normalize_specialty(parts[4]) if len(parts) > 4 else "NAO INFORMADA",
            "lucros_2023": parse_brl(parts[5]) if len(parts) > 5 else None,
            "rend_2023": parse_brl(parts[6]) if len(parts) > 6 else None,
            "contrib_2023": parse_brl(parts[7]) if len(parts) > 7 else None,
            "lucros_2024": parse_brl(parts[8]) if len(parts) > 8 else None,
            "rend_2024": parse_brl(parts[9]) if len(parts) > 9 else None,
            "contrib_2024": parse_brl(parts[10]) if len(parts) > 10 else None,
            "lucros_2025": parse_brl(parts[11]) if len(parts) > 11 else None,
            "rend_2025": parse_brl(parts[12]) if len(parts) > 12 else None,
            "contrib_2025": parse_brl(parts[13]) if len(parts) > 13 else None,
        }
        rec["age"] = parse_age(rec["dob"])
        records.append(rec)
    return records


def build_analytics(records):
    total = len(records)
    ages = [r["age"] for r in records if r["age"] is not None]
    l25 = [r["lucros_2025"] for r in records if r["lucros_2025"]]
    l24 = [r["lucros_2024"] for r in records if r["lucros_2024"]]
    l23 = [r["lucros_2023"] for r in records if r["lucros_2023"]]
    rd25 = [r["rend_2025"] for r in records if r["rend_2025"]]

    specialties = set(r["specialty"] for r in records)

    summary = {
        "total_doctors": total,
        "total_specialties": len(specialties),
        "avg_age": round(sum(ages) / len(ages), 1) if ages else None,
        "age_min": min(ages) if ages else None,
        "age_max": max(ages) if ages else None,
        "doctors_with_income_2025": len(l25),
        "total_lucros_2025": round(sum(l25), 2),
        "avg_lucros_2025": round(sum(l25) / len(l25), 2) if l25 else 0,
        "total_rend_2025": round(sum(rd25), 2),
        "avg_rend_2025": round(sum(rd25) / len(rd25), 2) if rd25 else 0,
    }

    # 1. Specialty income — top 10 by avg lucros 2025, min 3 doctors
    spec_lucros = defaultdict(list)
    for r in records:
        if r["lucros_2025"]:
            spec_lucros[r["specialty"]].append(r["lucros_2025"])
    specialty_income = sorted(
        [
            {
                "specialty": k,
                "avg_lucros": round(sum(v) / len(v), 2),
                "count": len(v),
                "total": round(sum(v), 2),
            }
            for k, v in spec_lucros.items()
            if len(v) >= 3
        ],
        key=lambda x: x["avg_lucros"],
        reverse=True,
    )[:10]

    # 2. Income evolution
    def rend_sum(year_key):
        return round(
            sum(r[f"rend_{year_key}"] or 0 for r in records if r[f"lucros_{year_key}"]),
            2,
        )

    income_evolution = {
        "2023": {
            "total_lucros": round(sum(l23), 2),
            "total_rend": rend_sum("2023"),
            "count": len(l23),
        },
        "2024": {
            "total_lucros": round(sum(l24), 2),
            "total_rend": rend_sum("2024"),
            "count": len(l24),
        },
        "2025": {
            "total_lucros": round(sum(l25), 2),
            "total_rend": rend_sum("2025"),
            "count": len(l25),
        },
    }

    # 3. Age distribution
    bracket_counts = defaultdict(int)
    for r in records:
        if r["age"]:
            bracket_counts[age_bracket(r["age"])] += 1
    ORDER = ["20-29", "30-39", "40-49", "50-59", "60+"]
    age_distribution = [
        {
            "age_range": b,
            "count": bracket_counts[b],
            "pct": round(bracket_counts[b] / total * 100, 1),
        }
        for b in ORDER
    ]

    # 4. Top earners — top 10 by lucros_2025 (first 3 name words, no CPF)
    top_earners_raw = sorted(
        [r for r in records if r["lucros_2025"]],
        key=lambda x: x["lucros_2025"],
        reverse=True,
    )[:10]
    top_earners = [
        {
            "nome": " ".join(r["nome"].split()[:3]),
            "especialidade": r["specialty"],
            "lucros_2025": r["lucros_2025"],
            "rend_2025": r["rend_2025"] or 0,
        }
        for r in top_earners_raw
    ]

    # 5. Dividends vs salary (2025)
    total_l = sum(l25)
    total_r = sum(rd25)
    grand = total_l + total_r
    dividends_vs_salary = {
        "total_lucros_2025": round(total_l, 2),
        "total_rend_2025": round(total_r, 2),
        "lucros_pct": round(total_l / grand * 100, 1) if grand else 0,
        "rend_pct": round(total_r / grand * 100, 1) if grand else 0,
    }

    # 6. Contribution by specialty — avg contrib 2025, min 3 doctors
    spec_contrib = defaultdict(list)
    for r in records:
        if r["contrib_2025"]:
            spec_contrib[r["specialty"]].append(r["contrib_2025"])
    contribution_by_specialty = sorted(
        [
            {
                "specialty": k,
                "avg_contrib": round(sum(v) / len(v), 2),
                "total_contrib": round(sum(v), 2),
                "count": len(v),
            }
            for k, v in spec_contrib.items()
            if len(v) >= 3
        ],
        key=lambda x: x["avg_contrib"],
        reverse=True,
    )[:10]

    # 7. Income brackets (lucros_2025)
    ib_counts = defaultdict(int)
    for v in l25:
        ib_counts[income_bracket(v)] += 1
    income_brackets = [
        {
            "bracket": b,
            "count": ib_counts[b],
            "pct": round(ib_counts[b] / len(l25) * 100, 1),
        }
        for b in INCOME_BRACKET_ORDER
    ]

    # 8. Doctor retention across years
    worked_2023 = {r['crm'] for r in records if r['lucros_2023'] or r['rend_2023']}
    worked_2024 = {r['crm'] for r in records if r['lucros_2024'] or r['rend_2024']}
    worked_2025 = {r['crm'] for r in records if r['lucros_2025'] or r['rend_2025']}
    left_after_2023 = worked_2023 - worked_2024
    left_after_2024 = worked_2024 - worked_2025
    returned_2025 = (worked_2023 - worked_2024) & worked_2025
    new_in_2024 = worked_2024 - worked_2023
    new_in_2025 = worked_2025 - worked_2024
    doctor_retention = {
        "years": [
            # 2023 = ano base: sem ano anterior, todos são "novos" (entradas) no dataset
            {"year": "2023", "trabalharam": len(worked_2023), "sairam": 0,                    "novos": len(worked_2023)},
            # 2024: saíram = quem estava em 2023 mas não aparece em 2024 (visão retroativa)
            {"year": "2024", "trabalharam": len(worked_2024), "sairam": len(left_after_2023), "novos": len(new_in_2024)},
            # 2025: saíram = quem estava em 2024 mas não aparece em 2025 (visão retroativa)
            {"year": "2025", "trabalharam": len(worked_2025), "sairam": len(left_after_2024), "novos": len(new_in_2025)},
        ],
        "returned_2025": len(returned_2025),
        # Identidade contábil: trabalharam(ano) = trabalharam(ano-1) + novos - sairam
        # 2023:   0 + 477 -   0 = 477
        # 2024: 477 + 594 - 132 = 939
        # 2025: 939 + 441 - 269 = 1111
    }

    # 9. Income evolution by specialty (todas as especialidades)
    income_evolution_by_specialty = {}
    for spec in set(r["specialty"] for r in records):
        spec_records = [r for r in records if r["specialty"] == spec]
        l23s = [r["lucros_2023"] for r in spec_records if r["lucros_2023"]]
        l24s = [r["lucros_2024"] for r in spec_records if r["lucros_2024"]]
        l25s = [r["lucros_2025"] for r in spec_records if r["lucros_2025"]]
        def spec_rend(year_key, recs):
            return round(sum(r[f"rend_{year_key}"] or 0 for r in recs if r[f"lucros_{year_key}"]), 2)
        income_evolution_by_specialty[spec] = {
            "2023": {"total_lucros": round(sum(l23s), 2), "total_rend": spec_rend("2023", spec_records), "count": len(l23s)},
            "2024": {"total_lucros": round(sum(l24s), 2), "total_rend": spec_rend("2024", spec_records), "count": len(l24s)},
            "2025": {"total_lucros": round(sum(l25s), 2), "total_rend": spec_rend("2025", spec_records), "count": len(l25s)},
        }

    # 10. Doctors list (para autocomplete no frontend — sem dados financeiros)
    doctors_list = sorted(
        [{"crm": r["crm"], "nome": " ".join(r["nome"].split()[:3]), "specialty": r["specialty"]} for r in records],
        key=lambda x: x["nome"],
    )

    # 11. Doctors data (para filtro server-side — sem CPF/DOB)
    doctors_data = [
        {
            "crm": r["crm"],
            "nome": " ".join(r["nome"].split()[:3]),
            "specialty": r["specialty"],
            "lucros_2023": r["lucros_2023"], "rend_2023": r["rend_2023"],
            "lucros_2024": r["lucros_2024"], "rend_2024": r["rend_2024"],
            "lucros_2025": r["lucros_2025"], "rend_2025": r["rend_2025"],
        }
        for r in records
    ]

    return {
        "summary": summary,
        "specialty_income": specialty_income,
        "income_evolution": income_evolution,
        "age_distribution": age_distribution,
        "top_earners": top_earners,
        "dividends_vs_salary": dividends_vs_salary,
        "contribution_by_specialty": contribution_by_specialty,
        "income_brackets": income_brackets,
        "doctor_retention": doctor_retention,
        "income_evolution_by_specialty": income_evolution_by_specialty,
        "doctors_list": doctors_list,
        "doctors_data": doctors_data,
    }


if __name__ == "__main__":
    print(f"Reading: {CSV_PATH}")
    records = load_data()
    print(f"Loaded {len(records)} valid records")
    analytics = build_analytics(records)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(analytics, f, ensure_ascii=False, indent=2)
    print(f"Written: {OUT_PATH}")
    s = analytics["summary"]
    print(f"Total doctors: {s['total_doctors']}")
    print(f"Avg lucros 2025: R${s['avg_lucros_2025']:,.2f}")
    if analytics["specialty_income"]:
        print(f"Top specialty by income: {analytics['specialty_income'][0]['specialty']}")
