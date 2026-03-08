"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "iglesias-visitadas";

export function useVisitadas() {
  const [visitadas, setVisitadas] = useState<Set<string>>(new Set());

  // Cargar desde localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setVisitadas(new Set(JSON.parse(stored) as string[]));
      }
    } catch {
      // localStorage no disponible o JSON inválido
    }
  }, []);

  const toggleVisitada = useCallback((id: string) => {
    setVisitadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  const exportar = useCallback(
    (nombreFichero = "iglesias-visitadas.json") => {
      const data = JSON.stringify([...visitadas], null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombreFichero;
      a.click();
      URL.revokeObjectURL(url);
    },
    [visitadas]
  );

  const importar = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const ids = JSON.parse(e.target?.result as string) as string[];
          if (!Array.isArray(ids)) return;
          setVisitadas((prev) => {
            const merged = new Set([...prev, ...ids]);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify([...merged]));
            } catch {}
            return merged;
          });
        } catch {
          alert("Fichero JSON no válido.");
        }
      };
      reader.readAsText(file);
    },
    []
  );

  return { visitadas, toggleVisitada, exportar, importar };
}
