"use client";

import { useRef, useCallback, useEffect, useMemo, useState } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import Supercluster from "supercluster";
import Link from "next/link";
import type { Parroquia } from "@/types/parroquia";

// ─── Estilo de mapa (CartoDB Voyager — colorido, neutro, sin banderas) ───
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

// ─── Centros de ciudad ───
const MADRID_CENTER = { longitude: -3.7038, latitude: 40.4168 };
const BCN_CENTER = { longitude: 2.1534, latitude: 41.3879 };
const DEFAULT_ZOOM = 11;

// ─── SVG de marcadores — Ámbar (Madrid) ───
const PIN_DEFAULT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
  <path fill="#b45309" stroke="#fff" stroke-width="1.5" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.9 12.5 28.5 12.5 28.5S25 21.4 25 12.5C25 5.6 19.4 0 12.5 0z"/>
  <circle cx="12.5" cy="12.5" r="5" fill="white"/>
</svg>`;

const PIN_SELECTED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 49" width="30" height="49">
  <path fill="#92400e" stroke="#fff" stroke-width="2" d="M15 0C6.7 0 0 6.7 0 15c0 10.7 15 34 15 34S30 25.7 30 15C30 6.7 23.3 0 15 0z"/>
  <circle cx="15" cy="15" r="6" fill="white"/>
</svg>`;

// ─── SVG de marcadores — Azul (Barcelona) ───
const PIN_DEFAULT_BCN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
  <path fill="#1d4ed8" stroke="#fff" stroke-width="1.5" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.9 12.5 28.5 12.5 28.5S25 21.4 25 12.5C25 5.6 19.4 0 12.5 0z"/>
  <circle cx="12.5" cy="12.5" r="5" fill="white"/>
</svg>`;

const PIN_SELECTED_BCN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 49" width="30" height="49">
  <path fill="#1e3a8a" stroke="#fff" stroke-width="2" d="M15 0C6.7 0 0 6.7 0 15c0 10.7 15 34 15 34S30 25.7 30 15C30 6.7 23.3 0 15 0z"/>
  <circle cx="15" cy="15" r="6" fill="white"/>
</svg>`;

// ─── SVG de marcadores — Verde (visitadas, ambas ciudades) ───
const PIN_VISITED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
  <path fill="#22c55e" stroke="#fff" stroke-width="1.5" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.9 12.5 28.5 12.5 28.5S25 21.4 25 12.5C25 5.6 19.4 0 12.5 0z"/>
  <text x="12.5" y="18" text-anchor="middle" fill="white" font-size="14" font-weight="bold">✓</text>
</svg>`;

const PIN_VISITED_SELECTED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 49" width="30" height="49">
  <path fill="#16a34a" stroke="#fff" stroke-width="2" d="M15 0C6.7 0 0 6.7 0 15c0 10.7 15 34 15 34S30 25.7 30 15C30 6.7 23.3 0 15 0z"/>
  <text x="15" y="21" text-anchor="middle" fill="white" font-size="16" font-weight="bold">✓</text>
</svg>`;

// ─── Helpers ───
function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ─── Tipos para Supercluster ───
interface ParroquiaProperties {
  parroquia: Parroquia;
  cluster: false;
}

type ParroquiaPoint = Supercluster.PointFeature<ParroquiaProperties>;

// ─── Componente Principal ───
interface MapaParroquiasProps {
  parroquias: Parroquia[];
  seleccionada: Parroquia | null;
  visitadas: Set<string>;
  onSeleccionar: (parroquia: Parroquia) => void;
  ciudad: "madrid" | "barcelona";
}

