import "server-only";
import { put } from "@vercel/blob";

/**
 * Durable storage for the RIP pipeline.
 *
 * Two jobs:
 *  1. Host uploaded reference and product images — KIE only accepts publicly
 *     reachable URLs, so a local file is useless until it has one.
 *  2. Mirror generated assets. KIE serves results from
 *     tempfile.aiquickdraw.com, which is not durable; a library that links
 *     those URLs rots. Mirroring is what makes the asset library and batch
 *     export trustworthy.
 */

export const isStorageConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export type StoredFile = { url: string; pathname: string; size: number };

export class StorageError extends Error {}

const MAX_BYTES = 30 * 1024 * 1024; // matches the largest KIE per-image limit
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function assertConfigured() {
  if (!isStorageConfigured()) {
    throw new StorageError(
      "BLOB_READ_WRITE_TOKEN is not set. Add it to .env.local to enable uploads and asset mirroring."
    );
  }
}

/** Keeps blob pathnames predictable and free of caller-controlled traversal. */
function safeName(name: string) {
  const base = name.split(/[\\/]/).pop() ?? "file";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  return cleaned || "file";
}

export async function uploadImage(
  file: File,
  folder: "references" | "products"
): Promise<StoredFile> {
  assertConfigured();

  if (!ALLOWED.has(file.type)) {
    throw new StorageError(
      `Unsupported type "${file.type || "unknown"}". Use JPEG, PNG, or WebP.`
    );
  }
  if (file.size > MAX_BYTES) {
    throw new StorageError(
      `File is ${(file.size / 1024 / 1024).toFixed(1)}MB; the limit is ${MAX_BYTES / 1024 / 1024}MB.`
    );
  }
  if (file.size === 0) throw new StorageError("File is empty.");

  const blob = await put(`uploads/${folder}/${safeName(file.name)}`, file, {
    access: "public",
    addRandomSuffix: true, // never overwrite an existing upload
    contentType: file.type,
  });

  return { url: blob.url, pathname: blob.pathname, size: file.size };
}

/**
 * Copies a KIE result onto our own storage. Returns null rather than throwing:
 * a failed mirror must not fail the generation that produced the asset.
 */
export async function mirrorAsset(
  sourceUrl: string,
  generationId: string,
  idx: number
): Promise<string | null> {
  if (!isStorageConfigured()) return null;

  try {
    const res = await fetch(sourceUrl, { cache: "no-store" });
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const body = await res.arrayBuffer();
    if (body.byteLength === 0 || body.byteLength > MAX_BYTES) return null;

    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : "jpg";

    const blob = await put(
      `assets/${generationId}/${idx}.${ext}`,
      Buffer.from(body),
      { access: "public", addRandomSuffix: false, contentType, allowOverwrite: true }
    );
    return blob.url;
  } catch {
    return null;
  }
}
