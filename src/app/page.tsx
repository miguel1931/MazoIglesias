"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Parroquia } from "@/types/parroquia";
import parroquiasDataMadrid from "../../public/parroquias.json";
import parroquiasDataBcn from "../../public/parroquias_bcn.json";
import Filtros, { type OrdenLista } from "@/components/Filtros";
import ListadoParroquias from "@/components/ListadoParroquias";
import PanelAmigos from "@/components/PanelAmigos";
import ModalNombre from "@/components/ModalNombre";
import { useVisitadas } from "@/hooks/useVisitadas";
import PanelCercaDeMi from "@/components/PanelCercaDeMi";
import { useJugador } from "@/hooks/useJugador";
import { useAmigos } from "@/hooks/useAmigos";
import dynamic from "next/dynamic";

const MapaParroquias = dynamic(() => import("@/components/MapaParroquias"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] items-center justify-center rounded-xl bg-slate-100 lg:h-[80vh]">
      <p className="animate-pulse text-slate-400">Cargando mapa…</p>
    </div>
  ),
});

type Ciudad = "madrid" | "barcelona";
type Tab = "mapa" | "amigos";
const CIUDAD_KEY = "mazo-iglesias-ciudad";

const todasMadrid: Parroquia[] = parroquiasDataMadrid as Parroquia[];
const todasBcn: Parroquia[] = parroquiasDataBcn as Parroquia[];

