/**
 * Pure parsing helpers for KIE responses. Deliberately free of `server-only`
 * so they stay unit-testable and reusable on either side of the boundary.
 */

export type KieState = "waiting" | "queuing" | "generating" | "success" | "fail";

export const KIE_STATES: KieState[] = [
  "waiting",
  "queuing",
  "generating",
  "success",
  "fail",
];

export const isKieState = (v: unknown): v is KieState =>
  typeof v === "string" && (KIE_STATES as string[]).includes(v);

export const num = (v: unknown, fallback = 0) => {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : fallback;
};

/**
 * KIE returns result payloads as a JSON *string* whose inner key varies by
 * model family, and the shape is not documented on any model page. Accept
 * every variant observed rather than guessing one.
 */
export function extractUrls(resultJson: unknown): string[] {
  let parsed: unknown = resultJson;

  if (typeof parsed === "string") {
    const s = parsed.trim();
    if (!s) return [];
    try {
      parsed = JSON.parse(s);
    } catch {
      return /^https?:\/\//.test(s) ? [s] : [];
    }
  }

  const urls: string[] = [];
  const visit = (node: unknown, depth = 0): void => {
    if (depth > 6 || node == null) return;

    if (typeof node === "string") {
      if (/^https?:\/\//.test(node)) urls.push(node);
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) visit(item, depth + 1);
      return;
    }
    if (typeof node === "object") {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        // Some responses double-encode an inner JSON payload.
        if (typeof v === "string" && (v.startsWith("[") || v.startsWith("{"))) {
          try {
            visit(JSON.parse(v), depth + 1);
            continue;
          } catch {
            /* fall through to the normal path */
          }
        }
        if (/url|image|video|result|output/i.test(k) || Array.isArray(v) || typeof v === "object") {
          visit(v, depth + 1);
        }
      }
    }
  };

  visit(parsed);
  return [...new Set(urls)];
}
