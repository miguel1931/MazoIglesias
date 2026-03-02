"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import SubirFoto from "./SubirFoto";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  createdAt: string;
  user: {
    username: string;
    nombre: string | null;
    avatarUrl: string | null;
  };
  userId: string;
}

interface GaleriaFotosProps {
  parroquiaId: string;
}

export default function GaleriaFotos({ parroquiaId }: GaleriaFotosProps) {
  const { data: session } = useSession();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch(`/api/fotos?parroquiaId=${parroquiaId}`);
      const data = await res.json();
      if (Array.isArray(data)) setPhotos(data);
    } catch (error) {
      console.error("Error cargando fotos:", error);
    } finally {
      setLoading(false);
    }
  }, [parroquiaId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleDelete = async (photoId: string) => {
    if (!confirm("¿Eliminar esta foto?")) return;
    setDeleting(photoId);
    try {
      await fetch("/api/fotos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });
      fetchPhotos();
    } catch (error) {
      console.error("Error eliminando foto:", error);
    } finally {
      setDeleting(null);
    }
  };

  const myPhotoCount = session?.user?.id
    ? photos.filter((p) => p.userId === session.user.id).length
    : 0;

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-stone-800">Fotos</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="aspect-square bg-stone-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-stone-800">
        Fotos de la comunidad{" "}
        {photos.length > 0 && (
          <span className="text-sm font-normal text-stone-500">
            ({photos.length})
          </span>
        )}
      </h3>

      {photos.length === 0 && (
        <p className="text-sm text-stone-500 italic">
          Aún no hay fotos. ¡Sé el primero en compartir!
        </p>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.url}
                alt={photo.caption || "Foto de la parroquia"}
                className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                onClick={() => setLightbox(photo)}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg">
                <p className="text-xs text-white font-medium">
                  @{photo.user.username}
                </p>
                {photo.caption && (
                  <p className="text-xs text-white/80 truncate">
                    {photo.caption}
                  </p>
                )}
              </div>
              {session?.user?.id === photo.userId && (
                <button
                  onClick={() => handleDelete(photo.id)}
                  disabled={deleting === photo.id}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs hover:bg-red-700"
                  title="Eliminar foto"
                >
                  {deleting === photo.id ? "…" : "✕"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {session && (
        <SubirFoto
          parroquiaId={parroquiaId}
          currentCount={myPhotoCount}
          onUploaded={fetchPhotos}
        />
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="max-w-3xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.url}
              alt={lightbox.caption || "Foto"}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-3 text-white">
              <p className="font-medium">@{lightbox.user.username}</p>
              {lightbox.caption && (
                <p className="text-sm text-white/80">{lightbox.caption}</p>
              )}
            </div>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white text-stone-800 rounded-full flex items-center justify-center shadow-lg hover:bg-stone-100 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
