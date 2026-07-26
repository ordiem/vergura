"use client";

import { useState } from "react";

/**
 * Uploads to /api/upload and writes the resulting public URL into a hidden
 * field. KIE only accepts reachable URLs, so the URL is the real payload —
 * pasting one directly is equally valid and stays available when Blob is not
 * configured.
 */
export function Uploader({
  name,
  folder,
  multiple = false,
  label,
}: {
  name: string;
  folder: "references" | "products";
  multiple?: boolean;
  label: string;
}) {
  const [urls, setUrls] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    const next: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.set("file", file);
        body.set("folder", folder);
        const res = await fetch("/api/upload", { method: "POST", body });
        const json = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed.");
        next.push(json.url);
      }
      setUrls((u) => (multiple ? [...u, ...next] : next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="label">{label}</label>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        disabled={busy}
        onChange={(e) => onPick(e.target.files)}
        className="field mt-1.5 text-xs file:mr-3 file:rounded file:border-0 file:bg-panel-2 file:px-2 file:py-1 file:text-xs file:text-fg"
      />

      <textarea
        name={name}
        rows={multiple ? 3 : 2}
        value={urls.join("\n")}
        onChange={(e) =>
          setUrls(e.target.value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean))
        }
        placeholder="https://… (or paste URLs directly, one per line)"
        className="field mt-2 font-mono text-xs"
      />

      {busy ? <p className="mt-1 text-xs text-run">Uploading…</p> : null}
      {error ? <p className="mt-1 text-xs text-bad">{error}</p> : null}

      {urls.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {urls.map((u) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={u}
              src={u}
              alt=""
              className="h-14 w-14 rounded border border-line object-cover"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
