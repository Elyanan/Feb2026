import {
  BadgeDollarSign,
  Banknote,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ChartCandlestick,
  Compass,
  GraduationCap,
  Landmark,
  LineChart,
  Network,
  Sparkles,
  Target
} from "lucide-react";

import type {
  Detail,
  NavigationItem,
  Organizer,
  Pillar,
  RegistrationConfig,
  ScheduleWeek,
  Speaker,
  Stat,
  Topic
} from "@/types/site";
import { areas, grades } from "@/lib/validation/registration-options";

export const navigation: NavigationItem[] = [
  { label: "Program", href: "#why" },
  { label: "Experience", href: "#explore" },
  { label: "Speakers", href: "#speakers" },
  { label: "Schedule", href: "#schedule" },
  { label: "Apply", href: "#apply" }
];

export const site = {
  name: "FEB",
  fullName: "Finance, Economics & Banking",
  year: 2026,
  tagline: "FEB 2026 / Weekly sessions",
  title: "FEB 2026 - Finance, Economics & Banking",
  description:
    "A weekly program helping students explore banking, economics, finance, business, careers, and real industry conversations.",
  contact: {
    email: "ebenezer.danielye@gmail.com",
    telegram: "@Ebenezer_D_Y"
  }
};

export const organizer: Organizer = {
  lead: "Ebenezer Daniel",
  clubs: ["Yeneta Academy", "Business Club"],
  collaboration: "Career and Development Club"
};

export const stats: Stat[] = [
  { value: 4, label: "Weekly sessions" },
  { value: 6, label: "Areas explored" },
  { value: 2, label: "Industry speakers" }
];

export const pillars: Pillar[] = [
  {
    title: "Spark curiosity",
    description:
      "Show students how far finance reaches, from the bank on the corner to global markets.",
    icon: Sparkles
  },
  {
    title: "Preach finance",
    description:
      "Make the language of money, markets, and business clear and approachable for everyone.",
    icon: Landmark
  },
  {
    title: "Find your passion",
    description:
      "Help you discover whether banking, economics, finance, or business is the path for you.",
    icon: Compass
  }
];

export const details: Detail[] = [
  { label: "Program", value: "4 weekly sessions" },
  { label: "Focus", value: "Banking / Finance / Economics / Business" },
  { label: "Format", value: "Presentations / Discussions / Q&A / Guest Sessions" },
  { label: "Audience", value: "High-School Students" },
  { label: "Location", value: "Yeneta Academy, around Kore roundabout" },
  { label: "Dates", value: "[INSERT DATES]" },
  { label: "Time", value: "Once a week / [INSERT DAY & TIME]" }
];

export const topics: Topic[] = [
  {
    title: "Banking",
    description: "How banks operate, how they make money, and their role in the economy.",
    icon: Building2,
    accent: "from-emerald-500 to-lime-300"
  },
  {
    title: "Corporate Finance",
    description:
      "How companies raise capital, manage money, evaluate investments, and make financial decisions.",
    icon: BriefcaseBusiness,
    accent: "from-teal-500 to-emerald-300"
  },
  {
    title: "Economics",
    description: "How markets, businesses, governments, and consumers interact.",
    icon: Network,
    accent: "from-amber-500 to-emerald-300"
  },
  {
    title: "Financial Markets",
    description:
      "Introduction to markets, investments, stocks, bonds, and the forces that move them.",
    icon: ChartCandlestick,
    accent: "from-green-500 to-cyan-300"
  },
  {
    title: "Business",
    description: "How companies create value, compete, grow, and make strategic decisions.",
    icon: BarChart3,
    accent: "from-slate-700 to-emerald-300"
  },
  {
    title: "Careers",
    description:
      "Explore careers in banking, investment, economics, consulting, entrepreneurship, and finance.",
    icon: GraduationCap,
    accent: "from-emerald-600 to-yellow-300"
  }
];

export const schedule: ScheduleWeek[] = [
  {
    title: "The World of Banking",
    items: [
      "What banks actually do",
      "Commercial vs corporate banking",
      "How banks make money",
      "The role of banks in the economy",
      "Introduction to financial institutions"
    ]
  },
  {
    title: "Finance & Financial Markets",
    items: [
      "Financial markets",
      "Stocks and bonds",
      "Risk and return",
      "Investing fundamentals",
      "How financial markets work"
    ]
  },
  {
    title: "Business & Economics",
    items: [
      "How businesses create value",
      "Business strategy",
      "Economics fundamentals",
      "Supply and demand",
      "Decision-making in business"
    ]
  },
  {
    title: "Careers, Leadership & the Real World",
    items: [
      "Careers in banking and finance",
      "What financial professionals actually do",
      "Professional skills",
      "Industry Q&A",
      "Guest speaker session",
      "Final discussion"
    ]
  }
];

export const speakers: Speaker[] = [
  {
    name: "Surprise guest",
    surprise: true,
    role: "Corporate Banker",
    bio:
      "A working corporate banker will be in the room, ready to share firsthand insight into banks, corporate clients, career paths, and the realities of the industry. Who it is stays a surprise until the day."
  },
  {
    name: "Surprise guest",
    surprise: true,
    role: "Guest Speaker",
    bio:
      "A second distinguished guest will bring a different professional perspective on how finance and business connect. We are not saying who. You will have to be there."
  }
];

export const benefits = [
  "A foundation in banking and finance",
  "A clearer understanding of financial markets",
  "Exposure to real professionals",
  "Insight into careers in finance and business",
  "Practical business knowledge",
  "A network of ambitious students"
];

export const audience = [
  "Are curious about banking or finance",
  "Want to understand how businesses work",
  "Are interested in economics",
  "Are considering studying business, economics, or finance",
  "Want to explore professional careers",
  "Enjoy solving problems and thinking analytically",
  "Want to learn directly from industry professionals",
  "Simply want to understand how the financial world works"
];

export const registration: RegistrationConfig = {
  open: true,
  grades: [...grades],
  areas: [...areas]
};

export const heroTerms = ["BANKING", "RISK", "CAPITAL", "MARKETS", "ECONOMICS", "STRATEGY"];

export const qAndA = [
  { icon: Banknote, label: "Career reality", text: "What does the work actually feel like?" },
  { icon: LineChart, label: "Market thinking", text: "How do professionals read risk?" },
  { icon: Target, label: "Next steps", text: "Which skills should students build first?" },
  { icon: BadgeDollarSign, label: "Corporate banking", text: "How do banks serve companies?" }
];
