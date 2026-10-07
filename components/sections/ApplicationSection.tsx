import { AnimatedSection, Reveal } from "@/components/motion/AnimatedSection";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ApplicationSection() {
  return (
    <AnimatedSection id="apply" className="section-pad bg-[var(--mint-soft)]">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="Applications open"
            title="Take the first step."
            description="Your interest in finance starts here. It takes about two minutes."
            align="center"
          />
        </Reveal>
        <Reveal>
          <ApplicationForm />
        </Reveal>
      </div>
    </AnimatedSection>
  );
}
