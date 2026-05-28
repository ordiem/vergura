import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Disclosures",
  description:
    "Important information regarding Vergura Investment research, theses, and published commentary.",
};

const sections = [
  {
    title: "General Research Disclaimer",
    body: "All material published by Vergura Investment is research and intelligence only. Nothing herein constitutes investment advice, a recommendation, or an offer or solicitation to buy or sell any security or instrument. Capital is at risk and past performance is not indicative of future results.",
  },
  {
    title: "Forward-Looking Statements",
    body: "Theses contain forward-looking statements subject to material revision. Framework-based positioning illustrations describe the Vergura analytical approach and do not represent actual portfolio holdings or transaction recommendations.",
  },
  {
    title: "Illustrative Figures",
    body: "Charts and figures are constructed from internal desk models and are indexed and stylised for editorial clarity. They are illustrative of the analytical framework and should not be relied upon as precise forecasts.",
  },
  {
    title: "Jurisdiction",
    body: "Vergura Investment AG is domiciled in Zug, Switzerland. Published material is not directed at any person in any jurisdiction where its publication or availability would be contrary to local law or regulation.",
  },
];

export default function DisclosuresPage() {
  return (
    <div className="pt-[4.5rem]">
      <section className="border-b border-line">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:py-28">
          <Reveal>
            <div className="mb-6 flex items-center gap-3">
              <span className="font-mono text-[0.7rem] tracking-[0.2em] text-gold">
                LEGAL
              </span>
              <span className="h-px w-8 bg-[rgba(191,164,106,0.5)]" />
              <span className="label text-stone">Important Information</span>
            </div>
            <h1 className="font-serif text-[2.4rem] leading-tight text-ivory sm:text-[3rem]">
              Disclosures
            </h1>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="space-y-10">
          {sections.map((s) => (
            <Reveal as="section" key={s.title}>
              <h2 className="label mb-3 text-bronze">{s.title}</h2>
              <p className="text-[0.92rem] leading-relaxed text-stone">
                {s.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
