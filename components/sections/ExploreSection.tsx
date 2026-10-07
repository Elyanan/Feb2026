import { ArrowUpRight } from "lucide-react";

import { AnimatedSection, Reveal } from "@/components/motion/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { topics } from "@/config/site";

export function ExploreSection() {
  return (
    <AnimatedSection id="explore" className="section-pad bg-[var(--background)]">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="What you will explore"
            title="Finance is broader than you think."
            description="A guided route through the language, institutions, markets, decisions, and careers that shape modern business."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <Reveal key={topic.title}>
                <article className="group relative min-h-[280px] overflow-hidden border border-[var(--line)] bg-[var(--paper)] p-7 transition hover:-translate-y-1 hover:shadow-[var(--shadow)]">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${topic.accent}`} />
                  <div className="flex items-start justify-between">
                    <div className="grid h-14 w-14 place-items-center border border-[var(--line)] bg-white">
                      <Icon size={26} strokeWidth={1.6} className="text-[var(--green-700)]" />
                    </div>
                    <span className="fine">0{index + 1}</span>
                  </div>
                  <h3 className="h3 mt-12">{topic.title}</h3>
                  <p className="fine mt-5">{topic.description}</p>
                  <ArrowUpRight
                    size={18}
                    aria-hidden="true"
                    className="absolute bottom-7 right-7 text-[var(--green-700)] opacity-0 transition group-hover:opacity-100"
                  />
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}
