import { AnimatedCounter } from "@/components/sections/AnimatedCounter";
import { AnimatedSection, Reveal } from "@/components/motion/AnimatedSection";
import { stats } from "@/config/site";

export function WhyFinance() {
  return (
    <AnimatedSection id="why" className="section-pad bg-[var(--paper)]">
      <div className="container">
        <Reveal>
          <p className="eyebrow">Why finance?</p>
          <p className="mt-5 max-w-5xl font-[var(--font-display)] text-[clamp(2.1rem,5.6vw,6.4rem)] font-medium leading-[0.98] tracking-normal">
            Every company. Every market. Every investment. Every major business decision is
            connected to <span className="text-[var(--green-700)]">finance</span>.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="h-full border-l border-[var(--line)] pl-6">
              <p className="fine max-w-sm">
                FEB begins before specialization, giving curious students a sharper first map of
                the financial world.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <p className="lead max-w-3xl">
              Finance shapes which businesses get built, which careers open up, and how economies
              grow. Most students first meet it at university or at work. This program lets you
              understand it before then, from the people who work in it every day.
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-16 grid border-y border-[var(--line)] sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="border-b border-[var(--line)] py-7 pr-6 sm:border-b-0 sm:border-r last:sm:border-r-0">
              <AnimatedCounter value={stat.value} />
              <p className="fine mt-2">{stat.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </AnimatedSection>
  );
}
