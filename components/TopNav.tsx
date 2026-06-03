"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Chat Analytics", icon: "💬" },
  { href: "/people-analytics", label: "People Analytics", icon: "👤" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm shrink-0">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow shrink-0">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-gray-900 leading-tight truncate">
              Perfil Médico Analytics
            </h1>
            <p className="text-xs text-gray-500 leading-tight truncate">
              Inteligência Financeira · Powered by Claude AI
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
