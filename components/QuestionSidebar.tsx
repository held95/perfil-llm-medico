"use client";
import { QUESTIONS } from "@/lib/questions";

const ICONS = ["🏥", "📈", "👥", "💰", "⚖️", "🏛️", "📊", "🔄", "🔮", "🚀", "🎯", "🎲"];

interface Props {
  selectedId: number | null;
  onSelect: (questionId: number) => void;
  onReset: () => void;
  disabled: boolean;
}

export default function QuestionSidebar({ selectedId, onSelect, onReset, disabled }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 shrink-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Perguntas</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Escolha uma análise</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {QUESTIONS.map((q, i) => {
          const active = selectedId === q.id;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(q.id)}
              disabled={disabled}
              className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                active
                  ? "bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-sm"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-800"
              }`}
            >
              <span className="text-sm leading-tight shrink-0 mt-px">{ICONS[i % ICONS.length]}</span>
              <span className="leading-snug">{q.text}</span>
            </button>
          );
        })}
      </div>

      <div className="px-3 py-3 border-t border-gray-100 shrink-0">
        <button
          type="button"
          onClick={onReset}
          disabled={disabled}
          className="w-full text-xs text-gray-400 hover:text-gray-600 underline transition-colors disabled:opacity-40"
        >
          Reiniciar conversa
        </button>
      </div>
    </div>
  );
}
