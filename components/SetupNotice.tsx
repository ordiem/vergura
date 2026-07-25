export function SetupNotice() {
  return (
    <div className="panel p-6">
      <div className="label">Not configured</div>
      <h2 className="mt-2 text-lg">Connect a database to start</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Every preset, job, cost figure and approval is persisted in Postgres. Set{" "}
        <code className="font-mono text-fg">DATABASE_URL</code> in{" "}
        <code className="font-mono text-fg">.env.local</code>, then apply the schema:
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-base p-4 font-mono text-xs text-muted">
        {`DATABASE_URL=postgres://user:pass@host/db
KIE_API_KEY=your-kie-key

npm run db:migrate`}
      </pre>
      <p className="mt-4 text-sm text-muted">
        Without <code className="font-mono text-fg">KIE_API_KEY</code> the platform runs a mock
        generation driver, so the full workflow is still explorable.
      </p>
    </div>
  );
}

export function ErrorNotice({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <div className="panel border-[rgba(248,113,113,0.3)] p-5">
      <div className="label text-bad">Error</div>
      <p className="mt-2 font-mono text-sm text-bad">{msg}</p>
      <p className="mt-3 text-sm text-muted">
        If the schema has not been applied yet, run{" "}
        <code className="font-mono text-fg">npm run db:migrate</code>.
      </p>
    </div>
  );
}
