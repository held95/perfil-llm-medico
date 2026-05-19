import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center shadow">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900 leading-tight">
                Perfil Médico Analytics
              </h1>
              <p className="text-xs text-gray-500 leading-tight">
                Inteligência Financeira · Powered by Claude AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              2023–2025
            </span>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden max-w-3xl mx-auto w-full flex flex-col">
        {/* Welcome banner */}
        <div className="px-4 pt-4 pb-2 shrink-0">
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-4 text-white shadow-md">
            <p className="text-sm font-semibold mb-0.5">
              Olá! Sou o assistente de análise financeira de médicos.
            </p>
            <p className="text-xs text-blue-100">
              Analiso dados de <strong>1.498 médicos</strong> — lucros e dividendos, pro-labore e
              contribuição previdenciária de <strong>2023 a 2025</strong>. Clique em uma pergunta abaixo para começar.
            </p>
          </div>
        </div>

        {/* Chat interface takes remaining space */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </div>

      {/* Footer */}
      <footer className="shrink-0 text-center text-xs text-gray-400 py-2 bg-white border-t border-gray-100">
        Perfil Médico Analytics · 1.498 médicos · Dados 2023–2025
      </footer>
    </div>
  );
}
