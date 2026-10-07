import { AnimatedSection, Reveal } from "@/components/motion/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { benefits } from "@/config/site";

export function BenefitsSection() {
  return (
    <AnimatedSection className="section-pad bg-[var(--paper)]">
      <div className="container">
        <Reveal>
          <SectionHeading eyebrow="What you will walk away with" title="Six things you keep after week four." />
        </Reveal>
        <div className="mt-12 grid gap-x-12 md:grid-cols-2">
          {benefits.map((benefit, index) => (
            <Reveal key={benefit}>
              <article className="grid grid-cols-[4rem_1fr] border-t border-[var(--line)] py-7">
                <span className="font-[var(--font-display)] text-3xl text-[var(--green-700)]">
                  0{index + 1}
                </span>
                <p className="font-[var(--font-display)] text-[clamp(1.45rem,2.4vw,2.35rem)] leading-tight">
                  {benefit}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
