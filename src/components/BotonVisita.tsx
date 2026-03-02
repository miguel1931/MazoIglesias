"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface BotonVisitaProps {
  parroquiaId: string;
}

export default function BotonVisita({ parroquiaId }: BotonVisitaProps) {
  const { data: session } = useSession();
  const [visited, setVisited] = useState(false);
  const [nota, setNota] = useState("");
  const [showNota, setShowNota] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setChecking(false);
      return;
    }

    fetch(`/api/visitas?parroquiaId=${parroquiaId}`)
      .then((res) => res.json())
      .then((visits) => {
        if (Array.isArray(visits) && visits.length > 0) {
          setVisited(true);
          setNota(visits[0].nota || "");
        }
      })
      .catch(console.error)
      .finally(() => setChecking(false));
  }, [session, parroquiaId]);

  if (!session) {
    return (
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <p className="text-sm text-stone-600">
          <Link href="/login" className="text-amber-700 font-medium hover:underline">
            Inicia sesión
          </Link>{" "}
          para marcar esta parroquia como visitada y subir fotos.
        </p>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="h-12 bg-stone-100 rounded-lg animate-pulse" />
    );
  }

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (visited) {
        await fetch("/api/visitas", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parroquiaId }),
        });
        setVisited(false);
        setNota("");
        setShowNota(false);
      } else {
        await fetch("/api/visitas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parroquiaId, nota: nota.trim() || null }),
        });
        setVisited(true);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNota = async () => {
    setLoading(true);
    try {
      await fetch("/api/visitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parroquiaId, nota: nota.trim() || null }),
      });
      setShowNota(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 ${
            visited
              ? "bg-green-100 text-green-800 hover:bg-green-200 border border-green-300"
              : "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
          }`}
        >
          {visited ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Visitada
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Marcar como visitada
            </>
          )}
        </button>

        {visited && (
          <button
            onClick={() => setShowNota(!showNota)}
            className="text-sm text-stone-500 hover:text-stone-700 transition"
          >
            {showNota ? "Ocultar nota" : nota ? "Editar nota" : "Añadir nota"}
          </button>
        )}
      </div>

      {showNota && visited && (
        <div className="flex gap-2">
          <input
            type="text"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            maxLength={500}
            placeholder="Escribe una nota sobre tu visita..."
            className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-stone-900"
          />
          <button
            onClick={handleSaveNota}
            disabled={loading}
            className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800 transition disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      )}

      {nota && !showNota && visited && (
        <p className="text-sm text-stone-600 italic pl-1">📝 {nota}</p>
      )}
    </div>
  );
}
