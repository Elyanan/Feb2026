import { LockKeyhole, MessagesSquare } from "lucide-react";

import { AnimatedSection, Reveal } from "@/components/motion/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { speakers } from "@/config/site";

export function SpeakersSection() {
  return (
    <AnimatedSection id="speakers" className="section-pad bg-[var(--background)]">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="Surprise guests"
            title="Two guests. No names yet."
            description="From the classroom to the boardroom: two professionals will join FEB in person. We are keeping their identities a secret until the day, and all we will say is that you will want to be there."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {speakers.map((speaker, index) => (
            <Reveal key={`${speaker.role}-${index}`}>
              <article className="group overflow-hidden border border-[var(--line)] bg-[var(--paper)]">
                <div className="relative grid aspect-[1.25] place-items-center overflow-hidden bg-[var(--forest)] text-white">
                  <div className="absolute inset-0 opacity-45">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:44px_44px]" />
                  </div>
                  <div className="absolute inset-x-8 top-8 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-white/58">
                    <span>Profile locked</span>
                    <LockKeyhole size={18} aria-hidden="true" />
                  </div>
                  <div className="relative grid h-32 w-32 place-items-center border border-white/20 bg-white/5 backdrop-blur">
                    <span className="font-[var(--font-display)] text-7xl">?</span>
                  </div>
                </div>
                <div className="p-7 md:p-9">
                  <p className="eyebrow">{speaker.role}</p>
                  <h3 className="h3 mt-4">{speaker.name}</h3>
                  <span className="mt-4 inline-flex items-center gap-2 border border-dashed border-[var(--line-strong)] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--stone)]">
                    <MessagesSquare size={14} aria-hidden="true" /> Identity revealed on the day
                  </span>
                  <p className="fine mt-6">{speaker.bio}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
