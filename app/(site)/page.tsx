import { Hero } from "@/components/site/Hero";
import { Sectors } from "@/components/site/Sectors";
import { Pillars } from "@/components/site/Pillars";
import { LatestTheses } from "@/components/site/LatestTheses";
import { ApproachCTA } from "@/components/site/ApproachCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Sectors />
      <Pillars />
      <LatestTheses />
      <ApproachCTA />
    </>
  );
}
