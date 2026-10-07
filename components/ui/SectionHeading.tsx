import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  inverse?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  inverse = false
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className={inverse ? "eyebrow text-emerald-200" : "eyebrow"}>{eyebrow}</p>
      <h2 className="h2 mt-4">{title}</h2>
      {description ? (
        <p className={inverse ? "lead mt-6 text-white/72" : "lead mt-6"}>{description}</p>
      ) : null}
    </div>
  );
}
