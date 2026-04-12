"use client";

import { useRef, useCallback, useMemo, useState, useEffect } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import type { Parroquia } from "@/types/parroquia";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

const MADRID_CENTER = { longitude: -3.7038, latitude: 40.4168 };
const BCN_CENTER = { longitude: 2.1534, latitude: 41.3879 };
const DEFAULT_ZOOM = 11;

// ─── Pins SVG con colores: ámbar (solo tú), indigo (solo amigo), verde (ambos), gris (ninguno) ──

function pinSvg(fill: string, size: "sm" | "lg" = "sm"): string {
  if (size === "lg") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 49" width="30" height="49">
      <path fill="${fill}" stroke="#fff" stroke-width="2" d="M15 0C6.7 0 0 6.7 0 15c0 10.7 15 34 15 34S30 25.7 30 15C30 6.7 23.3 0 15 0z"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
    </svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
    <path fill="${fill}" stroke="#fff" stroke-width="1.5" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.9 12.5 28.5 12.5 28.5S25 21.4 25 12.5C25 5.6 19.4 0 12.5 0z"/>
    <circle cx="12.5" cy="12.5" r="5" fill="white"/>
  </svg>`;
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Colores
const COLOR_SOLO_TU = "#d97706";    // amber-600
const COLOR_SOLO_AMIGO = "#6366f1"; // indigo-500
const COLOR_AMBOS = "#22c55e";      // green-500
const COLOR_NINGUNO = "#cbd5e1";    // slate-300

type Estado = "soloTu" | "soloAmigo" | "ambos" | "ninguno";

interface MapaComparativoProps {
  parroquias: Parroquia[];
  misVisitadas: Set<string>;
  amigoVisitadas: Set<string>;
  ciudad: "madrid" | "barcelona";
}

export default function MapaComparativo({
  parroquias,
  misVisitadas,
  amigoVisitadas,
  ciudad,
}: MapaComparativoProps) {
  const mapRef = useRef<MapRef>(null);
  const center = ciudad === "barcelona" ? BCN_CENTER : MADRID_CENTER;
  const [viewState, setViewState] = useState({
    ...center,
    zoom: DEFAULT_ZOOM,
  });
  const [popupInfo, setPopupInfo] = useState<Parroquia | null>(null);
  const [filtro, setFiltro] = useState<Estado | "todos">("todos");

  useEffect(() => {
    const c = ciudad === "barcelona" ? BCN_CENTER : MADRID_CENTER;
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [c.longitude, c.latitude], zoom: DEFAULT_ZOOM, duration: 900 });
    } else {
      setViewState({ ...c, zoom: DEFAULT_ZOOM });
    }
  }, [ciudad]);

  const getEstado = useCallback(
    (id: string): Estado => {
      const yo = misVisitadas.has(id);
      const amigo = amigoVisitadas.has(id);
      if (yo && amigo) return "ambos";
      if (yo) return "soloTu";
      if (amigo) return "soloAmigo";
      return "ninguno";
    },
    [misVisitadas, amigoVisitadas]
  );

  const getColor = (estado: Estado): string => {
    switch (estado) {
      case "soloTu": return COLOR_SOLO_TU;
      case "soloAmigo": return COLOR_SOLO_AMIGO;
      case "ambos": return COLOR_AMBOS;
      case "ninguno": return COLOR_NINGUNO;
    }
  };

  const parroquiasFiltradas = useMemo(() => {
    if (filtro === "todos") return parroquias;
    return parroquias.filter((p) => getEstado(p.id) === filtro);
  }, [parroquias, filtro, getEstado]);

  // Contadores
  const contadores = useMemo(() => {
    let soloTu = 0, soloAmigo = 0, ambos = 0, ninguno = 0;
    parroquias.forEach((p) => {
      const e = getEstado(p.id);
      if (e === "soloTu") soloTu++;
      else if (e === "soloAmigo") soloAmigo++;
      else if (e === "ambos") ambos++;
      else ninguno++;
    });
    return { soloTu, soloAmigo, ambos, ninguno };
  }, [parroquias, getEstado]);

  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  }, []);

  const filtros: { key: Estado | "todos"; label: string; color?: string; count: number }[] = [
    { key: "todos", label: "Todos", count: parroquias.length },
    { key: "soloTu", label: "Solo tú", color: COLOR_SOLO_TU, count: contadores.soloTu },
    { key: "soloAmigo", label: "Solo amigo", color: COLOR_SOLO_AMIGO, count: contadores.soloAmigo },
    { key: "ambos", label: "Ambos", color: COLOR_AMBOS, count: contadores.ambos },
    { key: "ninguno", label: "Ninguno", color: COLOR_NINGUNO, count: contadores.ninguno },
  ];

  return (
    <div className="space-y-2">
      {/* Filtros rápidos */}
      <div className="flex flex-wrap gap-1.5">
        {filtros.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
              filtro === f.key
                ? "border-slate-400 bg-slate-800 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.color && (
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: f.color }}
              />
            )}
            {f.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
              filtro === f.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Mapa */}
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <div className="h-[50vh] lg:h-[60vh]">
          <Map
            ref={mapRef}
            {...viewState}
            onMove={handleMove}
            mapStyle={MAP_STYLE}
            attributionControl={true}
            style={{ width: "100%", height: "100%" }}
          >
            <NavigationControl position="top-right" />

            {parroquiasFiltradas.map((p) => {
              const estado = getEstado(p.id);
              const color = getColor(estado);
              return (
                <Marker
                  key={p.id}
                  longitude={p.lng}
                  latitude={p.lat}
                  anchor="bottom"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setPopupInfo(p);
                  }}
                >
                  <img
                    src={svgToDataUrl(pinSvg(color))}
                    alt={p.nombre}
                    className="marker-default"
                  />
                </Marker>
              );
            })}

            {popupInfo && (
              <Popup
                longitude={popupInfo.lng}
                latitude={popupInfo.lat}
                anchor="bottom"
                offset={[0, -41] as [number, number]}
                closeOnClick={false}
                onClose={() => setPopupInfo(null)}
              >
                <div className="min-w-[200px] p-3">
                  <h3 className="text-sm font-bold text-slate-800">
                    {popupInfo.nombre}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {popupInfo.direccion}
                  </p>
                  {(() => {
                    const e = getEstado(popupInfo.id);
                    const labels: Record<Estado, { text: string; cls: string }> = {
                      ambos: { text: "✓ Visitada por ambos", cls: "text-green-600" },
                      soloTu: { text: "✓ Solo tú la visitaste", cls: "text-amber-600" },
                      soloAmigo: { text: "Solo tu amigo la visitó", cls: "text-indigo-600" },
                      ninguno: { text: "Sin visitar", cls: "text-slate-400" },
                    };
                    const l = labels[e];
                    return (
                      <p className={`mt-1 text-xs font-medium ${l.cls}`}>{l.text}</p>
                    );
                  })()}
                  <Link
                    href={`/parroquia/${popupInfo.id}`}
                    className="mt-2 inline-block text-xs font-semibold text-amber-700 underline underline-offset-2"
                  >
                    Ver detalle →
                  </Link>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </div>
    </div>
  );
}
