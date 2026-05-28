export function CmsPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-9 flex flex-col gap-5 border-b border-line pb-7 md:flex-row md:items-end md:justify-between">
      <div>
        <span className="label text-gold">{eyebrow}</span>
        <h1 className="mt-3 font-serif text-[2rem] leading-tight text-ivory">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-silver">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
