import type { Metadata } from "next";
import { CmsShell } from "@/components/cms/CmsShell";

export const metadata: Metadata = {
  title: "Platform — Research Cockpit",
  description:
    "The Vergura intelligence platform — a private CMS for publishing institutional investment research.",
  robots: { index: false, follow: false },
};

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CmsShell>{children}</CmsShell>;
}
