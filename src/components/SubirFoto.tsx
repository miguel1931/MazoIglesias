"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";

interface SubirFotoProps {
  parroquiaId: string;
  currentCount: number;
  maxPhotos?: number;
  onUploaded: () => void;
}

export default function SubirFoto({
  parroquiaId,
  currentCount,
  maxPhotos = 4,
  onUploaded,
}: SubirFotoProps) {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!session) return null;
  if (currentCount >= maxPhotos) {
    return (
      <p className="text-xs text-stone-500 italic">
        Has alcanzado el máximo de {maxPhotos} fotos para esta parroquia.
      </p>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");
    if (!file) {
      setPreview(null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Solo se permiten imágenes JPEG, PNG o WebP");
      setPreview(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5MB");
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("parroquiaId", parroquiaId);
      if (caption.trim()) formData.append("caption", caption.trim());

      const res = await fetch("/api/fotos", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al subir la foto");
        return;
      }

      // Reset
      setCaption("");
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      onUploaded();
    } catch {
      setError("Error de conexión");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
      <h4 className="text-sm font-medium text-stone-700">
        Subir foto ({currentCount}/{maxPhotos})
      </h4>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-100 file:text-amber-700 hover:file:cursor-pointer hover:file:bg-amber-200 transition"
      />

      {preview && (
        <div className="space-y-2">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-48 object-cover rounded-lg"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={200}
            placeholder="Pie de foto (opcional)"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-stone-900"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800 transition disabled:opacity-50"
          >
            {uploading ? "Subiendo..." : "Subir foto"}
          </button>
        </div>
      )}
    </div>
  );
}
