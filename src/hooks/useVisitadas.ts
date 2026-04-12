"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "iglesias-visitadas";
const COLORES_KEY = "mazo-iglesias-colores";
const JUGADOR_KEY = "mazo-iglesias-jugador";
const DB_NAME = "mazo-iglesias-fotos";
const STORE = "fotos";
const DB_V = 1;

// ─── IndexedDB helpers ────────────────────────────────────────────────────────
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

function generarNombreFichero(): string {
  const hoy = new Date();
  const dd = String(hoy.getDate()).padStart(2, "0");
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const yyyy = hoy.getFullYear();
  return `mazo_iglesias_export_${dd}_${mm}_${yyyy}.json`;
}

// ─── Tipos del fichero exportado ──────────────────────────────────────────────
interface FotoExportada {
  iglesiaId: string;
  nombre: string;
  tamano: number;
  fecha: number;
  dataUrl: string;
}

interface DatosExportados {
  version: 3;
  jugador: string;
  exportadoEn: string;
  visitadas: string[];
  colores: Record<string, string | null>;
  fotos: FotoExportada[];
}

// ─── Construir los datos exportables ──────────────────────────────────────────
async function construirDatos(
  visitadas: Set<string>,
  conFotos: boolean
): Promise<DatosExportados> {
  const jugador = localStorage.getItem(JUGADOR_KEY) || "Anónimo";
  const listaVisitadas = Array.from(visitadas);

  let colores: Record<string, string | null> = {};
  try {
    colores = JSON.parse(localStorage.getItem(COLORES_KEY) || "{}");
  } catch {}

  const fotos: FotoExportada[] = [];
  if (conFotos) {
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
    } catch {}
  }

  return {
    version: 3,
    jugador,
    exportadoEn: new Date().toISOString(),
    visitadas: listaVisitadas,
    colores,
    fotos,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
export function useVisitadas() {
  const [visitadas, setVisitadas] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setVisitadas(new Set(JSON.parse(stored) as string[]));
      }
    } catch {}
  }, []);

  const toggleVisitada = useCallback((id: string) => {
    setVisitadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, []);

  // ── Exportar (descarga fichero) ─────────────────────────────────────────────
  const exportar = useCallback(
    async (conFotos = true) => {
      try {
        const datos = await construirDatos(visitadas, conFotos);
        const json = JSON.stringify(datos, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = generarNombreFichero();
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        alert("Error al exportar los datos.");
      }
    },
    [visitadas]
  );

  // ── Compartir (Web Share API → WhatsApp, email, etc.) ───────────────────────
  const compartir = useCallback(
    async (conFotos = false) => {
      try {
        const datos = await construirDatos(visitadas, conFotos);
        const json = JSON.stringify(datos, null, 2);
        const nombre = generarNombreFichero();

        // 1) Intentar compartir con fichero adjunto (móvil)
        if (typeof navigator.share === "function") {
          const file = new File([json], nombre, { type: "application/json" });

          let puedeCompartirArchivo = false;
          try {
            puedeCompartirArchivo =
              typeof navigator.canShare === "function" &&
              navigator.canShare({ files: [file] });
          } catch {
            // canShare puede lanzar en algunos navegadores
          }

          if (puedeCompartirArchivo) {
            await navigator.share({
              title: "Mi progreso en MazoIglesias",
              text: `¡Llevo ${datos.visitadas.length} iglesias visitadas! 🏛️⛪`,
              files: [file],
            });
            return;
          }

          // 2) Fallback: compartir solo texto (sin fichero)
          try {
            await navigator.share({
              title: "Mi progreso en MazoIglesias",
              text: `¡Llevo ${datos.visitadas.length} iglesias visitadas en MazoIglesias! 🏛️⛪`,
            });
            return;
          } catch {
            // Si también falla, caemos al fallback de descarga
          }
        }

        // 3) Fallback final: descargar el fichero
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nombre;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err: any) {
        // AbortError = el usuario canceló el diálogo de compartir
        if (err?.name !== "AbortError") {
          console.error("Error al compartir:", err);
          // Fallback de emergencia: descargar
          try {
            const datos = await construirDatos(visitadas, conFotos);
            const json = JSON.stringify(datos, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = generarNombreFichero();
            a.click();
            URL.revokeObjectURL(url);
          } catch {
            alert("No se pudo compartir. Prueba con Exportar ↓ en su lugar.");
          }
        }
      }
    },
    [visitadas]
  );

  // ── Importar (retrocompatible con v1, v2 y v3) ─────────────────────────────
  const importar = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);

        // ── Formato v1: solo array ──
        if (Array.isArray(raw)) {
          setVisitadas((prev) => {
            const merged = new Set(Array.from(prev).concat(raw));
            try {
              localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(Array.from(merged))
              );
            } catch {}
            return merged;
          });
          return;
        }

        // ── Formato v2/v3: objeto ──
        const datos = raw as DatosExportados;

        // 1. Visitadas
        if (Array.isArray(datos.visitadas)) {
          setVisitadas((prev) => {
            const merged = new Set(Array.from(prev).concat(datos.visitadas));
            try {
              localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(Array.from(merged))
              );
            } catch {}
            return merged;
          });
        }

        // 2. Colores (merge)
        if (datos.colores && typeof datos.colores === "object") {
          try {
            const existentes = JSON.parse(
              localStorage.getItem(COLORES_KEY) || "{}"
            );
            const merged = { ...existentes, ...datos.colores };
            localStorage.setItem(COLORES_KEY, JSON.stringify(merged));
          } catch {}
        }

        // 3. Fotos → IndexedDB
        if (Array.isArray(datos.fotos) && datos.fotos.length > 0) {
          try {
            const db = await abrirDB();
            const existentes = await new Promise<any[]>((resolve) => {
              const tx = db.transaction(STORE, "readonly");
              const req = tx.objectStore(STORE).getAll();
              req.onsuccess = () => resolve(req.result);
            });
            const existenteSet = new Set(
              existentes.map(
                (f: any) => `${f.iglesiaId}::${f.nombre}::${f.fecha}`
              )
            );
            const tx = db.transaction(STORE, "readwrite");
            const store = tx.objectStore(STORE);
            for (const foto of datos.fotos) {
              const clave = `${foto.iglesiaId}::${foto.nombre}::${foto.fecha}`;
              if (existenteSet.has(clave)) continue;
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
          } catch {}
        }

        alert(
          `Importación completada:\n• ${datos.visitadas?.length ?? 0} iglesias visitadas\n• ${Object.keys(datos.colores ?? {}).length} etiquetas de color\n• ${datos.fotos?.length ?? 0} fotos`
        );
      } catch {
        alert("Fichero JSON no válido.");
      }
    };
    reader.readAsText(file);
  }, []);

  return { visitadas, toggleVisitada, exportar, compartir, importar };
}
