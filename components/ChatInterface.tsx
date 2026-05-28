"use client";
import { useState, useRef, useEffect } from "react";
import { Message } from "@/types";
import MessageBubble from "./MessageBubble";
import SuggestedQuestions from "./SuggestedQuestions";
import FilterPanel from "./FilterPanel";
import { QUESTIONS } from "@/lib/questions";

type ActiveFilters = { specialty_filter?: string; doctor_crm?: string };

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [isQuestionsVisible, setIsQuestionsVisible] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleQuestion(questionId: number, filters?: ActiveFilters) {
    if (isLoading) return;

    const question = QUESTIONS.find((q) => q.id === questionId);
    if (!question) return;

    setHasStarted(true);
    setSelectedQuestionId(questionId);

    const FILTERED_QUESTIONS = [2, 11];

    // Reset filters when switching away from filtered questions
    if (!FILTERED_QUESTIONS.includes(questionId)) {
      setActiveFilters({});
    }

    const appliedFilters = FILTERED_QUESTIONS.includes(questionId) ? (filters ?? activeFilters) : {};

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: question.text,
    };
    const loadingMsg: Message = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: "",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: questionId, ...appliedFilters }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const data = await res.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? {
                ...m,
                content: data.answer,
                chartType: data.chart_type,
                chartData: data.chart_data,
                isLoading: false,
              }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? {
                ...m,
                content:
                  "Desculpe, ocorreu um erro ao processar sua pergunta. Verifique se a chave de API está configurada corretamente.",
                isLoading: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleFilterChange(filters: ActiveFilters) {
    setActiveFilters(filters);
    // Re-query filtered question with new filters immediately
    if (selectedQuestionId) handleQuestion(selectedQuestionId, filters);
  }

  function handleReset() {
    setMessages([]);
    setHasStarted(false);
    setSelectedQuestionId(null);
    setActiveFilters({});
    setIsQuestionsVisible(true);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {!hasStarted && (
          <div className="py-4">
            <SuggestedQuestions onSelect={handleQuestion} disabled={isLoading} />
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Bottom toolbar when chat has started */}
      {hasStarted && (
        <div className="border-t border-gray-100 px-4 py-3 bg-white/80 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsQuestionsVisible((v) => !v)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span
                className={`inline-block transition-transform duration-200 ${
                  isQuestionsVisible ? "rotate-0" : "-rotate-90"
                }`}
              >
                ▼
              </span>
              {isQuestionsVisible ? "Ocultar perguntas" : "Mostrar perguntas"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
            >
              Reiniciar conversa
            </button>
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isQuestionsVisible ? "max-h-[600px]" : "max-h-0"
            }`}
          >
            {(selectedQuestionId === 2 || selectedQuestionId === 11) && (
              <FilterPanel
                onFilter={handleFilterChange}
                disabled={isLoading}
                specialtyOnly={selectedQuestionId === 11}
              />
            )}
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleQuestion(q.id)}
                  disabled={isLoading}
                  className="text-left text-xs px-3 py-2 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