export default function HomePage() {
  const [ciudad, setCiudad] = useState<Ciudad>("madrid");
  const [tab, setTab] = useState<Tab>("mapa");
  const [busqueda, setBusqueda] = useState("");
  const [vicariaSeleccionada, setVicariaSeleccionada] = useState<number | null>(null);
  const [soloVisitadas, setSoloVisitadas] = useState(false);
  const [orden, setOrden] = useState<OrdenLista>("alfa");
  const [parroquiaSeleccionada, setParroquiaSeleccionada] = useState<Parroquia | null>(null);

  // ── Mostrar modal de nombre cuando se accede a la tab de amigos ──
  const [pideName, setPideName] = useState(false);

  // Restore city from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CIUDAD_KEY) as Ciudad | null;
      if (saved === "barcelona" || saved === "madrid") {
        setCiudad(saved);
      }
    } catch {}
  }, []);

  const { visitadas, toggleVisitada, exportar, compartir, importar } = useVisitadas();
  const { nombre: nombreJugador, cargado: jugadorCargado, setNombre } = useJugador();
  const { amigos, cargarAmigo, eliminarAmigo } = useAmigos();

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
    // Ordenar
    if (orden === "alfa") {
      lista = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    } else if (orden === "vicaria") {
      lista = [...lista].sort((a, b) => a.vicaria - b.vicaria || a.nombre.localeCompare(b.nombre, "es"));
    } else if (orden === "visitadas-primero") {
      lista = [...lista].sort((a, b) => {
        const va = visitadas.has(a.id) ? 0 : 1;
        const vb = visitadas.has(b.id) ? 0 : 1;
        return va - vb || a.nombre.localeCompare(b.nombre, "es");
      });
    } else if (orden === "pendientes-primero") {
      lista = [...lista].sort((a, b) => {
        const va = visitadas.has(a.id) ? 1 : 0;
        const vb = visitadas.has(b.id) ? 1 : 0;
        return va - vb || a.nombre.localeCompare(b.nombre, "es");
      });
    }
    return lista;
  }, [busqueda, vicariaSeleccionada, soloVisitadas, orden, visitadas, todasLasParroquias]);

  const handleFiltrar = useCallback(
    (texto: string, vicaria: number | null, soloVis: boolean) => {
      setBusqueda(texto);
      setVicariaSeleccionada(vicaria);
      setSoloVisitadas(soloVis);
    },
    []
  );

  const handleSeleccionar = useCallback((parroquia: Parroquia) => {
    setParroquiaSeleccionada((prev: Parroquia | null) =>
      prev?.id === parroquia.id ? null : parroquia
    );
  }, []);

  const handleCiudad = (c: Ciudad) => {
    setCiudad(c);
    setBusqueda("");
    setVicariaSeleccionada(null);
    setSoloVisitadas(false);
    setParroquiaSeleccionada(null);
    try {
      localStorage.setItem(CIUDAD_KEY, c);
    } catch {}
  };

  // ── Cuando se pulsa la tab "Amigos", pedir nombre si no lo tiene ──
  const handleTabAmigos = () => {
    if (!nombreJugador && jugadorCargado) {
      setPideName(true);
    }
    setTab("amigos");
  };

  const handleGuardarNombre = (n: string) => {
    setNombre(n);
    setPideName(false);
  };

  // Contar fotos propias (approximate, from IndexedDB we'd need to query)
  // We'll pass 0 for now and let PanelAmigos show it
  // Actually let's add a simple counter via effect
  const [numFotosPropias, setNumFotosPropias] = useState(0);
  useEffect(() => {
    (async () => {
      try {
        const req = indexedDB.open("mazo-iglesias-fotos", 1);
        req.onsuccess = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains("fotos")) {
            setNumFotosPropias(0);
            return;
          }
          const tx = db.transaction("fotos", "readonly");
          const countReq = tx.objectStore("fotos").count();
          countReq.onsuccess = () => setNumFotosPropias(countReq.result);
        };
      } catch {
        setNumFotosPropias(0);
      }
    })();
  }, [visitadas]); // re-count when visitadas changes (proxy for activity)

  const totalIglesias = todasLasParroquias.length;
  const pctVisitadas = totalIglesias > 0 ? Math.round((visitadas.size / totalIglesias) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* ── Modal nombre ── */}
      {pideName && !nombreJugador && (
        <ModalNombre onGuardar={handleGuardarNombre} />
      )}

      {/* ── Selector de ciudad + progreso ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCiudad("madrid")}
            aria-label="Ver parroquias de Madrid"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all border ${
              ciudad === "madrid"
                ? "bg-amber-700 text-white border-amber-800 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-700"
            }`}
          >
            🏛️ Madrid
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${ciudad === "madrid" ? "bg-amber-600 text-amber-100" : "bg-slate-100 text-slate-500"}`}>
              {todasMadrid.length}
            </span>
          </button>
          <button
            onClick={() => handleCiudad("barcelona")}
            aria-label="Ver parroquias de Barcelona"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all border ${
              ciudad === "barcelona"
                ? "bg-blue-700 text-white border-blue-800 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700"
            }`}
          >
            ⛪ Barcelona
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${ciudad === "barcelona" ? "bg-blue-600 text-blue-100" : "bg-slate-100 text-slate-500"}`}>
              {todasBcn.length}
            </span>
          </button>
        </div>

        {/* Badge de progreso */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-700">
              {visitadas.size} <span className="font-normal text-slate-400">/ {totalIglesias} visitadas</span>
            </p>
            <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${ciudad === "barcelona" ? "bg-blue-500" : "bg-amber-500"}`}
                style={{ width: `${pctVisitadas}%` }}
              />
            </div>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-sm font-bold ${ciudad === "barcelona" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
            {pctVisitadas}%
          </span>
        </div>
      </div>

      {/* ── Panel Cerca de mí ── */}
      <PanelCercaDeMi
        parroquias={todasLasParroquias}
        visitadas={visitadas}
        onToggleVisitada={toggleVisitada}
        ciudad={ciudad}
        onCambiarCiudad={handleCiudad}
        todasMadrid={todasMadrid}
        todasBcn={todasBcn}
      />

      {/* Filtros */}
      <Filtros
        onFiltrar={handleFiltrar}
        onOrden={setOrden}
        orden={orden}
        totalVisitadas={visitadas.size}
        onExportar={exportar}
        onCompartir={compartir}
        onImportar={importar}
        ciudad={ciudad}
      />

      {/* ── Tabs: Mapa | Amigos ── */}
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <button
          onClick={() => setTab("mapa")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            tab === "mapa"
              ? "bg-amber-700 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
        >
          🗺️ Mapa
        </button>
        <button
          onClick={handleTabAmigos}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            tab === "amigos"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
        >
          👥 Amigos
          {amigos.length > 0 && (
            <span
              className={`ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                tab === "amigos"
                  ? "bg-white/20 text-white"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              {amigos.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Contenido de la tab ── */}
      {tab === "mapa" && (
        <>
          {/* Contador de resultados */}
          <p className="text-sm text-slate-500">
            {parroquiasFiltradas.length} iglesia
            {parroquiasFiltradas.length !== 1 ? "s" : ""} encontrada
            {parroquiasFiltradas.length !== 1 ? "s" : ""}
          </p>

          {/* Layout principal: listado + mapa */}
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="w-full lg:w-[380px] lg:flex-shrink-0">
              <ListadoParroquias
                parroquias={parroquiasFiltradas}
                seleccionada={parroquiaSeleccionada}
                visitadas={visitadas}
                onSeleccionar={handleSeleccionar}
                onToggleVisitada={toggleVisitada}
                ciudad={ciudad}
                busqueda={busqueda}
                vicariaFiltrada={vicariaSeleccionada}
              />
            </div>
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
        </>
      )}

      {tab === "amigos" && nombreJugador && (
        <PanelAmigos
          nombreJugador={nombreJugador}
          visitadas={visitadas}
          numFotosPropias={numFotosPropias}
          amigos={amigos}
          onCargarAmigo={cargarAmigo}
          onEliminarAmigo={eliminarAmigo}
          parroquias={todasLasParroquias}
          ciudad={ciudad}
        />
      )}

      {tab === "amigos" && !nombreJugador && jugadorCargado && (
        <div className="flex h-60 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-400">
          Introduce tu nombre para acceder al modo multijugador.
        </div>
      )}

    </div>
  );
}
