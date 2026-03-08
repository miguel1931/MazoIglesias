import Link from "next/link";
import parroquiasData from "../../../../public/parroquias.json";
import type { Parroquia } from "@/types/parroquia";
import BotonVisitada from "@/components/BotonVisitada";

const todasLasParroquias: Parroquia[] = parroquiasData as Parroquia[];

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return todasLasParroquias.map((p) => ({ id: p.id }));
}

export default function ParroquiaDetallePage({ params }: PageProps) {
  const parroquia = todasLasParroquias.find((p) => p.id === params.id);

  if (!parroquia) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-lg text-slate-500">Parroquia no encontrada.</p>
        <Link
          href="/"
          className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800"
        >
          ← Volver al mapa
        </Link>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${parroquia.direccion}, ${parroquia.cp} ${parroquia.poblacion}`
  )}`;

  return (
    <div className="mx-auto max-w-2xl py-6">
      {/* Enlace de vuelta */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-amber-700 transition hover:text-amber-900"
      >
        ← Volver al explorador
      </Link>

      {/* Tarjeta de detalle */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
        {/* Cabecera con color */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-6 py-5 text-white">
          <h1 className="text-xl font-bold sm:text-2xl">{parroquia.nombre}</h1>
          <p className="mt-1 text-sm text-amber-200">
            {parroquia.advocacion}
          </p>
        </div>

        {/* Cuerpo */}
        <div className="space-y-5 px-6 py-5">
          {/* Dirección */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Dirección
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              {parroquia.direccion}
            </p>
            <p className="text-sm text-slate-700">
              {parroquia.cp} — {parroquia.poblacion}
            </p>
          </div>

          {/* Vicaría */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Vicaría
            </h2>
            <span className="mt-1 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
              Vicaría {parroquia.vicaria}
            </span>
          </div>

          {/* Contacto */}
          {(parroquia.telefono || parroquia.email) && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Contacto
              </h2>
              <div className="mt-1 space-y-1">
                {parroquia.telefono && (
                  <p className="text-sm text-slate-700">
                    📞{" "}
                    <a
                      href={`tel:${parroquia.telefono.replace(/\s/g, "")}`}
                      className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900"
                    >
                      {parroquia.telefono}
                    </a>
                  </p>
                )}
                {parroquia.email && (
                  <p className="text-sm text-slate-700">
                    ✉️{" "}
                    <a
                      href={`mailto:${parroquia.email}`}
                      className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900"
                    >
                      {parroquia.email}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Coordenadas */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Coordenadas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {parroquia.lat.toFixed(4)}, {parroquia.lng.toFixed(4)}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800 active:bg-amber-900"
            >
              🗺️ Cómo llegar
            </a>
            <BotonVisitada id={parroquia.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
