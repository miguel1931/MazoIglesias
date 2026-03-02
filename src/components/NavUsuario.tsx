"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function NavUsuario() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-8 bg-amber-600 rounded animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-3 py-1.5 text-sm text-amber-100 hover:text-white transition"
        >
          Entrar
        </Link>
        <Link
          href="/registro"
          className="px-3 py-1.5 text-sm bg-white text-amber-800 rounded-lg hover:bg-amber-50 transition font-medium"
        >
          Registrarse
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-amber-600 transition"
      >
        <div className="w-7 h-7 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-sm">
          {(session.user.name || session.user.username || "U")
            .charAt(0)
            .toUpperCase()}
        </div>
        <span className="text-sm text-white font-medium hidden sm:inline">
          {session.user.username}
        </span>
        <svg
          className={`w-4 h-4 text-amber-200 transition-transform ${menuOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-stone-200 z-50 py-1">
            <Link
              href="/mi-perfil"
              className="block px-4 py-2 text-sm text-stone-700 hover:bg-amber-50 transition"
              onClick={() => setMenuOpen(false)}
            >
              Mi Perfil
            </Link>
            <Link
              href={`/perfil/${session.user.username}`}
              className="block px-4 py-2 text-sm text-stone-700 hover:bg-amber-50 transition"
              onClick={() => setMenuOpen(false)}
            >
              Perfil Público
            </Link>
            <hr className="my-1 border-stone-200" />
            <button
              onClick={() => {
                setMenuOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}
