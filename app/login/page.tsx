import type { Metadata } from "next";
import { isAuthConfigured } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  if (!isAuthConfigured()) {
    return (
      <div className="panel mx-auto max-w-md p-6">
        <div className="label">Auth not configured</div>
        <p className="mt-2 text-sm text-muted">
          Set <code className="font-mono text-fg">APP_PASSWORD</code> and{" "}
          <code className="font-mono text-fg">AUTH_SECRET</code> in{" "}
          <code className="font-mono text-fg">.env.local</code> to require a sign-in. Until then
          every page is open to anyone who can reach the URL.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6">
        <div className="label">Vergura</div>
        <h1 className="mt-1 text-2xl">Sign in</h1>
        <p className="mt-1.5 text-sm text-muted">
          This platform spends real credits and approves real creative. Access is shared-password.
        </p>
      </div>
      <LoginForm next={next ?? "/"} />
    </div>
  );
}
