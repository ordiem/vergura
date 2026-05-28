import { CmsPageHeader } from "@/components/cms/CmsPageHeader";
import { ReportEditor } from "@/components/cms/ReportEditor";

export default function NewReportPage() {
  return (
    <div>
      <CmsPageHeader
        eyebrow="Compose"
        title="New Report"
        description="From thesis formation to published insight. Draft, tag, and release with discipline."
      />
      <ReportEditor />
    </div>
  );
}
