import { Check } from "lucide-react";

import { AnimatedSection, Reveal } from "@/components/motion/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { audience } from "@/config/site";

export function AudienceSection() {
  return (
    <AnimatedSection id="fit" className="section-pad bg-[var(--mint-soft)]">
      <div className="container grid gap-12 lg:grid-cols-[0.82fr_1.18fr]">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              eyebrow="Is this for you?"
              title="Curious is enough."
              description="You do not need to know finance already. Beginners are welcome."
            />
          </div>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2">
          {audience.map((item) => (
            <Reveal key={item}>
              <div className="flex min-h-24 items-start gap-4 border border-[var(--line)] bg-[var(--paper)] p-5 transition hover:bg-white">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center border border-[var(--green-700)] text-[var(--green-700)]">
                  <Check size={16} aria-hidden="true" />
                </span>
                <p className="font-medium leading-6">{item}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
