import { AboutSection } from "@/components/sections/AboutSection";
import { ApplicationSection } from "@/components/sections/ApplicationSection";
import { AudienceSection } from "@/components/sections/AudienceSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { DetailsSection } from "@/components/sections/DetailsSection";
import { ExploreSection } from "@/components/sections/ExploreSection";
import { Hero } from "@/components/sections/Hero";
import { LiveQASection } from "@/components/sections/LiveQASection";
import { ScheduleSection } from "@/components/sections/ScheduleSection";
import { SpeakersSection } from "@/components/sections/SpeakersSection";
import { WhyFinance } from "@/components/sections/WhyFinance";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <WhyFinance />
      <AboutSection />
      <ExploreSection />
      <ScheduleSection />
      <SpeakersSection />
      <LiveQASection />
      <BenefitsSection />
      <AudienceSection />
      <DetailsSection />
      <ApplicationSection />
    </main>
  );
}
