import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Perfil Médico Analytics — Inteligência Financeira",
  description:
    "Análise inteligente do perfil financeiro de médicos brasileiros 2023–2025. Powered by Claude AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-gray-50 flex flex-col">
        <TopNav />
        <div className="flex-1 overflow-hidden">{children}</div>
      </body>
    </html>
  );
}
