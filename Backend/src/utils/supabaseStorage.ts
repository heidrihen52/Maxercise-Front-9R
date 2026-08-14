// src/utils/supabaseStorage.ts
import { supabase } from '../config/supabase';
import { env } from '../config/env';

export const STORAGE_BUCKET = env.supabaseBucket || 'media';

export async function uploadFileToSupabase(
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<{ path: string; publicUrl: string }> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, fileBuffer, { contentType, upsert: true });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);

  return { path: data.path, publicUrl: urlData.publicUrl };
}

/**
 * Elimina un archivo de Supabase Storage dada su URL pública.
 * Si la URL es de YouTube u otro dominio externo, no realiza ninguna acción.
 */
export const deleteFileFromSupabase = async (publicUrl: string, bucketName: string = 'media') => {
  if (!publicUrl) return;

  const supabaseStoragePrefix = `/storage/v1/object/public/${bucketName}/`;
  
  // Si NO es una URL de Supabase (por ejemplo, es un enlace de YouTube), omitimos la eliminación
  if (!publicUrl.includes(supabaseStoragePrefix)) {
    return;
  }

  try {
    const filePath = publicUrl.split(supabaseStoragePrefix)[1];

    if (filePath) {
      const { error } = await supabase.storage.from(bucketName).remove([filePath]);
      if (error) {
        console.error('Error al eliminar archivo físico en Supabase:', error.message);
      }
    }
  } catch (err) {
    console.error('Excepción al eliminar archivo en Supabase:', err);
  }
};