import { CalendarDays, Clock, MapPin } from "lucide-react";

import { AnimatedSection, Reveal } from "@/components/motion/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { details } from "@/config/site";

export function DetailsSection() {
  const featureIcons = { Location: MapPin, Dates: CalendarDays, Time: Clock };

  return (
    <AnimatedSection className="section-pad bg-[var(--background)]">
      <div className="container">
        <Reveal>
          <SectionHeading eyebrow="Program details" title="Everything important, easy to scan." />
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
          {details.map((detail) => {
            const Icon = featureIcons[detail.label as keyof typeof featureIcons];
            return (
              <Reveal key={detail.label}>
                <article className="min-h-36 bg-[var(--paper)] p-6">
                  {Icon ? <Icon className="mb-8 text-[var(--green-700)]" size={24} strokeWidth={1.7} /> : null}
                  <p className="eyebrow">{detail.label}</p>
                  <p className="mt-3 font-semibold leading-6">{detail.value}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}
