"use client";

import Link from "next/link";
import type { Parroquia } from "@/types/parroquia";

interface ParroquiaCardProps {
  parroquia: Parroquia;
  seleccionada: boolean;
  visitada: boolean;
  onSeleccionar: (parroquia: Parroquia) => void;
  onToggleVisitada: (id: string) => void;
  ciudad: "madrid" | "barcelona";
}

export default function ParroquiaCard({
  parroquia,
  seleccionada,
  visitada,
  onSeleccionar,
  onToggleVisitada,
  ciudad,
}: ParroquiaCardProps) {
  const labelZona = ciudad === "barcelona" ? "Decanato" : "Vicaria";
  const accentBadge = ciudad === "barcelona"
    ? "bg-blue-100 text-blue-700"
    : "bg-amber-100 text-amber-700";
  const accentLink = ciudad === "barcelona"
    ? "text-blue-700 decoration-blue-300 hover:text-blue-900"
    : "text-amber-700 decoration-amber-300 hover:text-amber-900";
  const accentSelected = ciudad === "barcelona"
    ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-500/20"
    : "border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-500/20";
  const accentHover = ciudad === "barcelona"
    ? "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm"
    : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-sm";

  return (
    <div
      onClick={() => onSeleccionar(parroquia)}
      className={`cursor-pointer rounded-lg border p-3 transition-all ${
        seleccionada ? accentSelected : accentHover
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
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${accentBadge}`}>
          {labelZona} {parroquia.vicaria}
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
          className={`text-xs font-medium underline underline-offset-2 transition ${accentLink}`}
        >
          Ver detalle →
        </Link>
      </div>
    </div>
  );
}
