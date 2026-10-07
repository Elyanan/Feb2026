import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
  label: string;
  href: `#${string}`;
};

export type Stat = {
  value: number;
  label: string;
};

export type Pillar = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type Topic = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

export type ScheduleWeek = {
  title: string;
  date?: string;
  items: string[];
};

export type Speaker = {
  name: string;
  role: string;
  bio: string;
  surprise: boolean;
};

export type Detail = {
  label: string;
  value: string;
};

export type Organizer = {
  lead: string;
  clubs: string[];
  collaboration: string;
};

export type RegistrationConfig = {
  open: boolean;
  grades: string[];
  areas: string[];
};

export type ApplicationPayload = {
  fullName: string;
  grade: string;
  email: string;
  phone: string;
  motivation: string;
  area: string;
  speakerQuestion: string;
};
