import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "products";

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const localUploadsDir =
  process.env.UPLOADS_DIR || path.join(__dirname, "..", "..", "uploads");

export function publicImageUrl(pathName: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${pathName}`;
}

export function buildImageUrl(pathName: string): string {
  if (supabase) return publicImageUrl(pathName);
  return `/uploads/${pathName}`;
}

export async function ensureStorageBucket(): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase.storage.getBucket(STORAGE_BUCKET);
  if (error) {
    const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
    });
    if (createError) throw createError;
  } else if (!data.public) {
    await supabase.storage.updateBucket(STORAGE_BUCKET, { public: true });
  }
}

export async function saveImage(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (supabase) {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, buffer, { contentType, upsert: true });
    if (error) throw error;
    return publicImageUrl(filename);
  }
  fs.mkdirSync(localUploadsDir, { recursive: true });
  fs.writeFileSync(path.join(localUploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}
