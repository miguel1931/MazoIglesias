"use client";

import { useRef, useState } from "react";

interface FiltrosProps {
  onFiltrar: (texto: string, vicaria: number | null, soloVisitadas: boolean) => void;
  totalVisitadas: number;
  onExportar: () => void;
  onImportar: (file: File) => void;
}

const VICARIAS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export default function Filtros({
  onFiltrar,
  totalVisitadas,
  onExportar,
  onImportar,
}: FiltrosProps) {
  const [texto, setTexto] = useState("");
  const [vicaria, setVicaria] = useState<number | null>(null);
  const [soloVisitadas, setSoloVisitadas] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTexto = (valor: string) => {
    setTexto(valor);
    onFiltrar(valor, vicaria, soloVisitadas);
  };

  const handleVicaria = (valor: string) => {
    const v = valor === "" ? null : Number(valor);
    setVicaria(v);
    onFiltrar(texto, v, soloVisitadas);
  };

  const handleSoloVisitadas = (checked: boolean) => {
    setSoloVisitadas(checked);
    onFiltrar(texto, vicaria, checked);
  };

  const handleLimpiar = () => {
    setTexto("");
    setVicaria(null);
    setSoloVisitadas(false);
    onFiltrar("", null, false);
  };

  const handleImportarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportar(file);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* Buscador por texto */}
        <div className="flex-1">
          <label
            htmlFor="busqueda"
            className="mb-1 block text-xs font-medium text-slate-500"
          >
            Buscar parroquia
          </label>
          <input
            id="busqueda"
            type="text"
            placeholder="Nombre, barrio, población o código postal…"
            value={texto}
            onChange={(e) => handleTexto(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        {/* Filtro por vicaría */}
        <div className="w-full sm:w-48">
          <label
            htmlFor="vicaria"
            className="mb-1 block text-xs font-medium text-slate-500"
          >
            Vicaría
          </label>
          <select
            id="vicaria"
            value={vicaria ?? ""}
            onChange={(e) => handleVicaria(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            <option value="">Todas las vicarías</option>
            {VICARIAS.map((v) => (
              <option key={v} value={v}>
                Vicaría {v}
              </option>
            ))}
          </select>
        </div>

        {/* Botón limpiar */}
        <button
          onClick={handleLimpiar}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 active:bg-slate-300"
        >
          Limpiar
        </button>
      </div>

      {/* Segunda fila: visitadas */}
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
        {/* Checkbox solo visitadas */}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={soloVisitadas}
            onChange={(e) => handleSoloVisitadas(e.target.checked)}
            className="h-4 w-4 accent-green-500"
          />
          Solo visitadas
          {totalVisitadas > 0 && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
              {totalVisitadas}
            </span>
          )}
        </label>

        <div className="ml-auto flex items-center gap-2">
          {/* Exportar */}
          <button
            onClick={onExportar}
            disabled={totalVisitadas === 0}
            title="Exportar visitadas como JSON"
            className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-40"
          >
            Exportar ↓
          </button>

          {/* Importar */}
          <button
            onClick={handleImportarClick}
            title="Importar visitadas desde JSON"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Importar ↑
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
