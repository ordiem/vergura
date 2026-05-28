import { Reveal } from "@/components/Reveal";

export function SectionHeader({
  index,
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal
      className={`flex flex-col ${
        align === "center" ? "items-center text-center" : "items-start"
      }`}
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="font-mono text-[0.7rem] tracking-[0.2em] text-gold">
          {index}
        </span>
        <span className="h-px w-8 bg-[rgba(191,164,106,0.5)]" />
        <span className="label text-stone">{eyebrow}</span>
      </div>
      <h2 className="max-w-3xl font-serif text-[2rem] leading-[1.12] text-ivory sm:text-[2.6rem]">
        {title}
      </h2>
      {intro && (
        <p
          className={`mt-5 max-w-2xl text-base leading-relaxed text-stone ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {intro}
        </p>
      )}
    </Reveal>
  );
}
