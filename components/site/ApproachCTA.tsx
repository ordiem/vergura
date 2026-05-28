import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export function ApproachCTA() {
  return (
    <section
      id="approach"
      className="relative overflow-hidden border-t border-line py-28 lg:py-36"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(191,164,106,0.07),transparent_70%)]" />
        <div className="absolute inset-0 grid-texture opacity-30" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
        <Reveal>
          <span className="label text-gold">The Vergura Approach</span>
        </Reveal>
        <Reveal delay={80}>
          <blockquote className="mt-8 font-serif text-[2.1rem] leading-[1.2] text-ivory sm:text-[3rem] sm:leading-[1.15]">
            “Capital rewards clarity
            <br className="hidden sm:block" /> before consensus.”
          </blockquote>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-stone">
            Macro intelligence, structured for conviction. Research released with
            discipline — for market notes, long-form reports, and strategic asset
            commentary.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/theses"
              className="group inline-flex items-center justify-center gap-2 bg-ivory px-7 py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:bg-champagne"
            >
              Read Theses
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="mailto:contact@vergura.investment"
              className="inline-flex items-center justify-center border border-[rgba(191,164,106,0.5)] px-7 py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] text-champagne transition-all duration-300 hover:border-gold hover:bg-[rgba(191,164,106,0.07)]"
            >
              Get in Contact ↗
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
