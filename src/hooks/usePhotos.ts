"use client";

import { useCallback, useEffect, useState } from "react";

// ─── Constantes ───────────────────────────────────────────────────────────────
const DB_NAME = "mazo-iglesias-fotos";
const STORE = "fotos";
const DB_V = 1;
const MAX_BYTES = 500 * 1024 * 1024; // 500 MB
const MAX_LADO = 1920; // Redimensionamos fotos al cargar

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface Foto {
  id: number;
  iglesiaId: string;
  nombre: string;
  tamano: number; // bytes originales (tras resize)
  fecha: number;  // timestamp
  blob: Blob;
}

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

// ─── Redimensionar imagen con canvas ─────────────────────────────────────────
function redimensionar(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const srcUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(srcUrl);
      let { width, height } = img;
      if (width > MAX_LADO || height > MAX_LADO) {
        if (width >= height) { height = Math.round(height * MAX_LADO / width); width = MAX_LADO; }
        else { width = Math.round(width * MAX_LADO / height); height = MAX_LADO; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.85);
    };
    img.src = srcUrl;
  });
}

// ─── Hook principal ───────────────────────────────────────────────────────────
export function usePhotos(iglesiaId: string) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [bytesUsados, setBytesUsados] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular total de bytes de TODAS las iglesias
  const calcularBytes = useCallback(async () => {
    const db = await abrirDB();
    return new Promise<number>((resolve) => {
      let total = 0;
      const tx = db.transaction(STORE, "readonly");
      const store = tx.objectStore(STORE);
      const req = store.openCursor();
      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) { total += (cursor.value.tamano as number); cursor.continue(); }
        else resolve(total);
      };
    });
  }, []);

  // Cargar fotos de esta iglesia
  const cargarFotos = useCallback(async () => {
    const db = await abrirDB();
    const tx = db.transaction(STORE, "readonly");
    const idx = tx.objectStore(STORE).index("iglesiaId");
    const req = idx.getAll(iglesiaId);
    req.onsuccess = () => {
      setFotos((req.result as Foto[]).sort((a, b) => b.fecha - a.fecha));
    };
    const bytes = await calcularBytes();
    setBytesUsados(bytes);
  }, [iglesiaId, calcularBytes]);

  useEffect(() => { cargarFotos(); }, [cargarFotos]);

  // Añadir foto
  const addFoto = useCallback(async (file: File) => {
    setError(null);
    setCargando(true);
    try {
      const blob = await redimensionar(file);
      const bytes = await calcularBytes();

      if (bytes + blob.size > MAX_BYTES) {
        setError(
          `Límite de 500 MB alcanzado. Usados: ${formatBytes(bytes)}. Esta foto ocupa ${formatBytes(blob.size)}.`
        );
        return;
      }

      const db = await abrirDB();
      const record = { iglesiaId, nombre: file.name, tamano: blob.size, fecha: Date.now(), blob };
      await new Promise<void>((res, rej) => {
        const tx = db.transaction(STORE, "readwrite");
        const req = tx.objectStore(STORE).add(record);
        req.onsuccess = () => res();
        req.onerror = () => rej(req.error);
      });
      await cargarFotos();
    } catch (e) {
      setError("Error al guardar la foto.");
    } finally {
      setCargando(false);
    }
  }, [iglesiaId, calcularBytes, cargarFotos]);

  // Eliminar foto
  const deleteFoto = useCallback(async (id: number) => {
    const db = await abrirDB();
    await new Promise<void>((res) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => res();
    });
    await cargarFotos();
  }, [cargarFotos]);

  return { fotos, bytesUsados, maxBytes: MAX_BYTES, cargando, error, addFoto, deleteFoto };
}

// ─── Utilidad ─────────────────────────────────────────────────────────────────
export function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
