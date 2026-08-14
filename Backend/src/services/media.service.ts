// src/services/media.service.ts
import { MediaType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { uploadFileToSupabase, deleteFileFromSupabase, STORAGE_BUCKET } from '../utils/supabaseStorage';

interface ManageMediaInput {
  exerciseId?: number;
  routineId?: number;
  file?: Express.Multer.File;
  youtubeUrl?: string;
  targetType: 'THUMBNAIL' | 'CONTENT';
}

/**
 * Crea o reemplaza la multimedia existente eliminando el archivo anterior de Supabase Storage.
 */
export async function updateOrReplaceMedia({
  exerciseId,
  routineId,
  file,
  youtubeUrl,
  targetType
}: ManageMediaInput) {
  let newUrl = '';
  let finalType: MediaType;

  // 1. Determinar el nuevo origen
  if (youtubeUrl) {
    newUrl = youtubeUrl;
    finalType = MediaType.YOUTUBE;
  } else if (file) {
    const folder = exerciseId ? 'exercises' : 'routines';
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${folder}/${Date.now()}_${targetType.toLowerCase()}_${cleanFileName}`;

    const uploaded = await uploadFileToSupabase(path, file.buffer, file.mimetype);
    newUrl = uploaded.publicUrl;
    finalType = targetType === 'THUMBNAIL' ? MediaType.THUMBNAIL : MediaType.CONTENT;
  } else {
    return;
  }

  // 2. Definir los tipos a buscar para reemplazar
  const typesToMatch = finalType === MediaType.THUMBNAIL
    ? [MediaType.THUMBNAIL]
    : [MediaType.CONTENT, MediaType.YOUTUBE];

  const entityFilter = exerciseId ? { exercise_id: exerciseId } : { routine_id: routineId };

  // 3. Buscar registro previo
  const existingMedia = await prisma.media.findFirst({
    where: {
      ...entityFilter,
      type: { in: typesToMatch }
    }
  });

  // 4. Si existía previamente, borrar de Supabase (si aplica) y actualizar registro
  if (existingMedia) {
    await deleteFileFromSupabase(existingMedia.url, STORAGE_BUCKET);

    return prisma.media.update({
      where: { id: existingMedia.id },
      data: {
        url: newUrl,
        type: finalType
      }
    });
  }

  // 5. Si no existía, crear nuevo registro
  return prisma.media.create({
    data: {
      url: newUrl,
      type: finalType,
      exercise_id: exerciseId ?? null,
      routine_id: routineId ?? null
    }
  });
}

/**
 * Elimina todos los archivos físicos de Supabase asociados a una entidad antes de ser borrada de la DB.
 */
export async function deleteEntityMedia(exerciseId?: number, routineId?: number) {
  const entityFilter = exerciseId ? { exercise_id: exerciseId } : { routine_id: routineId };

  const mediaList = await prisma.media.findMany({
    where: entityFilter
  });

  for (const media of mediaList) {
    await deleteFileFromSupabase(media.url, STORAGE_BUCKET);
  }
}