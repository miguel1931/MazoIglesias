"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import parroquiasData from "../../../public/parroquias.json";

interface Visit {
  id: string;
  parroquiaId: string;
  nota: string | null;
  visitedAt: string;
}

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  parroquiaId: string;
  createdAt: string;
}

export default function MiPerfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"visitas" | "fotos">("visitas");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.id) return;

    Promise.all([
      fetch("/api/visitas").then((r) => r.json()),
      fetch(`/api/fotos?userId=${session.user.id}`).then((r) => r.json()),
    ])
      .then(([v, p]) => {
        if (Array.isArray(v)) setVisits(v);
        if (Array.isArray(p)) setPhotos(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-stone-200 rounded-2xl" />
          <div className="h-64 bg-stone-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  const getParroquia = (id: string) =>
    (parroquiasData as any[]).find((p) => p.id === id);

  return (
    <div className="mx-auto max-w-3xl py-6 space-y-6">
      {/* Cabecera */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-6 py-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 text-xl font-bold">
              {(session.user.name || session.user.username || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {session.user.name || session.user.username}
              </h1>
              <p className="text-amber-200 text-sm">@{session.user.username}</p>
            </div>
          </div>
        </div>

        <div className="flex border-b border-stone-200">
          <div className="flex-1 text-center py-3">
            <p className="text-2xl font-bold text-amber-800">{visits.length}</p>
            <p className="text-xs text-stone-500">Visitadas</p>
          </div>
          <div className="flex-1 text-center py-3 border-l border-stone-200">
            <p className="text-2xl font-bold text-amber-800">{photos.length}</p>
            <p className="text-xs text-stone-500">Fotos</p>
          </div>
          <div className="flex-1 text-center py-3 border-l border-stone-200">
            <p className="text-2xl font-bold text-amber-800">
              {((visits.length / (parroquiasData as any[]).length) * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-stone-500">Completado</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("visitas")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
            activeTab === "visitas"
              ? "bg-white text-amber-800 shadow-sm"
              : "text-stone-600 hover:text-stone-800"
          }`}
        >
          Mis Visitas ({visits.length})
        </button>
        <button
          onClick={() => setActiveTab("fotos")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
            activeTab === "fotos"
              ? "bg-white text-amber-800 shadow-sm"
              : "text-stone-600 hover:text-stone-800"
          }`}
        >
          Mis Fotos ({photos.length})
        </button>
      </div>

      {/* Contenido */}
      {activeTab === "visitas" && (
        <div className="space-y-3">
          {visits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-stone-500 mb-3">
                Aún no has visitado ninguna parroquia.
              </p>
              <Link
                href="/"
                className="text-amber-700 hover:text-amber-800 font-medium"
              >
                Explorar parroquias →
              </Link>
            </div>
          ) : (
            visits.map((visit) => {
              const p = getParroquia(visit.parroquiaId);
              return (
                <Link
                  key={visit.id}
                  href={`/parroquia/${visit.parroquiaId}`}
                  className="block bg-white rounded-lg p-4 border border-stone-200 hover:border-amber-300 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-stone-800">
                        {p?.nombre || visit.parroquiaId}
                      </p>
                      {p && (
                        <p className="text-xs text-stone-500 mt-0.5">
                          Vicaría {p.vicaria} — {p.poblacion}
                        </p>
                      )}
                      {visit.nota && (
                        <p className="text-sm text-stone-600 mt-2 italic">
                          📝 {visit.nota}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-stone-400">
                      {new Date(visit.visitedAt).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      {activeTab === "fotos" && (
        <div>
          {photos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-stone-500 mb-3">
                Aún no has subido ninguna foto.
              </p>
              <Link
                href="/"
                className="text-amber-700 hover:text-amber-800 font-medium"
              >
                Explorar parroquias →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo) => {
                const p = getParroquia(photo.parroquiaId);
                return (
                  <Link
                    key={photo.id}
                    href={`/parroquia/${photo.parroquiaId}`}
                    className="relative group"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || "Foto"}
                      className="w-full aspect-square object-cover rounded-lg hover:opacity-90 transition"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg">
                      {p && (
                        <p className="text-xs text-white font-medium truncate">
                          {p.nombre}
                        </p>
                      )}
                      {photo.caption && (
                        <p className="text-xs text-white/80 truncate">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
