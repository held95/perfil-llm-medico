import fs from "fs";
import path from "path";
import { Analytics } from "@/types";

let _analytics: Analytics | null = null;

export function getAnalytics(): Analytics {
  if (_analytics) return _analytics;
  const filePath = path.join(process.cwd(), "public", "analytics.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  _analytics = JSON.parse(raw) as Analytics;
  return _analytics;
}
