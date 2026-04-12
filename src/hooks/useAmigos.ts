"use client";

import { useState, useEffect, useCallback } from "react";

const KEY = "mazo-iglesias-amigos";

export interface DatosAmigo {
  nombre: string;
  visitadas: string[];
  numFotos: number;
  colores: Record<string, string | null>;
  ultimaActualizacion: string; // ISO timestamp
}

function leerAmigos(): DatosAmigo[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DatosAmigo[]) : [];
  } catch {
    return [];
  }
}

function guardarAmigos(amigos: DatosAmigo[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(amigos));
  } catch {}
}

export function useAmigos() {
  const [amigos, setAmigos] = useState<DatosAmigo[]>([]);

  useEffect(() => {
    setAmigos(leerAmigos());
  }, []);

  const cargarAmigo = useCallback(
    (file: File): Promise<{ ok: boolean; mensaje: string }> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const raw = JSON.parse(e.target?.result as string);

            // Formato v1 (solo array) → no tiene nombre, rechazar
            if (Array.isArray(raw)) {
              resolve({
                ok: false,
                mensaje:
                  "Este fichero no incluye nombre de jugador. Pide a tu amigo que exporte con la versión actualizada.",
              });
              return;
            }

            const nombre: string | undefined = raw.jugador;
            if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
              resolve({
                ok: false,
                mensaje:
                  "Este fichero no incluye nombre de jugador. Pide a tu amigo que exporte con la versión más reciente.",
              });
              return;
            }

            const visitadas: string[] = Array.isArray(raw.visitadas)
              ? raw.visitadas
              : [];
            const numFotos: number = Array.isArray(raw.fotos)
              ? raw.fotos.length
              : 0;
            const colores: Record<string, string | null> =
              raw.colores && typeof raw.colores === "object" ? raw.colores : {};
            const ultimaActualizacion: string =
              raw.exportadoEn || new Date().toISOString();

            const nuevo: DatosAmigo = {
              nombre: nombre.trim(),
              visitadas,
              numFotos,
              colores,
              ultimaActualizacion,
            };

            setAmigos((prev) => {
              const idx = prev.findIndex(
                (a) => a.nombre.toLowerCase() === nuevo.nombre.toLowerCase()
              );
              let next: DatosAmigo[];
              if (idx >= 0) {
                // Actualizar existente
                next = [...prev];
                next[idx] = nuevo;
              } else {
                next = [...prev, nuevo];
              }
              guardarAmigos(next);
              return next;
            });

            resolve({
              ok: true,
              mensaje: `Datos de "${nuevo.nombre}" cargados: ${visitadas.length} iglesias, ${numFotos} fotos.`,
            });
          } catch {
            resolve({ ok: false, mensaje: "Fichero JSON no válido." });
          }
        };
        reader.readAsText(file);
      });
    },
    []
  );

  const eliminarAmigo = useCallback((nombre: string) => {
    setAmigos((prev) => {
      const next = prev.filter(
        (a) => a.nombre.toLowerCase() !== nombre.toLowerCase()
      );
      guardarAmigos(next);
      return next;
    });
  }, []);

  return { amigos, cargarAmigo, eliminarAmigo };
}
