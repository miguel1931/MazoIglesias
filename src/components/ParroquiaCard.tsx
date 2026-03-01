"use client";

import Link from "next/link";
import type { Parroquia } from "@/types/parroquia";

interface ParroquiaCardProps {
  parroquia: Parroquia;
  seleccionada: boolean;
  onSeleccionar: (parroquia: Parroquia) => void;
}

export default function ParroquiaCard({
  parroquia,
  seleccionada,
  onSeleccionar,
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
      <h3 className="text-sm font-semibold text-slate-800">
        {parroquia.nombre}
      </h3>
      <p className="mt-0.5 text-xs text-slate-500">{parroquia.direccion}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
          {parroquia.poblacion}
        </span>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
          Vicaría {parroquia.vicaria}
        </span>
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
