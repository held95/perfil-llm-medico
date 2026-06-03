"use client";
import { useState, useEffect, useRef } from "react";
import { DoctorListItem, DoctorAnalytics } from "@/types";
import DoctorDashboard from "./DoctorDashboard";

export default function PeopleAnalytics() {
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState<DoctorListItem | null>(null);
  const [data, setData] = useState<DoctorAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/filters")
      .then((r) => r.json())
      .then((d) => setDoctors(d.doctors_list))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered =
    search.length >= 2
      ? doctors
          .filter(
            (d) =>
              d.nome.toLowerCase().includes(search.toLowerCase()) || d.crm.includes(search)
          )
          .slice(0, 20)
      : [];

  async function selectDoctor(doctor: DoctorListItem) {
    setSelected(doctor);
    setSearch(doctor.nome);
    setShowDropdown(false);
    setIsLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/doctor/${encodeURIComponent(doctor.crm)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erro ao carregar o médico");
      setData(json as DoctorAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar o médico");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">People Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Busque um médico por nome ou CRM e veja seus KPIs, evolução de renda e um resumo gerado por IA.
          </p>
        </div>

        {/* Busca */}
        <div className="relative" ref={dropdownRef}>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Digite o nome ou o CRM do médico..."
            className="w-full text-sm border border-gray-300 rounded-xl px-4 py-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {showDropdown && filtered.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-72 overflow-y-auto">
              {filtered.map((d) => (
                <button
                  key={d.crm}
                  type="button"
                  onClick={() => selectDoctor(d)}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm border-b border-gray-50 last:border-0"
                >
                  <span className="font-medium text-gray-800">{d.nome}</span>
                  <span className="text-gray-400 ml-2 text-xs">
                    {d.specialty} · CRM {d.crm}
                  </span>
                </button>
              ))}
            </div>
          )}
          {showDropdown && search.length >= 2 && filtered.length === 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 px-4 py-3 text-xs text-gray-400">
              Nenhum médico encontrado.
            </div>
          )}
        </div>

        {/* Estados */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
            <span className="ml-1">Carregando perfil…</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {!isLoading && !error && data && <DoctorDashboard data={data} />}

        {!isLoading && !error && !data && !selected && (
          <div className="text-center text-sm text-gray-400 py-16">
            <p className="text-4xl mb-2">👤</p>
            Selecione um médico acima para visualizar o dashboard individual.
          </div>
        )}
      </div>
    </div>
  );
}
