"use client";

import { useRef, useState, useMemo } from "react";
import type { DatosAmigo } from "@/hooks/useAmigos";
import type { Parroquia } from "@/types/parroquia";
import dynamic from "next/dynamic";

const MapaComparativo = dynamic(() => import("./MapaComparativo"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[50vh] items-center justify-center rounded-xl bg-slate-100">
      <p className="animate-pulse text-slate-400">Cargando mapa…</p>
    </div>
  ),
});

interface PanelAmigosProps {
  nombreJugador: string;
  visitadas: Set<string>;
  numFotosPropias: number;
  amigos: DatosAmigo[];
  onCargarAmigo: (file: File) => Promise<{ ok: boolean; mensaje: string }>;
  onEliminarAmigo: (nombre: string) => void;
  parroquias: Parroquia[];
  ciudad: "madrid" | "barcelona";
}

interface JugadorRanking {
  nombre: string;
  iglesias: number;
  fotos: number;
  esTu: boolean;
  visitadas: string[];
  ultimaAct?: string;
}

export default function PanelAmigos({
  nombreJugador,
  visitadas,
  numFotosPropias,
  amigos,
  onCargarAmigo,
  onEliminarAmigo,
  parroquias,
  ciudad,
}: PanelAmigosProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState<{ ok: boolean; text: string } | null>(null);
  const [amigoComparar, setAmigoComparar] = useState<string | null>(null);

  // ── Construir ranking ───────────────────────────────────────────────────────
  const ranking: JugadorRanking[] = useMemo(() => {
    const yo: JugadorRanking = {
      nombre: nombreJugador,
      iglesias: visitadas.size,
      fotos: numFotosPropias,
      esTu: true,
      visitadas: Array.from(visitadas),
    };
    const otros: JugadorRanking[] = amigos.map((a) => ({
      nombre: a.nombre,
      iglesias: a.visitadas.length,
      fotos: a.numFotos,
      esTu: false,
      visitadas: a.visitadas,
      ultimaAct: a.ultimaActualizacion,
    }));
    return [yo, ...otros].sort((a, b) => b.iglesias - a.iglesias || b.fotos - a.fotos);
  }, [nombreJugador, visitadas, numFotosPropias, amigos]);

  const totalIglesias = parroquias.length;

  // ── Datos del amigo seleccionado para comparar ──────────────────────────────
  const amigoSeleccionado = useMemo(() => {
    if (!amigoComparar) return null;
    return amigos.find((a) => a.nombre === amigoComparar) ?? null;
  }, [amigoComparar, amigos]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await onCargarAmigo(file);
    setMensaje({ ok: res.ok, text: res.mensaje });
    e.target.value = "";
    setTimeout(() => setMensaje(null), 5000);
  };

  const medalla = (pos: number) => {
    if (pos === 0) return "🥇";
    if (pos === 1) return "🥈";
    if (pos === 2) return "🥉";
    return `${pos + 1}º`;
  };

  const formatFecha = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div className="space-y-4">
      {/* ── Cabecera ── */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            👥 Amigos &amp; Ranking
          </h2>
          <p className="text-xs text-slate-400">
            Carga el JSON exportado de un amigo para comparar progreso
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
          >
            📂 Cargar amigo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      </div>

      {/* ── Mensaje de feedback ── */}
      {mensaje && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            mensaje.ok
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {mensaje.text}
        </div>
      )}

      {/* ── Ranking / Leaderboard ── */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
          <h3 className="text-sm font-bold text-slate-700">🏆 Clasificación</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {ranking.map((j, i) => {
            const pct = totalIglesias > 0 ? (j.iglesias / totalIglesias) * 100 : 0;
            const isComparing = amigoComparar === j.nombre;
            return (
              <div
                key={j.nombre}
                className={`flex items-center gap-3 px-4 py-3 transition ${
                  j.esTu
                    ? "bg-amber-50/60"
                    : isComparing
                    ? "bg-indigo-50/60"
                    : "hover:bg-slate-50"
                }`}
              >
                {/* Posición */}
                <span className="w-8 text-center text-lg">{medalla(i)}</span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {j.nombre}
                    </span>
                    {j.esTu && (
                      <span className="shrink-0 rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        TÚ
                      </span>
                    )}
                  </div>
                  {/* Barra de progreso */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          j.esTu ? "bg-amber-500" : "bg-indigo-400"
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-[10px] font-medium text-slate-400">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex shrink-0 items-center gap-3 text-xs text-slate-500">
                  <span title="Iglesias visitadas">
                    ⛪ {j.iglesias}
                  </span>
                  <span title="Fotos">
                    📷 {j.fotos}
                  </span>
                  {!j.esTu && (
                    <span className="hidden text-[10px] text-slate-300 sm:block" title="Última actualización">
                      {formatFecha(j.ultimaAct)}
                    </span>
                  )}
                </div>

                {/* Acciones para amigos */}
                {!j.esTu && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() =>
                        setAmigoComparar(isComparing ? null : j.nombre)
                      }
                      title={isComparing ? "Ocultar comparación" : "Comparar en mapa"}
                      className={`rounded-lg px-2 py-1 text-xs font-medium transition ${
                        isComparing
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-700"
                      }`}
                    >
                      🗺️
                    </button>
                    <button
                      onClick={() => onEliminarAmigo(j.nombre)}
                      title="Eliminar amigo"
                      className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {ranking.length === 1 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              Aún no tienes amigos cargados.
              <br />
              Pulsa <strong>"Cargar amigo"</strong> para añadir el JSON de un
              amigo.
            </div>
          )}
        </div>
      </div>

      {/* ── Diferencias con yo ── */}
      {amigos.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-slate-700">
            📊 Comparativa rápida
          </h3>
          <div className="space-y-2">
            {amigos.map((a) => {
              const diff = visitadas.size - a.visitadas.length;
              return (
                <div
                  key={a.nombre}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-slate-700">
                    vs {a.nombre}
                  </span>
                  <span
                    className={`font-semibold ${
                      diff > 0
                        ? "text-green-600"
                        : diff < 0
                        ? "text-red-500"
                        : "text-slate-400"
                    }`}
                  >
                    {diff > 0 ? `+${diff}` : diff === 0 ? "Empate" : diff}{" "}
                    iglesias
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Mapa comparativo ── */}
      {amigoSeleccionado && (
        <div className="space-y-2">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
            <p className="text-sm font-medium text-indigo-800">
              🗺️ Comparando con <strong>{amigoSeleccionado.nombre}</strong>
            </p>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-indigo-600">
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
                Solo tú
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-indigo-500" />
                Solo {amigoSeleccionado.nombre}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
                Ambos
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-slate-300" />
                Ninguno
              </span>
            </div>
          </div>
          <MapaComparativo
            parroquias={parroquias}
            misVisitadas={visitadas}
            amigoVisitadas={new Set(amigoSeleccionado.visitadas)}
            ciudad={ciudad}
          />
        </div>
      )}
    </div>
  );
}
