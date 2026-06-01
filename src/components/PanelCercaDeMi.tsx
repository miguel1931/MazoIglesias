"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Parroquia } from "@/types/parroquia";

const GEO_PERM_KEY = "mazo-geo-permission";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistancia(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

interface ParroquiaConDistancia extends Parroquia {
  distanciaKm: number;
}

interface PanelCercaDeMiProps {
  parroquias: Parroquia[];
  visitadas: Set<string>;
  onToggleVisitada: (id: string) => void;
  ciudad: "madrid" | "barcelona";
  onCambiarCiudad?: (ciudad: "madrid" | "barcelona") => void;
  todasMadrid: Parroquia[];
  todasBcn: Parroquia[];
}

export default function PanelCercaDeMi({
  parroquias,
  visitadas,
  onToggleVisitada,
  ciudad,
  onCambiarCiudad,
  todasMadrid,
  todasBcn,
}: PanelCercaDeMiProps) {
  const [estado, setEstado] = useState<"idle" | "cargando" | "ok" | "denegado" | "error">("idle");
  const [cercanas, setCercanas] = useState<ParroquiaConDistancia[]>([]);
  const [ciudadSugerida, setCiudadSugerida] = useState<"madrid" | "barcelona" | null>(null);
  const [abierto, setAbierto] = useState(false);

  const calcularCercanas = useCallback(
    (lat: number, lng: number, dataset: Parroquia[]) => {
      const conDist: ParroquiaConDistancia[] = dataset
        .map((p) => ({ ...p, distanciaKm: haversineKm(lat, lng, p.lat, p.lng) }))
        .sort((a, b) => a.distanciaKm - b.distanciaKm)
        .slice(0, 10);
      setCercanas(conDist);
    },
    []
  );

  const pedirGeo = useCallback(() => {
    if (!navigator.geolocation) {
      setEstado("error");
      return;
    }
    setEstado("cargando");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        try { localStorage.setItem(GEO_PERM_KEY, "granted"); } catch {}
        const { latitude: lat, longitude: lng } = pos.coords;

        // Detectar si el usuario está más cerca de Madrid o Barcelona
        const distMadrid = haversineKm(lat, lng, 40.4168, -3.7038);
        const distBcn = haversineKm(lat, lng, 41.3851, 2.1734);
        const ciudadCercana: "madrid" | "barcelona" = distBcn < distMadrid ? "barcelona" : "madrid";

        if (ciudadCercana !== ciudad) setCiudadSugerida(ciudadCercana);

        const dataset = ciudadCercana === "barcelona" ? todasBcn : todasMadrid;
        calcularCercanas(lat, lng, dataset);
        setEstado("ok");
        setAbierto(true);
      },
      () => {
        try { localStorage.removeItem(GEO_PERM_KEY); } catch {}
        setEstado("denegado");
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, [ciudad, todasMadrid, todasBcn, calcularCercanas]);

  // Auto-activar si ya tenía permiso
  useEffect(() => {
    try {
      if (localStorage.getItem(GEO_PERM_KEY) === "granted") pedirGeo();
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accentBtn =
    ciudad === "barcelona"
      ? "bg-blue-700 hover:bg-blue-800 text-white"
      : "bg-amber-700 hover:bg-amber-800 text-white";
  const accentBadge =
    ciudad === "barcelona" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700";

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Cabecera del panel */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-lg">📍</span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Cerca de mí</p>
            {estado === "ok" && cercanas.length > 0 && (
              <p className="text-xs text-slate-400">
                {cercanas[0].nombre} a {formatDistancia(cercanas[0].distanciaKm)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {estado === "idle" || estado === "denegado" || estado === "error" ? (
            <button
              onClick={pedirGeo}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 ${accentBtn}`}
            >
              {estado === "denegado" ? "Reintentar" : "Activar"}
            </button>
          ) : estado === "cargando" ? (
            <span className="animate-pulse text-xs text-slate-400">Localizando…</span>
          ) : (
            <button
              onClick={() => setAbierto((v) => !v)}
              aria-label={abierto ? "Cerrar lista de iglesias cercanas" : "Abrir lista de iglesias cercanas"}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              {abierto ? "Ocultar ▲" : "Ver lista ▼"}
            </button>
          )}
        </div>
      </div>

      {/* Sugerencia de cambio de ciudad */}
      {ciudadSugerida && ciudadSugerida !== ciudad && (
        <div className="mx-4 mb-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <span>Parece que estás en {ciudadSugerida === "barcelona" ? "Barcelona" : "Madrid"} — ¿cambiar ciudad?</span>
          <button
            onClick={() => {
              onCambiarCiudad?.(ciudadSugerida);
              setCiudadSugerida(null);
            }}
            className="ml-2 rounded-md bg-amber-700 px-2 py-1 text-white transition hover:bg-amber-800"
          >
            Cambiar
          </button>
        </div>
      )}

      {/* Mensaje de error / permiso denegado */}
      {estado === "denegado" && (
        <p className="px-4 pb-3 text-xs text-slate-400">
          Permiso de ubicación denegado. Actívalo en los ajustes del navegador.
        </p>
      )}

      {/* Lista de iglesias cercanas */}
      {abierto && estado === "ok" && cercanas.length > 0 && (
        <div className="border-t border-slate-100">
          {cercanas.map((p) => {
            const visitada = visitadas.has(p.id);
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 border-b border-slate-50 px-4 py-3 last:border-b-0 ${visitada ? "bg-green-50" : "hover:bg-slate-50"}`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`truncate text-sm font-medium leading-tight ${visitada ? "text-green-700" : "text-slate-800"}`}>
                    {p.nombre}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{p.poblacion} · <span className={`font-semibold ${visitada ? "text-green-600" : accentBadge.includes("blue") ? "text-blue-600" : "text-amber-600"}`}>{formatDistancia(p.distanciaKm)}</span></p>
                </div>
                {/* Toggle visitada — tap target mínimo 44px */}
                <button
                  onClick={() => onToggleVisitada(p.id)}
                  aria-label={visitada ? `Quitar ${p.nombre} de visitadas` : `Marcar ${p.nombre} como visitada`}
                  className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-full text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 ${
                    visitada
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "border border-slate-200 text-slate-300 hover:border-green-300 hover:text-green-500"
                  }`}
                >
                  {visitada ? "✓" : "○"}
                </button>
                <Link
                  href={`/parroquia/${p.id}`}
                  className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    ciudad === "barcelona"
                      ? "border-blue-200 text-blue-700 hover:bg-blue-50"
                      : "border-amber-200 text-amber-700 hover:bg-amber-50"
                  }`}
                >
                  Ver →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
