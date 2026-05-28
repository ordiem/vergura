import { CmsPageHeader } from "@/components/cms/CmsPageHeader";
import { authors, reports } from "@/lib/content";

export default function AuthorsPage() {
  const enriched = authors.map((a) => {
    const own = reports.filter((r) => r.authorId === a.id);
    return {
      ...a,
      count: own.length,
      reads: own.reduce((s, r) => s + r.views, 0),
    };
  });

  return (
    <div>
      <CmsPageHeader
        eyebrow="Configuration"
        title="Authors & Desks"
        description="The research desk and its contributors. Each report is attributed to an author and a desk for editorial accountability."
      />

      <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2">
        {enriched.map((a) => (
          <div key={a.id} className="bg-ink p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(191,164,106,0.4)] font-mono text-[0.78rem] text-champagne">
                  {a.initials}
                </span>
                <div className="leading-tight">
                  <div className="font-serif text-[1.15rem] text-ivory">
                    {a.name}
                  </div>
                  <div className="mt-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-silver">
                    {a.role}
                  </div>
                </div>
              </div>
              <span className="label text-gold">{a.desk.split(" ")[0]}</span>
            </div>
            <p className="mt-4 text-[0.85rem] leading-relaxed text-stone">
              {a.bio}
            </p>
            <div className="mt-5 flex items-center gap-6 border-t border-line pt-4">
              <div>
                <div className="font-serif text-xl text-ivory tnum">
                  {a.count}
                </div>
                <div className="label text-[0.55rem] text-silver">Reports</div>
              </div>
              <div>
                <div className="font-serif text-xl text-ivory tnum">
                  {a.reads.toLocaleString()}
                </div>
                <div className="label text-[0.55rem] text-silver">Reads</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
