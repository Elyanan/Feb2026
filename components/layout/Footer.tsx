import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { navigation, organizer, site } from "@/config/site";

export function Footer() {
  const telegramHandle = site.contact.telegram.replace("@", "");

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--paper)]">
      <div className="container grid gap-12 py-14 md:grid-cols-[1.5fr_0.7fr_0.8fr]">
        <div>
          <p className="font-[var(--font-display)] text-3xl font-semibold">{site.name} {site.year}</p>
          <p className="lead mt-4 max-w-xl text-base">
            FEB 2026: an introduction to finance, economics, banking and business.
          </p>
          <p className="fine mt-4 max-w-xl">
            Led by {organizer.lead} ({organizer.clubs.join(", ")}), in collaboration with{" "}
            {organizer.collaboration}.
          </p>
          <Link className="btn btn-primary mt-7" href="#apply">
            Apply now
          </Link>
        </div>

        <nav aria-label="Footer navigation">
          <p className="eyebrow">Explore</p>
          <ul className="mt-5 grid gap-3">
            {navigation.slice(0, 4).map((item) => (
              <li key={item.href}>
                <Link className="fine hover:text-[var(--green-700)]" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow">Contact</p>
          <p className="fine mt-5">
            If you have any problems or questions, please feel free to contact:
          </p>
          <div className="mt-4 grid gap-3">
            <a
              className="inline-flex items-center gap-2 text-sm font-semibold hover:text-[var(--green-700)]"
              href={`https://t.me/${telegramHandle}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              Telegram: {site.contact.telegram} <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <a
              className="inline-flex items-center gap-2 text-sm font-semibold hover:text-[var(--green-700)]"
              href={`mailto:${site.contact.email}`}
            >
              Email: {site.contact.email} <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      <div className="container border-t border-[var(--line)] py-5 text-sm text-[var(--stone)]">
        © {site.year} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
