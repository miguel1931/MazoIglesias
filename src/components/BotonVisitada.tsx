"use client";

import { useVisitadas } from "@/hooks/useVisitadas";

interface BotonVisitadaProps {
  id: string;
}

export default function BotonVisitada({ id }: BotonVisitadaProps) {
  const { visitadas, toggleVisitada } = useVisitadas();
  const visitada = visitadas.has(id);

  return (
    <button
      onClick={() => toggleVisitada(id)}
      className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition ${
        visitada
          ? "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
          : "border border-green-300 bg-white text-green-700 hover:bg-green-50 active:bg-green-100"
      }`}
    >
      {visitada ? "✓ Visitada" : "○ Marcar como visitada"}
    </button>
  );
}
