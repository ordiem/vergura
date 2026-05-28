import { CmsPageHeader } from "@/components/cms/CmsPageHeader";
import { reports } from "@/lib/content";

const standard = [
  {
    title: "General Research Disclaimer",
    body: "All material published by Vergura Investment is research and intelligence only. Nothing herein constitutes investment advice, a recommendation, or an offer or solicitation to buy or sell any security or instrument. Capital is at risk.",
  },
  {
    title: "Forward-Looking Statements",
    body: "Reports contain forward-looking statements subject to material revision. Framework-based positioning illustrations describe the Vergura analytical approach and do not represent actual portfolio holdings or transaction recommendations.",
  },
  {
    title: "Illustrative Figures",
    body: "Charts and figures are constructed from desk models and are indexed and stylised for editorial clarity. They are illustrative of the analytical framework and should not be relied upon as precise forecasts.",
  },
];

export default function DisclosuresPage() {
  return (
    <div>
      <CmsPageHeader
        eyebrow="Configuration"
        title="Disclosures"
        description="Standard compliance language and the per-report risk disclosure attached at release."
      />

      <section className="space-y-px border border-line bg-line">
        {standard.map((d) => (
          <div key={d.title} className="bg-ink p-6">
            <h2 className="label mb-3 text-bronze">{d.title}</h2>
            <p className="max-w-3xl text-[0.86rem] leading-relaxed text-stone">
              {d.body}
            </p>
          </div>
        ))}
      </section>

      <h2 className="mb-4 mt-10 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-silver">
        Per-Report Disclosures
      </h2>
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[40rem] border-collapse">
          <thead>
            <tr className="border-b border-line bg-charcoal/40 text-left">
              <th className="px-4 py-3 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-silver">
                Code
              </th>
              <th className="px-4 py-3 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-silver">
                Report
              </th>
              <th className="px-4 py-3 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-silver">
                Disclosure
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.slug} className="border-b border-line last:border-0">
                <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[0.64rem] text-gold tnum">
                  {r.code}
                </td>
                <td className="px-4 py-3.5 font-sans text-[0.8rem] text-ivory">
                  {r.title}
                </td>
                <td className="px-4 py-3.5 text-[0.74rem] leading-relaxed text-silver">
                  {r.riskDisclosure}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
