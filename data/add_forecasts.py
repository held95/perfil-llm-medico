"""
Reads the existing public/analytics.json and appends forecast data.
Use this when the original CSV is unavailable.
Run from perfil-llm-medico/:
  py data/add_forecasts.py
"""
import json
import math
from pathlib import Path

JSON_PATH = Path(__file__).parent.parent / "public" / "analytics.json"

_T_CRIT_95_DF1 = 12.706  # t(0.975, df=1)


def linear_forecast_3pts(y: list, forecast_offsets: list):
    n = 3
    x_mean = 1.0
    Sxx = 2.0
    y_mean = sum(y) / n
    Sxy = sum((i - x_mean) * y[i] for i in range(n))
    slope = Sxy / Sxx
    intercept = y_mean - slope * x_mean
    SSE = sum((y[i] - (intercept + slope * i)) ** 2 for i in range(n))
    s = math.sqrt(SSE) if SSE > 0 else 0.0
    results = []
    for x_new in forecast_offsets:
        y_pred = intercept + slope * x_new
        se_pred = s * math.sqrt(1 + 1 / n + (x_new - x_mean) ** 2 / Sxx)
        margin = _T_CRIT_95_DF1 * se_pred
        results.append({
            "year": 2023 + x_new,
            "forecast": round(y_pred, 2),
            "ci_low": round(max(0.0, y_pred - margin), 2),
            "ci_high": round(y_pred + margin, 2),
        })
    return results, round(slope, 2)


def _series(hist: list, offsets):
    forecasts, slope = linear_forecast_3pts(hist, offsets)
    return {
        "historical": [{"year": 2023 + i, "actual": round(hist[i], 2)} for i in range(3)],
        "forecasts": forecasts,
        "slope_per_year": slope,
    }


def build_forecasts_from_json(data: dict) -> dict:
    OFFSETS = [3, 4, 5]
    ev = data["income_evolution"]
    total_lucros = [ev["2023"]["total_lucros"], ev["2024"]["total_lucros"], ev["2025"]["total_lucros"]]
    total_rend = [ev["2023"]["total_rend"], ev["2024"]["total_rend"], ev["2025"]["total_rend"]]

    overall_forecast = {
        "lucros": _series(total_lucros, OFFSETS),
        "rend": _series(total_rend, OFFSETS),
    }

    ibs = data.get("income_evolution_by_specialty", {})
    specialty_forecasts = {}
    specialty_growth = []

    for spec, years in ibs.items():
        c23 = years["2023"]["count"]
        c24 = years["2024"]["count"]
        c25 = years["2025"]["count"]
        if c23 < 3 or c24 < 3 or c25 < 3:
            continue

        avg_l = [
            years["2023"]["total_lucros"] / c23,
            years["2024"]["total_lucros"] / c24,
            years["2025"]["total_lucros"] / c25,
        ]
        avg_r = [
            years["2023"]["total_rend"] / c23,
            years["2024"]["total_rend"] / c24,
            years["2025"]["total_rend"] / c25,
        ]

        lucros_series = _series(avg_l, OFFSETS)
        rend_series = _series(avg_r, OFFSETS)
        growth_pct = round(lucros_series["slope_per_year"] / avg_l[0] * 100, 2) if avg_l[0] else 0

        specialty_forecasts[spec] = {
            "lucros": lucros_series,
            "rend": rend_series,
            "growth_pct_lucros": growth_pct,
            "doctor_count_2025": c25,
        }
        specialty_growth.append({
            "specialty": spec,
            "growth_pct_lucros": growth_pct,
            "slope_per_year": lucros_series["slope_per_year"],
            "avg_lucros_2025": round(avg_l[2], 2),
            "doctor_count_2025": c25,
        })

    ranked = sorted(specialty_growth, key=lambda x: x["growth_pct_lucros"], reverse=True)

    return {
        "overall_forecast": overall_forecast,
        "specialty_forecasts": specialty_forecasts,
        "specialty_growth_ranking": {
            "top_growth": ranked[:5],
            "bottom_growth": ranked[-5:],
            "all_ranked": ranked,
        },
    }


if __name__ == "__main__":
    print(f"Reading: {JSON_PATH}")
    with open(JSON_PATH, encoding="utf-8") as f:
        data = json.load(f)

    forecasts = build_forecasts_from_json(data)
    data["forecasts"] = forecasts

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    n_specs = len(forecasts["specialty_forecasts"])
    top = forecasts["specialty_growth_ranking"]["top_growth"]
    print(f"Done. Forecasts added for {n_specs} specialties.")
    print("Top growth specialties:")
    for item in top:
        print(f"  {item['specialty']}: +{item['growth_pct_lucros']}%/ano")
