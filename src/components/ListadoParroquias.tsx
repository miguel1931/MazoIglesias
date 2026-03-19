"use client";

import { useState, useEffect } from "react";
import type { Parroquia } from "@/types/parroquia";
import ParroquiaCard from "./ParroquiaCard";

const POR_PAGINA = 20;

interface ListadoParroquiasProps {
  parroquias: Parroquia[];
  seleccionada: Parroquia | null;
  visitadas: Set<string>;
  onSeleccionar: (parroquia: Parroquia) => void;
  onToggleVisitada: (id: string) => void;
  ciudad: "madrid" | "barcelona";
}

export default function ListadoParroquias({
  parroquias,
  seleccionada,
  visitadas,
  onSeleccionar,
  onToggleVisitada,
  ciudad,
}: ListadoParroquiasProps) {
  const [pagina, setPagina] = useState(1);

  // Resetear a página 1 cuando cambie la lista filtrada
  useEffect(() => {
    setPagina(1);
  }, [parroquias]);

  if (parroquias.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-400">
        No se encontraron parroquias con esos filtros.
      </div>
    );
  }

  const totalPaginas = Math.ceil(parroquias.length / POR_PAGINA);
  const inicio = (pagina - 1) * POR_PAGINA;
  const pagina_actual = parroquias.slice(inicio, inicio + POR_PAGINA);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Lista */}
      <div className="custom-scrollbar max-h-[40vh] space-y-2 overflow-y-auto p-3 lg:max-h-[72vh]">
        {pagina_actual.map((parroquia) => (
          <ParroquiaCard
            key={parroquia.id}
            parroquia={parroquia}
            seleccionada={seleccionada?.id === parroquia.id}
            visitada={visitadas.has(parroquia.id)}
            onSeleccionar={onSeleccionar}
            onToggleVisitada={onToggleVisitada}
            ciudad={ciudad}
          />
        ))}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-30"
          >
            ← Anterior
          </button>
          <span className="text-xs text-slate-400">
            {pagina} / {totalPaginas}
          </span>
          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-30"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
