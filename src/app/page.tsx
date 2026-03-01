"use client";

import { useState, useCallback, useMemo } from "react";
import type { Parroquia } from "@/types/parroquia";
import parroquiasData from "../../public/parroquias.json";
import Filtros from "@/components/Filtros";
import ListadoParroquias from "@/components/ListadoParroquias";
import dynamic from "next/dynamic";

// Cargamos el mapa solo en el cliente (Leaflet necesita window)
const MapaParroquias = dynamic(() => import("@/components/MapaParroquias"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] items-center justify-center rounded-xl bg-slate-100 lg:h-[80vh]">
      <p className="animate-pulse text-slate-400">Cargando mapa…</p>
    </div>
  ),
});

const todasLasParroquias: Parroquia[] = parroquiasData as Parroquia[];

export default function HomePage() {
  const [busqueda, setBusqueda] = useState("");
  const [vicariaSeleccionada, setVicariaSeleccionada] = useState<number | null>(
    null
  );
  const [parroquiaSeleccionada, setParroquiaSeleccionada] =
    useState<Parroquia | null>(null);

  // Filtrado
  const parroquiasFiltradas = useMemo(() => {
    let lista = todasLasParroquias;

    // Filtro de vicaría
    if (vicariaSeleccionada !== null) {
      lista = lista.filter((p) => p.vicaria === vicariaSeleccionada);
    }

    // Filtro de texto
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase().trim();
      lista = lista.filter(
        (p) =>
          p.nombre.toLowerCase().includes(termino) ||
          p.poblacion.toLowerCase().includes(termino) ||
          p.cp.includes(termino) ||
          p.advocacion.toLowerCase().includes(termino)
      );
    }

    return lista;
  }, [busqueda, vicariaSeleccionada]);

  const handleFiltrar = useCallback(
    (texto: string, vicaria: number | null) => {
      setBusqueda(texto);
      setVicariaSeleccionada(vicaria);
    },
    []
  );

  const handleSeleccionar = useCallback((parroquia: Parroquia) => {
    setParroquiaSeleccionada((prev) =>
      prev?.id === parroquia.id ? null : parroquia
    );
  }, []);

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Filtros onFiltrar={handleFiltrar} />

      {/* Contador de resultados */}
      <p className="text-sm text-slate-500">
        {parroquiasFiltradas.length} parroquia
        {parroquiasFiltradas.length !== 1 ? "s" : ""} encontrada
        {parroquiasFiltradas.length !== 1 ? "s" : ""}
      </p>

      {/* Layout principal: listado + mapa */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Listado lateral */}
        <div className="w-full lg:w-[380px] lg:flex-shrink-0">
          <ListadoParroquias
            parroquias={parroquiasFiltradas}
            seleccionada={parroquiaSeleccionada}
            onSeleccionar={handleSeleccionar}
          />
        </div>

        {/* Mapa */}
        <div className="flex-1">
          <MapaParroquias
            parroquias={parroquiasFiltradas}
            seleccionada={parroquiaSeleccionada}
            onSeleccionar={handleSeleccionar}
          />
        </div>
      </div>
    </div>
  );
}
