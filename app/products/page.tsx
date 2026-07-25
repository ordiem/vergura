import type { Metadata } from "next";
import { requireSession } from "@/lib/auth-actions";
import { isDbConfigured } from "@/lib/db/client";
import { listPresets } from "@/lib/db/queries";
import { listProducts } from "@/lib/db/rip-queries";
import { SetupNotice } from "@/components/SetupNotice";
import { ProductForm } from "@/components/rip/ProductForm";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  await requireSession();
  if (!isDbConfigured()) return <SetupNotice />;

  const [products, presets] = await Promise.all([listProducts(), listPresets()]);

  return (
    <div className="space-y-6">
      <header>
        <div className="label">Products</div>
        <h1 className="mt-1 text-2xl">What you rip onto</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          A saved product carries its own reference images and brand rules, so any ad you rip can be
          translated onto it without re-explaining what it is.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
        <ProductForm presets={presets} />

        <div className="space-y-3">
          <div className="label">Saved · {products.length}</div>
          {products.length === 0 ? (
            <p className="panel p-4 text-sm text-muted">None yet.</p>
          ) : (
            products.map((p) => (
              <div key={p.id} className="panel p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm">{p.name}</span>
                  {p.preset_id ? <span className="chip text-accent">▪ preset</span> : null}
                </div>
                {p.description ? (
                  <p className="mt-1.5 text-xs text-muted">{p.description}</p>
                ) : null}
                {p.brand_notes ? (
                  <p className="mt-1 text-xs text-faint">Rules: {p.brand_notes}</p>
                ) : null}
                {p.images.length > 0 ? (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {p.images.map((i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i.id}
                        src={i.url}
                        alt=""
                        className="h-14 w-14 rounded border border-line object-cover"
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
