"use client";
import { useState, useEffect, useRef } from "react";
import { DoctorListItem } from "@/types";

interface FilterState {
  specialty: string;
  doctorCrm: string;
}

interface Props {
  onFilter: (filters: { specialty_filter?: string; doctor_crm?: string }) => void;
  disabled: boolean;
  specialtyOnly?: boolean;
}

export default function FilterPanel({ onFilter, disabled, specialtyOnly }: Props) {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [filter, setFilter] = useState<FilterState>({ specialty: "", doctorCrm: "" });
  const [doctorSearch, setDoctorSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/filters")
      .then((r) => r.json())
      .then((data) => {
        setSpecialties(data.specialties);
        setDoctors(data.doctors_list);
      });
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

  const filteredDoctors =
    doctorSearch.length >= 2
      ? doctors
          .filter(
            (d) =>
              d.nome.toLowerCase().includes(doctorSearch.toLowerCase()) ||
              d.crm.includes(doctorSearch)
          )
          .slice(0, 20)
      : [];

  function handleSpecialtyChange(value: string) {
    setFilter({ specialty: value, doctorCrm: "" });
    setDoctorSearch("");
    onFilter(value ? { specialty_filter: value } : {});
  }

  function handleDoctorSelect(doctor: DoctorListItem) {
    setFilter({ specialty: "", doctorCrm: doctor.crm });
    setDoctorSearch(doctor.nome);
    setShowDropdown(false);
    onFilter({ doctor_crm: doctor.crm });
  }

  function handleClear() {
    setFilter({ specialty: "", doctorCrm: "" });
    setDoctorSearch("");
    onFilter({});
  }

  const hasFilter = filter.specialty || filter.doctorCrm;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 space-y-3 text-sm">
      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
        {specialtyOnly ? "Filtro — Especialidade" : "Filtros — Evolução de Rendimentos"}
      </p>

      {/* Specialty filter */}
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-specialty" className="text-xs text-gray-600">Especialidade</label>
        <select
          id="filter-specialty"
          value={filter.specialty}
          onChange={(e) => handleSpecialtyChange(e.target.value)}
          disabled={disabled || !!filter.doctorCrm}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Todas as especialidades</option>
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Doctor search — hidden when specialtyOnly */}
      {!specialtyOnly && <div className="flex flex-col gap-1 relative" ref={dropdownRef}>
        <label className="text-xs text-gray-600">
          Médico (busca por nome ou CRM)
        </label>
        <input
          type="text"
          value={doctorSearch}
          onChange={(e) => {
            setDoctorSearch(e.target.value);
            setShowDropdown(true);
            if (!e.target.value) {
              setFilter((f) => ({ ...f, doctorCrm: "" }));
              onFilter(
                filter.specialty ? { specialty_filter: filter.specialty } : {}
              );
            }
          }}
          onFocus={() => setShowDropdown(true)}
          disabled={disabled || !!filter.specialty}
          placeholder="Digite nome ou CRM..."
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {showDropdown && filteredDoctors.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {filteredDoctors.map((d) => (
              <button
                key={d.crm}
                type="button"
                onClick={() => handleDoctorSelect(d)}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-xs"
              >
                <span className="font-medium">{d.nome}</span>
                <span className="text-gray-400 ml-2">
                  {d.specialty} · {d.crm}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>}

      {/* Clear button */}
      {hasFilter && (
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className="text-xs text-blue-600 hover:underline disabled:opacity-50"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
