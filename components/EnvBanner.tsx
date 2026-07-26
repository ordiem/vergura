import { isDbConfigured } from "@/lib/db/client";
import { isKieConfigured, isMockDriver } from "@/lib/kie/client";

/** Makes the platform's operating mode impossible to miss. */
export function EnvBanner() {
  const db = isDbConfigured();
  const kie = isKieConfigured();
  const mock = isMockDriver();

  if (db && kie && !mock) return null;

  const notes: string[] = [];
  if (!db) notes.push("DATABASE_URL not set — nothing persists");
  if (!kie) notes.push("KIE_API_KEY not set");
  if (mock) notes.push("running the mock generation driver");

  return (
    <div className="border-b border-[rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.07)]">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-2">
        <span className="chip border-[rgba(251,191,36,0.4)] text-run">Setup</span>
        <p className="text-[0.8rem] text-muted">
          {notes.join(" · ")}. <a href="/setup" className="text-fg underline">Open setup →</a>
        </p>
      </div>
    </div>
  );
}
