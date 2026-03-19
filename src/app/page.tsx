"use client";

import { useState, useCallback, useMemo } from "react";
import type { Parroquia } from "@/types/parroquia";
import parroquiasDataMadrid from "../../public/parroquias.json";
import parroquiasDataBcn from "../../public/parroquias_bcn.json";
import Filtros from "@/components/Filtros";
import ListadoParroquias from "@/components/ListadoParroquias";
import { useVisitadas } from "@/hooks/useVisitadas";
import dynamic from "next/dynamic";

// Cargamos el mapa solo en el cliente (MapLibre necesita window)
const MapaParroquias = dynamic(() => import("@/components/MapaParroquias"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] items-center justify-center rounded-xl bg-slate-100 lg:h-[80vh]">
      <p className="animate-pulse text-slate-400">Cargando mapa…</p>
    </div>
  ),
});

type Ciudad = "madrid" | "barcelona";

const todasMadrid: Parroquia[] = parroquiasDataMadrid as Parroquia[];
const todasBcn: Parroquia[] = parroquiasDataBcn as Parroquia[];

export default function HomePage() {
  const [ciudad, setCiudad] = useState<Ciudad>("madrid");
  const [busqueda, setBusqueda] = useState("");
  const [vicariaSeleccionada, setVicariaSeleccionada] = useState<number | null>(null);
  const [soloVisitadas, setSoloVisitadas] = useState(false);
  const [parroquiaSeleccionada, setParroquiaSeleccionada] = useState<Parroquia | null>(null);

  const { visitadas, toggleVisitada, exportar, importar } = useVisitadas();

  const todasLasParroquias = ciudad === "madrid" ? todasMadrid : todasBcn;

  // Filtrado
  const parroquiasFiltradas = useMemo(() => {
    let lista = todasLasParroquias;

    if (vicariaSeleccionada !== null) {
      lista = lista.filter((p) => p.vicaria === vicariaSeleccionada);
    }

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

    if (soloVisitadas) {
      lista = lista.filter((p) => visitadas.has(p.id));
    }

    return lista;
  }, [busqueda, vicariaSeleccionada, soloVisitadas, visitadas, todasLasParroquias]);

  const handleFiltrar = useCallback(
    (texto: string, vicaria: number | null, soloVis: boolean) => {
      setBusqueda(texto);
      setVicariaSeleccionada(vicaria);
      setSoloVisitadas(soloVis);
    },
    []
  );

  const handleSeleccionar = useCallback((parroquia: Parroquia) => {
    setParroquiaSeleccionada((prev) =>
      prev?.id === parroquia.id ? null : parroquia
    );
  }, []);

  const handleCiudad = (c: Ciudad) => {
    setCiudad(c);
    setBusqueda("");
    setVicariaSeleccionada(null);
    setSoloVisitadas(false);
    setParroquiaSeleccionada(null);
  };

  return (
    <div className="space-y-4">
      {/* Selector de ciudad */}
      <div className="flex gap-2">
        <button
          onClick={() => handleCiudad("madrid")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all shadow-sm border ${
            ciudad === "madrid"
              ? "bg-amber-700 text-white border-amber-800 shadow-amber-200"
              : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-700"
          }`}
        >
          🏛️ Madrid
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ciudad === "madrid" ? "bg-amber-600 text-amber-100" : "bg-slate-100 text-slate-500"}`}>
            {todasMadrid.length}
          </span>
        </button>
        <button
          onClick={() => handleCiudad("barcelona")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all shadow-sm border ${
            ciudad === "barcelona"
              ? "bg-blue-700 text-white border-blue-800 shadow-blue-200"
              : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700"
          }`}
        >
          ⛪ Barcelona
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ciudad === "barcelona" ? "bg-blue-600 text-blue-100" : "bg-slate-100 text-slate-500"}`}>
            {todasBcn.length}
          </span>
        </button>
      </div>

      {/* Filtros */}
      <Filtros
        onFiltrar={handleFiltrar}
        totalVisitadas={visitadas.size}
        onExportar={exportar}
        onImportar={importar}
        ciudad={ciudad}
      />

      {/* Contador de resultados */}
      <p className="text-sm text-slate-500">
        {parroquiasFiltradas.length} iglesia
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
            visitadas={visitadas}
            onSeleccionar={handleSeleccionar}
            onToggleVisitada={toggleVisitada}
            ciudad={ciudad}
          />
        </div>

        {/* Mapa */}
        <div className="flex-1">
          <MapaParroquias
            parroquias={parroquiasFiltradas}
            seleccionada={parroquiaSeleccionada}
            visitadas={visitadas}
            onSeleccionar={handleSeleccionar}
            ciudad={ciudad}
          />
        </div>
      </div>
    </div>
  );
}
