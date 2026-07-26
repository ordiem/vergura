import { NextResponse } from "next/server";
import { uploadImage, StorageError, isStorageConfigured } from "@/lib/storage/blob";

export const dynamic = "force-dynamic";

/** Accepts a reference or product image and returns a public URL KIE can read. */
export async function POST(request: Request) {
  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not set." },
      { status: 503 }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const folderRaw = String(form.get("folder") ?? "references");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (folderRaw !== "references" && folderRaw !== "products") {
      return NextResponse.json({ error: "Invalid folder." }, { status: 400 });
    }

    const stored = await uploadImage(file, folderRaw);
    return NextResponse.json(stored);
  } catch (err) {
    if (err instanceof StorageError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 }
    );
  }
}
