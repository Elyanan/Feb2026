"use client";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";

export const studioConfigured = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_DATASET);
export default defineConfig({
  name: "feb-registrations", title: "FEB Registrations", basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "unconfigured",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "registrations",
  plugins: [structureTool()], schema: { types: schemaTypes },
  document: { actions: previous => previous.filter(action => action.action !== "duplicate") }
});
