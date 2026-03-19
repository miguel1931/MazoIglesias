"use client";

import { useRef, useState, useEffect } from "react";
import { usePhotos, formatBytes } from "@/hooks/usePhotos";
import type { Foto } from "@/hooks/usePhotos";

interface FotosIglesiaProps {
  iglesiaId: string;
  ciudad?: "madrid" | "barcelona";
}

export default function FotosIglesia({ iglesiaId, ciudad = "madrid" }: FotosIglesiaProps) {
  const { fotos, bytesUsados, maxBytes, cargando, error, addFoto, deleteFoto } = usePhotos(iglesiaId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lightbox, setLightbox] = useState<Foto | null>(null);
  const [objectUrls, setObjectUrls] = useState<Map<number, string>>(new Map());

  // Genera Object URLs para cada blob y las revoca al desmontar
  useEffect(() => {
    const map = new Map<number, string>();
    fotos.forEach((f) => {
      map.set(f.id, URL.createObjectURL(f.blob));
    });
    setObjectUrls(map);
    return () => { map.forEach((url) => URL.revokeObjectURL(url)); };
  }, [fotos]);

  const pct = Math.min((bytesUsados / maxBytes) * 100, 100);
  const barColor =
    pct > 90 ? "bg-red-500" :
    pct > 70 ? "bg-amber-400" :
    ciudad === "barcelona" ? "bg-blue-500" : "bg-amber-500";

  const accentBtn = ciudad === "barcelona"
    ? "bg-blue-700 hover:bg-blue-800 text-white"
    : "bg-amber-700 hover:bg-amber-800 text-white";

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      await addFoto(file);
    }
  };

  return (
    <section className="space-y-3">
      {/* Cabecera + botón */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Mis fotos {fotos.length > 0 && <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{fotos.length}</span>}
        </h2>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={cargando}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition disabled:opacity-50 ${accentBtn}`}
        >
          {cargando ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <>📷 Añadir foto</>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Barra de almacenamiento */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Almacenamiento local</span>
          <span className={pct > 90 ? "font-semibold text-red-500" : ""}>
            {formatBytes(bytesUsados)} / {formatBytes(maxBytes)}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct > 90 && (
          <p className="text-[10px] font-medium text-red-500">
            ⚠️ Casi lleno — borra algunas fotos para poder añadir más
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          ⛔ {error}
        </div>
      )}

      {/* Grid de fotos */}
      {fotos.length === 0 ? (
        <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
          Sin fotos todavía — pulsa "Añadir foto" para empezar
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {fotos.map((foto) => {
            const url = objectUrls.get(foto.id);
            if (!url) return null;
            return (
              <div key={foto.id} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                <img
                  src={url}
                  alt={foto.nombre}
                  className="h-full w-full cursor-pointer object-cover transition hover:scale-105"
                  onClick={() => setLightbox(foto)}
                />
                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-black/60 px-1.5 py-1 text-[9px] text-white transition-transform group-hover:translate-y-0">
                  {formatBytes(foto.tamano)}
                </div>
                {/* Botón borrar */}
                <button
                  onClick={() => deleteFoto(foto.id)}
                  title="Eliminar foto"
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && objectUrls.get(lightbox.id) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-h-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={objectUrls.get(lightbox.id)}
              alt={lightbox.nombre}
              className="max-h-[85vh] w-auto rounded-xl object-contain shadow-2xl"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-white/70">
              <span>{new Date(lightbox.fecha).toLocaleString("es-ES")}</span>
              <span>{formatBytes(lightbox.tamano)}</span>
            </div>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
