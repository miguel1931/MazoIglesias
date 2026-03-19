"use client";

import { useColores, COLORES, type ColorEtiqueta } from "@/hooks/useColores";

interface ColorPickerIglesiaProps {
  iglesiaId: string;
}

export default function ColorPickerIglesia({ iglesiaId }: ColorPickerIglesiaProps) {
  const { getColor, setColor } = useColores();
  const colorActual = getColor(iglesiaId);

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Etiqueta de color
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        {COLORES.map((c) => {
          const activo = colorActual === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setColor(iglesiaId, activo ? null : c.id)}
              title={activo ? `Quitar ${c.label}` : c.label}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${c.bg} ${
                activo ? `ring-2 ring-offset-2 ${c.ring} scale-110` : "opacity-70 hover:opacity-100 hover:scale-105"
              }`}
            >
              {activo && (
                <span className={`text-xs font-bold ${c.id === "blanco" || c.id === "blanco" ? "text-slate-600" : "text-white"}`}>
                  ✓
                </span>
              )}
            </button>
          );
        })}
        {colorActual && (
          <button
            onClick={() => setColor(iglesiaId, null)}
            title="Quitar etiqueta"
            className="rounded-full px-2 py-1 text-[10px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            Quitar
          </button>
        )}
      </div>
      {colorActual && (
        <p className="text-[10px] text-slate-400">
          Etiqueta actual: <span className="font-medium capitalize text-slate-600">{colorActual}</span>
        </p>
      )}
    </section>
  );
}
