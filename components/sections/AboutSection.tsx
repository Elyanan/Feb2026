import { AnimatedSection, Reveal } from "@/components/motion/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { details, organizer, pillars } from "@/config/site";

export function AboutSection() {
  return (
    <AnimatedSection id="about" className="section-pad bg-[var(--mint-soft)]">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="About FEB"
            title="Finance, Economics, Banking. One session a week."
            description="FEB exists to spark curiosity, spread an understanding of finance, and help students find their passion in banking, economics, finance, and business."
          />
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <Reveal key={pillar.title}>
                <article className="group min-h-80 bg-[var(--paper)] p-7 transition hover:bg-white md:p-9">
                  <div className="flex items-start justify-between gap-6">
                    <Icon className="text-[var(--green-700)] transition group-hover:-translate-y-1" size={30} strokeWidth={1.6} />
                    <span className="fine">0{index + 1}</span>
                  </div>
                  <h3 className="h3 mt-16">{pillar.title}</h3>
                  <p className="fine mt-5">{pillar.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-12 grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
          <div className="bg-[var(--background)] p-6">
            <p className="eyebrow">Idea and lead</p>
            <p className="mt-4 font-[var(--font-display)] text-2xl">{organizer.lead}</p>
          </div>
          <div className="bg-[var(--background)] p-6">
            <p className="eyebrow">Organized with</p>
            <p className="mt-4 font-[var(--font-display)] text-2xl">{organizer.clubs.join(" / ")}</p>
          </div>
          <div className="bg-[var(--background)] p-6">
            <p className="eyebrow">In collaboration with</p>
            <p className="mt-4 font-[var(--font-display)] text-2xl">{organizer.collaboration}</p>
          </div>
        </Reveal>

        <Reveal className="mt-8 grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
          {details.slice(0, 4).map((detail) => (
            <div key={detail.label} className="bg-[var(--mint-soft)] p-5">
              <p className="eyebrow">{detail.label}</p>
              <p className="mt-3 text-sm font-semibold leading-6">{detail.value}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </AnimatedSection>
  );
}
