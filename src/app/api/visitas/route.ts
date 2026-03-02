import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Obtener visitas del usuario autenticado (o de un usuario público)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const parroquiaId = searchParams.get("parroquiaId");

  try {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    } else {
      // Si no se pasa userId, usar el usuario autenticado
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
      }
      where.userId = session.user.id;
    }

    if (parroquiaId) {
      where.parroquiaId = parroquiaId;
    }

    const visits = await prisma.visit.findMany({
      where,
      include: {
        user: {
          select: { username: true, nombre: true, avatarUrl: true },
        },
      },
      orderBy: { visitedAt: "desc" },
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error("Error obteniendo visitas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST: Marcar una parroquia como visitada
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { parroquiaId, nota } = await request.json();

    if (!parroquiaId) {
      return NextResponse.json(
        { error: "parroquiaId es obligatorio" },
        { status: 400 }
      );
    }

    if (nota && nota.length > 500) {
      return NextResponse.json(
        { error: "La nota no puede superar los 500 caracteres" },
        { status: 400 }
      );
    }

    // Upsert: si ya existe, actualiza la nota
    const visit = await prisma.visit.upsert({
      where: {
        userId_parroquiaId: {
          userId: session.user.id,
          parroquiaId,
        },
      },
      update: {
        nota: nota?.trim() || null,
        visitedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        parroquiaId,
        nota: nota?.trim() || null,
      },
    });

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error("Error creando visita:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE: Desmarcar una parroquia
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { parroquiaId } = await request.json();

    if (!parroquiaId) {
      return NextResponse.json(
        { error: "parroquiaId es obligatorio" },
        { status: 400 }
      );
    }

    await prisma.visit.deleteMany({
      where: {
        userId: session.user.id,
        parroquiaId,
      },
    });

    return NextResponse.json({ message: "Visita eliminada" });
  } catch (error) {
    console.error("Error eliminando visita:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
