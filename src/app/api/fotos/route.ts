import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

const MAX_PHOTOS_PER_PARISH = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// GET: Obtener fotos de una parroquia o usuario
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parroquiaId = searchParams.get("parroquiaId");
  const userId = searchParams.get("userId");

  try {
    const where: any = {};
    if (parroquiaId) where.parroquiaId = parroquiaId;
    if (userId) where.userId = userId;

    const photos = await prisma.photo.findMany({
      where,
      include: {
        user: {
          select: { username: true, nombre: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error obteniendo fotos:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST: Subir una foto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const parroquiaId = formData.get("parroquiaId") as string | null;
    const caption = formData.get("caption") as string | null;

    // Validaciones
    if (!file || !parroquiaId) {
      return NextResponse.json(
        { error: "Se requiere archivo y parroquiaId" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Use JPEG, PNG o WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El archivo no puede superar los 5MB" },
        { status: 400 }
      );
    }

    if (caption && caption.length > 200) {
      return NextResponse.json(
        { error: "El pie de foto no puede superar los 200 caracteres" },
        { status: 400 }
      );
    }

    // Verificar límite de fotos por parroquia por usuario
    const existingCount = await prisma.photo.count({
      where: {
        userId: session.user.id,
        parroquiaId,
      },
    });

    if (existingCount >= MAX_PHOTOS_PER_PARISH) {
      return NextResponse.json(
        {
          error: `Máximo ${MAX_PHOTOS_PER_PARISH} fotos por parroquia. Elimine alguna para subir más.`,
        },
        { status: 400 }
      );
    }

    // Subir a Vercel Blob
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const blobPath = `parroquias/${parroquiaId}/${session.user.id}/${timestamp}_${safeName}`;

    const blob = await put(blobPath, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // Guardar en DB
    const photo = await prisma.photo.create({
      data: {
        userId: session.user.id,
        parroquiaId,
        url: blob.url,
        caption: caption?.trim() || null,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Error subiendo foto:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE: Eliminar una foto propia
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { photoId } = await request.json();

    if (!photoId) {
      return NextResponse.json(
        { error: "photoId es obligatorio" },
        { status: 400 }
      );
    }

    // Solo puede borrar sus propias fotos
    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        userId: session.user.id,
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Foto no encontrada o no tiene permiso" },
        { status: 404 }
      );
    }

    await prisma.photo.delete({ where: { id: photoId } });

    return NextResponse.json({ message: "Foto eliminada" });
  } catch (error) {
    console.error("Error eliminando foto:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
