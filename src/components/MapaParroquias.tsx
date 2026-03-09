"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "react-leaflet-cluster/lib/assets/MarkerCluster.css";
import "react-leaflet-cluster/lib/assets/MarkerCluster.Default.css";
import L from "leaflet";
import Link from "next/link";
import type { Parroquia } from "@/types/parroquia";

// Icono azul por defecto
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Icono azul grande (seleccionado)
const selectedIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: "selected-marker",
});

// Icono verde (visitada)
const visitedIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
    <path fill="#22c55e" stroke="#fff" stroke-width="1.5" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.9 12.5 28.5 12.5 28.5S25 21.4 25 12.5C25 5.6 19.4 0 12.5 0z"/>
    <text x="12.5" y="18" text-anchor="middle" fill="white" font-size="14" font-weight="bold">✓</text>
  </svg>`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "",
});

// Icono verde grande (visitada + seleccionada)
const visitedSelectedIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 49" width="30" height="49">
    <path fill="#16a34a" stroke="#fff" stroke-width="2" d="M15 0C6.7 0 0 6.7 0 15c0 10.7 15 34 15 34S30 25.7 30 15C30 6.7 23.3 0 15 0z"/>
    <text x="15" y="21" text-anchor="middle" fill="white" font-size="16" font-weight="bold">✓</text>
  </svg>`,
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  className: "",
});

L.Marker.prototype.options.icon = defaultIcon;

const MADRID_CENTER: [number, number] = [40.4168, -3.7038];
const DEFAULT_ZOOM = 11;

function CentrarEnSeleccion({ seleccionada }: { seleccionada: Parroquia | null }) {
  const map = useMap();
  useEffect(() => {
    if (seleccionada) {
      map.flyTo([seleccionada.lat, seleccionada.lng], 14, { duration: 0.8 });
    }
  }, [seleccionada, map]);
  return null;
}

interface MapaParroquiasProps {
  parroquias: Parroquia[];
  seleccionada: Parroquia | null;
  visitadas: Set<string>;
  onSeleccionar: (parroquia: Parroquia) => void;
}

export default function MapaParroquias({
  parroquias,
  seleccionada,
  visitadas,
  onSeleccionar,
}: MapaParroquiasProps) {
  const getIcon = (parroquia: Parroquia) => {
    const esVisitada = visitadas.has(parroquia.id);
    const esSeleccionada = seleccionada?.id === parroquia.id;
    if (esVisitada && esSeleccionada) return visitedSelectedIcon;
    if (esVisitada) return visitedIcon;
    if (esSeleccionada) return selectedIcon;
    return defaultIcon;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <div className="h-[60vh] lg:h-[80vh]">
        <MapContainer
          center={MADRID_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />

          <CentrarEnSeleccion seleccionada={seleccionada} />

          <MarkerClusterGroup chunkedLoading>
            {parroquias.map((parroquia) => (
              <Marker
                key={parroquia.id}
                position={[parroquia.lat, parroquia.lng]}
                icon={getIcon(parroquia)}
                eventHandlers={{ click: () => onSeleccionar(parroquia) }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="text-sm font-bold text-slate-800">
                      {parroquia.nombre}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {parroquia.direccion}
                    </p>
                    <p className="text-xs text-slate-500">
                      {parroquia.cp} — {parroquia.poblacion}
                    </p>
                    <p className="mt-1 text-xs font-medium text-amber-700">
                      Vicaría {parroquia.vicaria}
                    </p>
                    {visitadas.has(parroquia.id) && (
                      <p className="mt-0.5 text-xs font-medium text-green-600">
                        ✓ Visitada
                      </p>
                    )}
                    <Link
                      href={`/parroquia/${parroquia.id}`}
                      className="mt-2 inline-block text-xs font-semibold text-amber-700 underline underline-offset-2"
                    >
                      Ver detalle →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}
