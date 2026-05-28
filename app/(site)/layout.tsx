import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HalftoneBackdrop } from "@/components/HalftoneBackdrop";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HalftoneBackdrop />
      <SiteNav />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
    </>
  );
}
