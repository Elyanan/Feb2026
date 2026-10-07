"use client";
import { NextStudio } from "next-sanity/studio";
import config, { studioConfigured } from "@/sanity/sanity.config";
export default function Studio() {
  if (!studioConfigured) return <main id="main" className="relative z-[60] min-h-screen bg-white px-8 py-24"><h1 className="h2">Studio setup required</h1><p className="mt-4">Configure the Sanity project and private dataset in .env.local, then restart the server.</p></main>;
  return <div id="main" className="fixed inset-0 z-[60] bg-white"><NextStudio config={config} /></div>;
}
