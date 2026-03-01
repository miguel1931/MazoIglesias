"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { Parroquia } from "@/types/parroquia";

// Fix para los iconos de marcador de Leaflet en Next.js
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

L.Marker.prototype.options.icon = defaultIcon;

// Centrado de Madrid
const MADRID_CENTER: [number, number] = [40.4168, -3.7038];
const DEFAULT_ZOOM = 11;

// Componente interno para centrar un marcador seleccionado
function CentrarEnSeleccion({
  seleccionada,
}: {
  seleccionada: Parroquia | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (seleccionada) {
      map.flyTo([seleccionada.lat, seleccionada.lng], 14, {
        duration: 0.8,
      });
    }
  }, [seleccionada, map]);

  return null;
}

interface MapaParroquiasProps {
  parroquias: Parroquia[];
  seleccionada: Parroquia | null;
  onSeleccionar: (parroquia: Parroquia) => void;
}

export default function MapaParroquias({
  parroquias,
  seleccionada,
  onSeleccionar,
}: MapaParroquiasProps) {
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
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <CentrarEnSeleccion seleccionada={seleccionada} />

          {parroquias.map((parroquia) => (
            <Marker
              key={parroquia.id}
              position={[parroquia.lat, parroquia.lng]}
              icon={
                seleccionada?.id === parroquia.id ? selectedIcon : defaultIcon
              }
              eventHandlers={{
                click: () => onSeleccionar(parroquia),
              }}
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
        </MapContainer>
      </div>
    </div>
  );
}
