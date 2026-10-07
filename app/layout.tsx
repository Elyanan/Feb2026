import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";

import { site } from "@/config/site";
import "./globals.css";

const display = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  display: "swap"
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://feb-2026.local"),
  title: {
    default: site.title,
    template: `%s | ${site.name} ${site.year}`
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    siteName: `${site.name} ${site.year}`
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbfdf8",
  colorScheme: "light"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a
          href="#main"
          className="fixed left-4 top-[-80px] z-[100] rounded-[var(--radius)] bg-[var(--green-700)] px-4 py-3 text-sm font-bold text-white transition focus:top-4"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
