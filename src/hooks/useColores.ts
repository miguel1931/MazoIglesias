"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "mazo-iglesias-colores";

export type ColorEtiqueta = "rojo" | "azul" | "blanco" | "gris" | "negro" | null;

export const COLORES: { id: ColorEtiqueta; label: string; bg: string; ring: string; text: string }[] = [
  { id: "rojo",   label: "Rojo",   bg: "bg-red-500",    ring: "ring-red-400",    text: "text-red-500" },
  { id: "azul",   label: "Azul",   bg: "bg-blue-500",   ring: "ring-blue-400",   text: "text-blue-500" },
  { id: "blanco", label: "Blanco", bg: "bg-white border border-slate-300", ring: "ring-slate-300",   text: "text-slate-400" },
  { id: "gris",   label: "Gris",   bg: "bg-slate-400",  ring: "ring-slate-400",  text: "text-slate-400" },
  { id: "negro",  label: "Negro",  bg: "bg-slate-900",  ring: "ring-slate-700",  text: "text-slate-900" },
];

function leer(): Record<string, ColorEtiqueta> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function guardar(data: Record<string, ColorEtiqueta>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useColores() {
  const [colores, setColores] = useState<Record<string, ColorEtiqueta>>({});

  useEffect(() => { setColores(leer()); }, []);

  const setColor = useCallback((iglesiaId: string, color: ColorEtiqueta) => {
    setColores((prev) => {
      const next = { ...prev };
      if (color === null) delete next[iglesiaId];
      else next[iglesiaId] = color;
      guardar(next);
      return next;
    });
  }, []);

  const getColor = useCallback(
    (iglesiaId: string): ColorEtiqueta => colores[iglesiaId] ?? null,
    [colores]
  );

  return { colores, setColor, getColor };
}
