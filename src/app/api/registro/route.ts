import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Validaciones de seguridad
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, nombre } = body;

    // --- Validaciones ---
    if (!username || !email || !password || !nombre) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        {
          error:
            "El nombre de usuario debe tener entre 3 y 30 caracteres (letras, números y guión bajo)",
        },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "El email no es válido" },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
        },
        { status: 400 }
      );
    }

    if (nombre.trim().length < 2 || nombre.trim().length > 100) {
      return NextResponse.json(
        { error: "El nombre debe tener entre 2 y 100 caracteres" },
        { status: 400 }
      );
    }

    // --- Comprobar duplicados ---
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { username: username.toLowerCase().trim() },
        ],
      },
    });

    if (existingUser) {
      const campo =
        existingUser.email === email.toLowerCase().trim()
          ? "email"
          : "nombre de usuario";
      return NextResponse.json(
        { error: `Ya existe una cuenta con ese ${campo}` },
        { status: 409 }
      );
    }

    // --- Crear usuario (password hasheada con bcrypt, coste 12) ---
    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        nombre: nombre.trim(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        nombre: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Cuenta creada con éxito", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
