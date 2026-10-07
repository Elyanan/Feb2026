import { AnimatedSection, Reveal } from "@/components/motion/AnimatedSection";
import { ScheduleAccordion } from "@/components/sections/ScheduleAccordion";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ScheduleSection() {
  return (
    <AnimatedSection id="schedule" className="section-pad bg-[var(--paper)]">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="Four sessions, one progression"
            title="From how banks work to how careers begin."
          />
        </Reveal>
        <Reveal>
          <ScheduleAccordion />
        </Reveal>
      </div>
    </AnimatedSection>
  );
}
