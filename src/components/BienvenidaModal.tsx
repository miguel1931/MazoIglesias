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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Cabecera degradada */}
        <div className="bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 px-8 py-7 text-white">
          <div className="mb-1 text-3xl">⛪</div>
          <h2 className="text-2xl font-bold tracking-tight">Mazo Iglesias</h2>
          <p className="mt-1 text-sm text-amber-200">Tu diario personal de parroquias</p>
        </div>

        {/* Contenido */}
        <div className="space-y-5 px-8 py-6 text-sm text-slate-700">

          <p className="text-base leading-relaxed">
            Esta app nació de una idea sencilla: <strong>recorrer todas las iglesias de Madrid y Barcelona</strong> y llevar un registro de cuáles has visitado.
          </p>

          <div className="space-y-3">

            <div className="flex gap-3">
              <span className="mt-0.5 text-lg">🗺️</span>
              <div>
                <p className="font-semibold text-slate-800">Explora el mapa</p>
                <p className="text-slate-500">Más de 500 parroquias de Madrid (por Vicarías) y ~140 de Barcelona y su área metropolitana (por Decanatos), todas en el mapa.</p>
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
        <div className="border-t border-slate-100 px-8 py-4">
          <button
            onClick={cerrar}
            className="w-full rounded-xl bg-amber-700 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-800 active:bg-amber-900"
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
