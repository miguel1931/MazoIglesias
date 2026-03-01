"use client";

import { useState } from "react";

interface FiltrosProps {
  onFiltrar: (texto: string, vicaria: number | null) => void;
}

const VICARIAS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export default function Filtros({ onFiltrar }: FiltrosProps) {
  const [texto, setTexto] = useState("");
  const [vicaria, setVicaria] = useState<number | null>(null);

  const handleTexto = (valor: string) => {
    setTexto(valor);
    onFiltrar(valor, vicaria);
  };

  const handleVicaria = (valor: string) => {
    const v = valor === "" ? null : Number(valor);
    setVicaria(v);
    onFiltrar(texto, v);
  };

  const handleLimpiar = () => {
    setTexto("");
    setVicaria(null);
    onFiltrar("", null);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
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
  );
}
