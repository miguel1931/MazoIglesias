"use client";

import { useRef, useState } from "react";

export type OrdenLista = "alfa" | "vicaria" | "visitadas-primero" | "pendientes-primero";

interface FiltrosProps {
  onFiltrar: (texto: string, vicaria: number | null, soloVisitadas: boolean) => void;
  onOrden: (orden: OrdenLista) => void;
  orden: OrdenLista;
  totalVisitadas: number;
  onExportar: (conFotos?: boolean) => void | Promise<void>;
  onCompartir: (conFotos?: boolean) => void | Promise<void>;
  onImportar: (file: File) => void;
  ciudad: "madrid" | "barcelona";
}

const VICARIAS_MADRID = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const DECANATOS_BCN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export default function Filtros({
  onFiltrar,
  onOrden,
  orden,
  totalVisitadas,
  onExportar,
  onCompartir,
  onImportar,
  ciudad,
}: FiltrosProps) {
  const [texto, setTexto] = useState("");
  const [vicaria, setVicaria] = useState<number | null>(null);
  const [soloVisitadas, setSoloVisitadas] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuExportar, setMenuExportar] = useState(false);
  const [menuCompartir, setMenuCompartir] = useState(false);

  const opciones = ciudad === "madrid" ? VICARIAS_MADRID : DECANATOS_BCN;
  const labelFiltro = ciudad === "madrid" ? "Vicaría" : "Decanato";
  const labelFiltroPlural = ciudad === "madrid" ? "Todas las vicarías" : "Todos los decanatos";
  const accentColor =
    ciudad === "madrid"
      ? "focus:border-amber-500 focus:ring-amber-500/30"
      : "focus:border-blue-500 focus:ring-blue-500/30";

  const handleTexto = (valor: string) => {
    setTexto(valor);
    onFiltrar(valor, vicaria, soloVisitadas);
  };

  const handleVicaria = (valor: string) => {
    const v = valor === "" ? null : Number(valor);
    setVicaria(v);
    onFiltrar(texto, v, soloVisitadas);
  };

  const handleSoloVisitadas = (checked: boolean) => {
    setSoloVisitadas(checked);
    onFiltrar(texto, vicaria, checked);
  };

  const handleLimpiar = () => {
    setTexto("");
    setVicaria(null);
    setSoloVisitadas(false);
    onFiltrar("", null, false);
  };

  const handleImportarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportar(file);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      {/* Fila 1: buscador (siempre full width) */}
      <div>
        <label htmlFor="busqueda" className="mb-1 block text-xs font-medium text-slate-500">
          Buscar iglesia
        </label>
        <input
          id="busqueda"
          type="text"
          placeholder="Nombre, barrio, población o CP…"
          value={texto}
          onChange={(e) => handleTexto(e.target.value)}
          className={`w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${accentColor}`}
        />
      </div>

      {/* Fila 2: vicaría + orden en grid 2 cols en móvil, fila en desktop */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-end sm:gap-3">
        {/* Filtro por vicaría / decanato */}
        <div>
          <label htmlFor="vicaria" className="mb-1 block text-xs font-medium text-slate-500">
            {labelFiltro}
          </label>
          <select
            id="vicaria"
            value={vicaria ?? ""}
            onChange={(e) => handleVicaria(e.target.value)}
            className={`w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${accentColor}`}
          >
            <option value="">{labelFiltroPlural}</option>
            {opciones.map((v) => (
              <option key={v} value={v}>
                {labelFiltro} {v}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de orden */}
        <div>
          <label htmlFor="orden" className="mb-1 block text-xs font-medium text-slate-500">
            Ordenar por
          </label>
          <select
            id="orden"
            value={orden}
            onChange={(e) => onOrden(e.target.value as OrdenLista)}
            className={`w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${accentColor}`}
          >
            <option value="alfa">Alfabético</option>
            <option value="vicaria">{labelFiltro}</option>
            <option value="visitadas-primero">Visitadas primero</option>
            <option value="pendientes-primero">Pendientes primero</option>
          </select>
        </div>

        {/* Botón limpiar — ocupa el ancho restante en desktop */}
        <button
          onClick={handleLimpiar}
          className="col-span-2 mt-0.5 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200 active:bg-slate-300 sm:col-span-1 sm:self-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          Limpiar
        </button>
      </div>

      {/* Fila 3: visitadas + acciones */}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 sm:gap-3">
        {/* Checkbox solo visitadas */}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={soloVisitadas}
            onChange={(e) => handleSoloVisitadas(e.target.checked)}
            className="h-4 w-4 accent-green-500"
          />
          Solo visitadas
          {totalVisitadas > 0 && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
              {totalVisitadas}
            </span>
          )}
        </label>

        <div className="ml-auto flex items-center gap-2">
          {/* Compartir (con menú desplegable) */}
          <div className="relative">
            <button
              onClick={() => {
                setMenuCompartir(!menuCompartir);
                setMenuExportar(false);
              }}
              disabled={totalVisitadas === 0}
              aria-label="Compartir progreso con amigos"
              title="Compartir con amigos"
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              📤 Compartir
            </button>
            {menuCompartir && (
              <div className="absolute right-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                <button
                  onClick={() => {
                    onCompartir(false);
                    setMenuCompartir(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-slate-700 transition hover:bg-slate-50"
                >
                  <span>🪶</span>
                  <div>
                    <p className="font-medium">Ligero (sin fotos)</p>
                    <p className="text-[10px] text-slate-400">
                      Ideal para WhatsApp
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onCompartir(true);
                    setMenuCompartir(false);
                  }}
                  className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2.5 text-left text-xs text-slate-700 transition hover:bg-slate-50"
                >
                  <span>📷</span>
                  <div>
                    <p className="font-medium">Completo (con fotos)</p>
                    <p className="text-[10px] text-slate-400">
                      Más pesado, incluye imágenes
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Exportar (con menú desplegable) */}
          <div className="relative">
            <button
              onClick={() => {
                setMenuExportar(!menuExportar);
                setMenuCompartir(false);
              }}
              disabled={totalVisitadas === 0}
              aria-label="Exportar datos como JSON"
              title="Exportar como JSON"
              className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
            >
              Exportar ↓
            </button>
            {menuExportar && (
              <div className="absolute right-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                <button
                  onClick={() => {
                    onExportar(false);
                    setMenuExportar(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-slate-700 transition hover:bg-slate-50"
                >
                  <span>🪶</span>
                  <div>
                    <p className="font-medium">Sin fotos</p>
                    <p className="text-[10px] text-slate-400">
                      Fichero pequeño
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onExportar(true);
                    setMenuExportar(false);
                  }}
                  className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2.5 text-left text-xs text-slate-700 transition hover:bg-slate-50"
                >
                  <span>📷</span>
                  <div>
                    <p className="font-medium">Con fotos</p>
                    <p className="text-[10px] text-slate-400">
                      Backup completo
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Importar */}
          <button
            onClick={handleImportarClick}
            aria-label="Importar visitadas desde fichero JSON"
            title="Importar visitadas desde JSON"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Importar ↑
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
