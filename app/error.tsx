"use client";

/**
 * Route-level error boundary. Data-layer failures (missing schema, bad
 * DATABASE_URL, KIE outage) surface here instead of a blank screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const missingSchema = /relation .* does not exist/i.test(error.message);

  return (
    <div className="panel border-[rgba(248,113,113,0.3)] p-6">
      <div className="label text-bad">Error</div>
      <p className="mt-2 font-mono text-sm break-words text-bad">{error.message}</p>

      {missingSchema ? (
        <p className="mt-3 text-sm text-muted">
          The schema has not been applied yet. Run{" "}
          <code className="font-mono text-fg">npm run db:migrate</code>.
        </p>
      ) : null}

      <button type="button" onClick={reset} className="btn mt-4">
        Try again
      </button>
    </div>
  );
}
