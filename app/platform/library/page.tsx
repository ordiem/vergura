import Link from "next/link";
import { CmsPageHeader } from "@/components/cms/CmsPageHeader";
import { ReportTable } from "@/components/cms/ReportTable";
import { reports, type Status } from "@/lib/content";

const valid: (Status | "All")[] = [
  "All",
  "Released",
  "Scheduled",
  "Draft",
  "Archived",
];

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const initialStatus = (valid as string[]).includes(sp.status ?? "")
    ? (sp.status as Status | "All")
    : "All";

  return (
    <div>
      <CmsPageHeader
        eyebrow="Pipeline"
        title="Research Library"
        description="Every report across the desk — filter by status, search by title or code, and manage releases."
        action={
          <Link
            href="/platform/new"
            className="inline-flex items-center gap-2 bg-ivory px-5 py-2.5 font-sans text-[0.72rem] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-champagne"
          >
            + New Report
          </Link>
        }
      />
      <ReportTable reports={reports} initialStatus={initialStatus} />
    </div>
  );
}
