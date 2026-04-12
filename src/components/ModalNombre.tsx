"use client";

import { useState } from "react";

interface ModalNombreProps {
  onGuardar: (nombre: string) => void;
}

export default function ModalNombre({ onGuardar }: ModalNombreProps) {
  const [valor, setValor] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valor.trim()) onGuardar(valor.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Cabecera */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-8 py-7 text-white">
          <div className="mb-1 text-3xl">👤</div>
          <h2 className="text-2xl font-bold tracking-tight">
            ¿Cómo te llamas?
          </h2>
          <p className="mt-1 text-sm text-indigo-200">
            Tu nombre aparecerá cuando compartas tu progreso con amigos.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-8 py-6">
          <input
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Ej: Miguel, Ana, Pedro…"
            autoFocus
            maxLength={30}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />

          <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
            ⚠️ El nombre no se podrá cambiar después. Elige bien.
          </div>

          <button
            type="submit"
            disabled={!valor.trim()}
            className="mt-4 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40"
          >
            Confirmar nombre
          </button>
        </form>
      </div>
    </div>
  );
}
