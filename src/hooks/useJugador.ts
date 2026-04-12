"use client";

import { useState, useEffect, useCallback } from "react";

const KEY = "mazo-iglesias-jugador";

export function useJugador() {
  const [nombre, setNombreState] = useState<string | null>(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      setNombreState(saved);
    } catch {}
    setCargado(true);
  }, []);

  const setNombre = useCallback((n: string) => {
    const trimmed = n.trim();
    if (!trimmed) return;
    try {
      localStorage.setItem(KEY, trimmed);
    } catch {}
    setNombreState(trimmed);
  }, []);

  return { nombre, cargado, setNombre };
}
