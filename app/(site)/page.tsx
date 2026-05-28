import { Hero } from "@/components/site/Hero";
import { LatestResearch } from "@/components/site/LatestResearch";
import { Pillars } from "@/components/site/Pillars";
import { DataSystems } from "@/components/site/DataSystems";
import { PlatformPreview } from "@/components/site/PlatformPreview";
import { ApproachCTA } from "@/components/site/ApproachCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LatestResearch />
      <Pillars />
      <DataSystems />
      <PlatformPreview />
      <ApproachCTA />
    </>
  );
}
