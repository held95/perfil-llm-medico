"use client";
import { useState, useRef, useEffect } from "react";
import { Message } from "@/types";
import MessageBubble from "./MessageBubble";
import FilterPanel from "./FilterPanel";
import QuestionSidebar from "./QuestionSidebar";
import { QUESTIONS } from "@/lib/questions";

type ActiveFilters = { specialty_filter?: string; doctor_crm?: string };

const FILTERED_QUESTIONS = [2, 11];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [, setActiveFilters] = useState<ActiveFilters>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Dispara a chamada ao LLM e renderiza a resposta + gráfico.
  async function runQuestion(questionId: number, filters: ActiveFilters, userLabel?: string) {
    if (isLoading) return;
    const question = QUESTIONS.find((q) => q.id === questionId);
    if (!question) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userLabel ?? question.text,
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
        body: JSON.stringify({ question_id: questionId, ...filters }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro na API");

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
    } catch (err) {
      const msg =
        err instanceof Error && err.message && err.message !== "Erro na API"
          ? err.message
          : "Desculpe, ocorreu um erro ao processar sua pergunta. Verifique se a chave de API (ANTHROPIC_API_KEY) está configurada corretamente.";
      setMessages((prev) =>
        prev.map((m) => (m.id === loadingMsg.id ? { ...m, content: msg, isLoading: false } : m))
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Clique numa pergunta da sidebar.
  function handleSelectQuestion(questionId: number) {
    if (isLoading) return;
    const question = QUESTIONS.find((q) => q.id === questionId);
    if (!question) return;

    setHasStarted(true);
    setSelectedQuestionId(questionId);
    setSidebarOpen(false);
    setActiveFilters({});

    if (!FILTERED_QUESTIONS.includes(questionId)) {
      runQuestion(questionId, {});
      return;
    }

    // Pergunta com filtro: peça o filtro primeiro, sem chamar o LLM ainda.
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: question.text,
    };
    const promptMsg: Message = {
      id: `a-${Date.now()}`,
      role: "assistant",
      questionId,
      awaitingFilter: true,
      content:
        questionId === 11
          ? "Esta análise é por especialidade. Selecione uma especialidade no painel abaixo e eu trago a previsão com gráfico e insights."
          : "Esta análise aceita filtro. Escolha uma especialidade ou um médico no painel abaixo e eu trago a evolução com gráfico e insights.",
    };
    setMessages((prev) => [...prev, userMsg, promptMsg]);
  }

  // Seleção de filtro no painel.
  function handleFilterChange(filters: ActiveFilters) {
    setActiveFilters(filters);
    const hasFilter = !!(filters.specialty_filter || filters.doctor_crm);
    if (!selectedQuestionId || !hasFilter) return;

    const label = filters.specialty_filter
      ? `Filtro: especialidade ${filters.specialty_filter}`
      : `Filtro: médico CRM ${filters.doctor_crm}`;
    runQuestion(selectedQuestionId, filters, label);
  }

  function handleReset() {
    setMessages([]);
    setHasStarted(false);
    setSelectedQuestionId(null);
    setActiveFilters({});
    setSidebarOpen(false);
  }

  const showFilterPanel =
    selectedQuestionId !== null && FILTERED_QUESTIONS.includes(selectedQuestionId);

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-72 shrink-0 border-r border-gray-200 bg-white">
        <QuestionSidebar
          selectedId={selectedQuestionId}
          onSelect={handleSelectQuestion}
          onReset={handleReset}
          disabled={isLoading}
        />
      </aside>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="w-72 bg-white shadow-xl">
            <QuestionSidebar
              selectedId={selectedQuestionId}
              onSelect={handleSelectQuestion}
              onReset={handleReset}
              disabled={isLoading}
            />
          </div>
          <button
            type="button"
            aria-label="Fechar"
            className="flex-1 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Coluna central */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra mobile com botão de perguntas */}
        <div className="md:hidden flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-700"
          >
            <span className="text-base leading-none">☰</span> Perguntas
          </button>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-4xl mx-auto w-full space-y-1">
            {!hasStarted && (
              <div className="py-6">
                <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-5 text-white shadow-md">
                  <p className="text-base font-semibold mb-1">
                    Olá! Sou o assistente de análise financeira de médicos.
                  </p>
                  <p className="text-sm text-blue-100">
                    Analiso dados de <strong>1.498 médicos</strong> — lucros e dividendos, pro-labore e
                    contribuição previdenciária de <strong>2023 a 2025</strong>. Escolha uma pergunta na
                    lateral para começar.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Painel de filtro (perguntas filtráveis) */}
        {showFilterPanel && (
          <div className="border-t border-gray-100 px-4 py-3 bg-white/80 backdrop-blur-sm shrink-0">
            <div className="max-w-4xl mx-auto w-full">
              <FilterPanel
                onFilter={handleFilterChange}
                disabled={isLoading}
                specialtyOnly={selectedQuestionId === 11}
                useForecastSpecialties={selectedQuestionId === 11}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