export default function MapaParroquias({
  parroquias,
  seleccionada,
  visitadas,
  onSeleccionar,
  ciudad,
}: MapaParroquiasProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    ...MADRID_CENTER,
    zoom: DEFAULT_ZOOM,
  });

  // ─── Geolocalización del jugador ───
  const [userPos, setUserPos] = useState<{ lng: number; lat: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({ lng: pos.coords.longitude, lat: pos.coords.latitude });
      },
      () => { /* permiso denegado o error, no pasa nada */ },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const flyToUser = useCallback(() => {
    if (userPos && mapRef.current) {
      mapRef.current.flyTo({ center: [userPos.lng, userPos.lat], zoom: 15, duration: 800 });
    }
  }, [userPos]);

  // ─── Fly al centro de la ciudad cuando cambia ───
  useEffect(() => {
    const center = ciudad === "barcelona" ? BCN_CENTER : MADRID_CENTER;
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [center.longitude, center.latitude], zoom: DEFAULT_ZOOM, duration: 900 });
    } else {
      setViewState({ ...center, zoom: DEFAULT_ZOOM });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciudad]);
  const [popupInfo, setPopupInfo] = useState<Parroquia | null>(null);

  // ─── Supercluster para clustering ───
  const supercluster = useMemo(() => {
    const sc = new Supercluster<ParroquiaProperties>({
      radius: 60,
      maxZoom: 16,
    });

    const points: ParroquiaPoint[] = parroquias.map((p) => ({
      type: "Feature" as const,
      properties: { parroquia: p, cluster: false as const },
      geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
    }));

    sc.load(points);
    return sc;
  }, [parroquias]);

  // ─── Clusters visibles ───
  const clusters = useMemo(() => {
    const bounds: [number, number, number, number] = ciudad === "barcelona"
      ? [1.0, 41.0, 3.0, 42.0]   // Área de Barcelona
      : [-6, 35, -1, 44];         // España aprox.
    return supercluster.getClusters(bounds, Math.floor(viewState.zoom));
  }, [supercluster, viewState.zoom]);

  // ─── Fly a seleccionada ───
  useEffect(() => {
    if (seleccionada && mapRef.current) {
      mapRef.current.flyTo({
        center: [seleccionada.lng, seleccionada.lat],
        zoom: 14,
        duration: 800,
      });
      setPopupInfo(seleccionada);
    }
  }, [seleccionada]);

  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  }, []);

  const handleClusterClick = useCallback(
    (clusterId: number, lng: number, lat: number) => {
      const zoom = supercluster.getClusterExpansionZoom(clusterId);
      mapRef.current?.flyTo({ center: [lng, lat], zoom, duration: 500 });
    },
    [supercluster]
  );

  const getPin = (parroquia: Parroquia): string => {
    const esVisitada = visitadas.has(parroquia.id);
    const esSeleccionada = seleccionada?.id === parroquia.id;
    if (esVisitada && esSeleccionada) return PIN_VISITED_SELECTED;
    if (esVisitada) return PIN_VISITED;
    if (esSeleccionada) return ciudad === "barcelona" ? PIN_SELECTED_BCN : PIN_SELECTED;
    return ciudad === "barcelona" ? PIN_DEFAULT_BCN : PIN_DEFAULT;
  };

  const getPinClass = (parroquia: Parroquia): string => {
    const esVisitada = visitadas.has(parroquia.id);
    const esSeleccionada = seleccionada?.id === parroquia.id;
    if (esVisitada && esSeleccionada) return "marker-visited-selected";
    if (esVisitada) return "marker-visited";
    if (esSeleccionada) return "marker-selected";
    return "marker-default";
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      {/* Botón centrar en mi ubicación */}
      {userPos && (
        <button
          onClick={flyToUser}
          title="Ir a mi ubicación"
          className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-md transition hover:bg-slate-50 active:bg-slate-100"
        >
          📍
        </button>
      )}
      <div className="h-[60vh] lg:h-[80vh]">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={handleMove}
          mapStyle={MAP_STYLE}
          attributionControl={true}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-right" />

          {/* Ubicación del jugador */}
          {userPos && (
            <Marker longitude={userPos.lng} latitude={userPos.lat} anchor="center">
              <div className="user-location-dot" title="Tu ubicación" />
            </Marker>
          )}

          {clusters.map((feature) => {
            const [lng, lat] = feature.geometry.coordinates;
            const isCluster = feature.properties.cluster;

            if (isCluster) {
              const { cluster_id, point_count } = feature.properties as {
                cluster_id: number;
                point_count: number;
              };
              const size = Math.min(24 + point_count * 0.5, 50);

              return (
                <Marker
                  key={`cluster-${cluster_id}`}
                  longitude={lng}
                  latitude={lat}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    handleClusterClick(cluster_id, lng, lat);
                  }}
                >
                  <div
                    className="cluster-marker"
                    style={{ width: size, height: size }}
                  >
                    {point_count}
                  </div>
                </Marker>
              );
            }

            // Marcador individual
            const parroquia = (feature.properties as ParroquiaProperties)
              .parroquia;
            return (
              <Marker
                key={parroquia.id}
                longitude={lng}
                latitude={lat}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  onSeleccionar(parroquia);
                  setPopupInfo(parroquia);
                }}
              >
                <img
                  src={svgToDataUrl(getPin(parroquia))}
                  alt={parroquia.nombre}
                  className={getPinClass(parroquia)}
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
                <p className="text-xs text-slate-500">
                  {popupInfo.cp} — {popupInfo.poblacion}
                </p>
                <p className="mt-1 text-xs font-medium text-amber-700">
                  Vicaría {popupInfo.vicaria}
                </p>
                {visitadas.has(popupInfo.id) && (
                  <p className="mt-0.5 text-xs font-medium text-green-600">
                    ✓ Visitada
                  </p>
                )}
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
  );
}
