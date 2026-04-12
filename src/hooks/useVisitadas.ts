"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "iglesias-visitadas";
const COLORES_KEY = "mazo-iglesias-colores";
const DB_NAME = "mazo-iglesias-fotos";
const STORE = "fotos";
const DB_V = 1;

// ─── IndexedDB helpers (duplicados mínimos para no acoplar hooks) ─────────────
function abrirDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_V);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        s.createIndex("iglesiaId", "iglesiaId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// ─── Tipos del fichero exportado ──────────────────────────────────────────────
interface FotoExportada {
  iglesiaId: string;
  nombre: string;
  tamano: number;
  fecha: number;
  dataUrl: string; // base64 de la imagen
}

interface DatosExportados {
  version: 2;
  exportadoEn: string;
  visitadas: string[];
  colores: Record<string, string | null>;
  fotos: FotoExportada[];
}

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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, []);

  // ── Exportar: visitadas + colores + fotos (con imágenes en base64) ──────────
  const exportar = useCallback(
    async (nombreFichero = "mazo-iglesias-backup.json") => {
      try {
        // 1. Visitadas
        const listaVisitadas = Array.from(visitadas);

        // 2. Colores
        let colores: Record<string, string | null> = {};
        try {
          colores = JSON.parse(localStorage.getItem(COLORES_KEY) || "{}");
        } catch {}

        // 3. Fotos desde IndexedDB → base64
        const fotos: FotoExportada[] = [];
        try {
          const db = await abrirDB();
          const allFotos = await new Promise<any[]>((resolve) => {
            const tx = db.transaction(STORE, "readonly");
            const req = tx.objectStore(STORE).getAll();
            req.onsuccess = () => resolve(req.result);
          });

          for (const foto of allFotos) {
            const dataUrl = await blobToBase64(foto.blob);
            fotos.push({
              iglesiaId: foto.iglesiaId,
              nombre: foto.nombre,
              tamano: foto.tamano,
              fecha: foto.fecha,
              dataUrl,
            });
          }
        } catch {
          // Si falla IndexedDB, exportamos sin fotos
        }

        const datos: DatosExportados = {
          version: 2,
          exportadoEn: new Date().toISOString(),
          visitadas: listaVisitadas,
          colores,
          fotos,
        };

        const json = JSON.stringify(datos, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nombreFichero;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        alert("Error al exportar los datos.");
      }
    },
    [visitadas]
  );

  // ── Importar: soporta el formato antiguo (solo array) y el nuevo v2 ─────────
  const importar = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const raw = JSON.parse(e.target?.result as string);

          // ── Formato antiguo (v1): solo un array de IDs ──
          if (Array.isArray(raw)) {
            setVisitadas((prev) => {
              const merged = new Set(Array.from(prev).concat(raw));
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(merged)));
              } catch {}
              return merged;
            });
            return;
          }

          // ── Formato nuevo (v2): objeto con visitadas, colores, fotos ──
          const datos = raw as DatosExportados;

          // 1. Visitadas
          if (Array.isArray(datos.visitadas)) {
            setVisitadas((prev) => {
              const merged = new Set(Array.from(prev).concat(datos.visitadas));
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(merged)));
              } catch {}
              return merged;
            });
          }

          // 2. Colores (merge)
          if (datos.colores && typeof datos.colores === "object") {
            try {
              const existentes = JSON.parse(localStorage.getItem(COLORES_KEY) || "{}");
              const merged = { ...existentes, ...datos.colores };
              localStorage.setItem(COLORES_KEY, JSON.stringify(merged));
            } catch {}
          }

          // 3. Fotos → IndexedDB
          if (Array.isArray(datos.fotos) && datos.fotos.length > 0) {
            try {
              const db = await abrirDB();

              // Obtener iglesiaIds que ya tienen fotos para evitar duplicados
              const existentes = await new Promise<any[]>((resolve) => {
                const tx = db.transaction(STORE, "readonly");
                const req = tx.objectStore(STORE).getAll();
                req.onsuccess = () => resolve(req.result);
              });

              const existenteSet = new Set(
                existentes.map((f: any) => `${f.iglesiaId}::${f.nombre}::${f.fecha}`)
              );

              const tx = db.transaction(STORE, "readwrite");
              const store = tx.objectStore(STORE);

              for (const foto of datos.fotos) {
                const clave = `${foto.iglesiaId}::${foto.nombre}::${foto.fecha}`;
                if (existenteSet.has(clave)) continue; // saltar duplicados

                const blob = base64ToBlob(foto.dataUrl);
                store.add({
                  iglesiaId: foto.iglesiaId,
                  nombre: foto.nombre,
                  tamano: foto.tamano,
                  fecha: foto.fecha,
                  blob,
                });
              }

              await new Promise<void>((resolve) => {
                tx.oncomplete = () => resolve();
              });
            } catch {
              // Si falla la importación de fotos, no romper el flujo
            }
          }

          alert(
            `Importación completada:\n• ${datos.visitadas?.length ?? 0} iglesias visitadas\n• ${Object.keys(datos.colores ?? {}).length} etiquetas de color\n• ${datos.fotos?.length ?? 0} fotos`
          );
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
