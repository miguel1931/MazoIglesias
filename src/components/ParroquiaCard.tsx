"use client";

import Link from "next/link";
import type { Parroquia } from "@/types/parroquia";

interface ParroquiaCardProps {
  parroquia: Parroquia;
  seleccionada: boolean;
  visitada: boolean;
  onSeleccionar: (parroquia: Parroquia) => void;
  onToggleVisitada: (id: string) => void;
}

export default function ParroquiaCard({
  parroquia,
  seleccionada,
  visitada,
  onSeleccionar,
  onToggleVisitada,
}: ParroquiaCardProps) {
  return (
    <div
      onClick={() => onSeleccionar(parroquia)}
      className={`cursor-pointer rounded-lg border p-3 transition-all ${
        seleccionada
          ? "border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-500/20"
          : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">
          {parroquia.nombre}
        </h3>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisitada(parroquia.id); }}
          title={visitada ? "Quitar de visitadas" : "Marcar como visitada"}
          className={`shrink-0 rounded-full px-1 text-lg leading-none transition-colors ${
            visitada ? "text-green-500 hover:text-green-700" : "text-slate-300 hover:text-green-400"
          }`}
        >
          {visitada ? "✓" : "○"}
        </button>
      </div>
      <p className="mt-0.5 text-xs text-slate-500">{parroquia.direccion}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
          {parroquia.poblacion}
        </span>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
          Vicaría {parroquia.vicaria}
        </span>
        {visitada && (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
            Visitada
          </span>
        )}
      </div>
      <div className="mt-2 flex justify-end">
        <Link
          href={`/parroquia/${parroquia.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-medium text-amber-700 underline decoration-amber-300 underline-offset-2 transition hover:text-amber-900"
        >
          Ver detalle →
        </Link>
      </div>
    </div>
  );
}
