import { z } from "zod";
import { areas, grades } from "./registration-options";

export const applicationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120, "Use 120 characters or fewer."),
  grade: z.string().refine(value => grades.some(grade => grade === value), "Select your grade."),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email, like name@example.com.").max(254, "Use an email address with 254 characters or fewer.")),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a phone number with at least 7 digits.").max(30, "Use a phone number with 30 characters or fewer.")
    .refine((value) => /^[+\d\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15, {
      message: "Enter a phone number with 7 to 15 digits."
    }),
  motivation: z.string().trim().min(20, "Write at least a sentence or two (20+ characters).").max(3000, "Use 3,000 characters or fewer."),
  area: z.string().refine(value => areas.some(area => area === value), "Choose the area that interests you most."),
  speakerQuestion: z
    .string()
    .trim()
    .min(10, "Write the question you would ask the corporate banker (10+ characters).")
    .max(1500, "Use 1,500 characters or fewer.")
});

export const registrationRequestSchema = applicationSchema.extend({
  website: z.string().max(200).default(""),
  formToken: z.string().min(1).max(512)
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
