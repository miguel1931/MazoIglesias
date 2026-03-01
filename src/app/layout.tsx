import type { Metadata } from "next";
import "./globals.css";

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
      <head>
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
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
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
          MazoIglesias — Forjado en la Forja Nova 🔥
        </footer>
      </body>
    </html>
  );
}
