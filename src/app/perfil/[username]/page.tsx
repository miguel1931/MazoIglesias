import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import parroquiasData from "../../../../public/parroquias.json";
import type { Parroquia } from "@/types/parroquia";

const parroquias: Parroquia[] = parroquiasData as Parroquia[];

interface PageProps {
  params: { username: string };
}

export default async function PerfilPublicoPage({ params }: PageProps) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      username: true,
      nombre: true,
      bio: true,
      avatarUrl: true,
      isPublic: true,
      createdAt: true,
      visits: {
        orderBy: { visitedAt: "desc" },
        select: { parroquiaId: true, nota: true, visitedAt: true },
      },
      photos: {
        orderBy: { createdAt: "desc" },
        take: 12,
        select: { id: true, url: true, caption: true, parroquiaId: true },
      },
    },
  });

  if (!user) notFound();

  if (!user.isPublic) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-stone-800">Perfil privado</h1>
        <p className="text-stone-600 mt-2">
          Este usuario ha configurado su perfil como privado.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 text-amber-700 hover:text-amber-800 font-medium"
        >
          ← Volver al mapa
        </Link>
      </div>
    );
  }

  const visitedParroquias = user.visits
    .map((v) => {
      const p = parroquias.find((par) => par.id === v.parroquiaId);
      return p ? { ...p, nota: v.nota, visitedAt: v.visitedAt } : null;
    })
    .filter(Boolean);

  const memberSince = new Date(user.createdAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto max-w-3xl py-6 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-900 transition"
      >
        ← Volver al explorador
      </Link>

      {/* Cabecera del perfil */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 text-2xl font-bold shadow-inner">
              {(user.nombre || user.username).charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {user.nombre || user.username}
              </h1>
              <p className="text-amber-200">@{user.username}</p>
            </div>
          </div>
          {user.bio && (
            <p className="mt-4 text-amber-100 text-sm">{user.bio}</p>
          )}
        </div>

        <div className="px-6 py-4 flex gap-6 text-center border-b border-stone-100">
          <div>
            <p className="text-2xl font-bold text-amber-800">
              {user.visits.length}
            </p>
            <p className="text-xs text-stone-500">Parroquias visitadas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-800">
              {user.photos.length}
            </p>
            <p className="text-xs text-stone-500">Fotos</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-stone-400">Miembro desde</p>
            <p className="text-sm text-stone-600">{memberSince}</p>
          </div>
        </div>
      </div>

      {/* Parroquias visitadas */}
      {visitedParroquias.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">
            Parroquias visitadas
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {visitedParroquias.map((p: any) => (
              <Link
                key={p.id}
                href={`/parroquia/${p.id}`}
                className="bg-white rounded-lg p-4 border border-stone-200 hover:border-amber-300 hover:shadow-sm transition"
              >
                <p className="font-medium text-stone-800 text-sm">
                  {p.nombre}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Vicaría {p.vicaria}
                </p>
                {p.nota && (
                  <p className="text-xs text-stone-600 mt-2 italic">
                    📝 {p.nota}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Fotos recientes */}
      {user.photos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">
            Fotos recientes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {user.photos.map((photo) => {
              const p = parroquias.find(
                (par) => par.id === photo.parroquiaId
              );
              return (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url}
                    alt={photo.caption || "Foto"}
                    className="w-full aspect-square object-cover rounded-lg"
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
                </div>
              );
            })}
          </div>
        </div>
      )}

      {visitedParroquias.length === 0 && user.photos.length === 0 && (
        <p className="text-center text-stone-500 py-8">
          Este usuario aún no ha visitado parroquias ni subido fotos.
        </p>
      )}
    </div>
  );
}
