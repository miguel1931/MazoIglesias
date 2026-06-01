"use client";

import { useEffect, useState } from "react";

const KEY = "mazo-iglesias-bienvenida-v1";

export default function BienvenidaModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {}
  }, []);

  const cerrar = () => {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        {/* Handle visual en móvil */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Cabecera degradada */}
        <div className="bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 px-5 py-5 text-white sm:px-8 sm:py-7">
          <div className="mb-1 text-2xl sm:text-3xl">⛪</div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Mazo Iglesias</h2>
          <p className="mt-1 text-sm text-amber-200">Tu diario personal de parroquias</p>
        </div>

        {/* Contenido — scroll interno si la pantalla es pequeña */}
        <div className="max-h-[55vh] space-y-4 overflow-y-auto px-5 py-5 text-sm text-slate-700 sm:max-h-none sm:space-y-5 sm:px-8 sm:py-6">

          <p className="text-base leading-relaxed">
            Esta app nació de una idea sencilla: <strong>recorrer todas las iglesias de Madrid</strong> y llevar un registro de cuáles has visitado.
          </p>

          <div className="space-y-3">

            <div className="flex gap-3">
              <span className="mt-0.5 text-lg">🗺️</span>
              <div>
                <p className="font-semibold text-slate-800">Explora el mapa</p>
                <p className="text-slate-500">Más de 500 parroquias de Madrid organizadas por Vicarías, todas en el mapa interactivo.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="mt-0.5 text-lg">✓</span>
              <div>
                <p className="font-semibold text-slate-800">Marca tus visitas</p>
                <p className="text-slate-500">Pulsa el círculo en cada iglesia para marcarla como visitada. Puedes filtrar para ver solo las pendientes.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="mt-0.5 text-lg">📷</span>
              <div>
                <p className="font-semibold text-slate-800">Guarda tus fotos</p>
                <p className="text-slate-500">Desde la ficha de cada iglesia puedes añadir tus propias fotos. Se guardan en tu dispositivo (hasta 500 MB).</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="mt-0.5 text-lg">💾</span>
              <div>
                <p className="font-semibold text-slate-800">Todo es local y tuyo</p>
                <p className="text-slate-500">
                  Nada se envía a ningún servidor. Tus visitas se guardan en el <strong>localStorage</strong> de tu navegador y tus fotos en <strong>IndexedDB</strong>.
                  Puedes exportar e importar tu lista de visitas en cualquier momento.
                </p>
              </div>
            </div>

          </div>

          {/* Aviso privacidad */}
          <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            ⚠️ Si limpias los datos del navegador perderás el historial de visitas y las fotos guardadas. Usa el botón <strong>Exportar</strong> para hacer una copia de seguridad.
          </div>
        </div>

        {/* Botón */}
        <div className="border-t border-slate-100 px-5 py-4 sm:px-8">
          <button
            onClick={cerrar}
            className="w-full rounded-xl bg-amber-700 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-800 active:bg-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            ¡Empezar la ruta! →
          </button>
          <p className="mt-2 text-center text-[10px] text-slate-400">
            Este mensaje solo aparece una vez
          </p>
        </div>

      </div>
    </div>
  );
}
