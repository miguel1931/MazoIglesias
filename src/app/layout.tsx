import type { Metadata } from "next";
import "./globals.css";
import BienvenidaModal from "@/components/BienvenidaModal";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Parroquias de Madrid",
  description:
    "Explorador interactivo de las parroquias de la Archidiócesis de Madrid",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head />
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        <BienvenidaModal />
        {/* Cabecera */}
        <header className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              ⛪ Parroquias de Madrid
            </h1>
            <p className="mt-1 text-sm text-amber-200">
              Archidiócesis de Madrid — Explorador interactivo
            </p>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Pie de página */}
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-[10px] text-slate-400">
          <p>
            MazoIglesias — Forjado en la{" "}
            <a
              href="https://forjanova.fit"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-500 hover:text-slate-800 hover:underline"
            >
              Forja Nova
            </a>{" "}
            🔥
          </p>
          <p className="mt-1.5 font-bold tracking-[0.2em] text-slate-500">
            FOC I FERRO, CARN I CODI
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
