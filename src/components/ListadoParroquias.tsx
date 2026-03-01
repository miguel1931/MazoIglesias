"use client";

import type { Parroquia } from "@/types/parroquia";
import ParroquiaCard from "./ParroquiaCard";

interface ListadoParroquiasProps {
  parroquias: Parroquia[];
  seleccionada: Parroquia | null;
  onSeleccionar: (parroquia: Parroquia) => void;
}

export default function ListadoParroquias({
  parroquias,
  seleccionada,
  onSeleccionar,
}: ListadoParroquiasProps) {
  if (parroquias.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-400">
        No se encontraron parroquias con esos filtros.
      </div>
    );
  }

  return (
    <div className="custom-scrollbar max-h-[40vh] space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:max-h-[80vh]">
      {parroquias.map((parroquia) => (
        <ParroquiaCard
          key={parroquia.id}
          parroquia={parroquia}
          seleccionada={seleccionada?.id === parroquia.id}
          onSeleccionar={onSeleccionar}
        />
      ))}
    </div>
  );
}
